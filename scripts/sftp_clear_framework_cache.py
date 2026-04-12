#!/usr/bin/env python3
"""
Delete Laravel file-cache contents on the server over SFTP (no SSH shell required).

Clears storage/framework/cache/data under the deployed app root. This resets
HTTP rate limiters (e.g. "Too Many Attempts" on POST /api/auth/login) when
CACHE_STORE=file.

  python scripts/sftp_clear_framework_cache.py
  python scripts/sftp_clear_framework_cache.py --dry-run

Uses secrets/sftp.env like scripts/sftp_deploy.py (SFTP_APP_DIR empty = Layout A).
"""

from __future__ import annotations

import argparse
import importlib.util
import stat
import time
from pathlib import Path


def _load_sftp_deploy(repo: Path):
    path = repo / "scripts" / "sftp_deploy.py"
    spec = importlib.util.spec_from_file_location("sftp_deploy", path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _rm_rf(sftp, remote_path: str, *, dry_run: bool, depth: int = 0) -> tuple[int, int]:
    """Remove remote file or directory tree. Returns (files_removed, dirs_removed)."""
    if depth > 200:
        raise SystemExit(f"Refusing very deep tree at {remote_path!r}")
    files_r = dirs_r = 0
    try:
        st = sftp.stat(remote_path)
    except OSError:
        return 0, 0
    mode = getattr(st, "st_mode", 0) or 0
    if stat.S_ISDIR(mode):
        try:
            names = [a.filename for a in sftp.listdir_attr(remote_path)]
        except OSError:
            return 0, 0
        for name in names:
            if name in (".", ".."):
                continue
            child = f"{remote_path.rstrip('/')}/{name}"
            fr, dr = _rm_rf(sftp, child, dry_run=dry_run, depth=depth + 1)
            files_r += fr
            dirs_r += dr
        if dry_run:
            print(f"  rmdir {remote_path}", flush=True)
        else:
            sftp.rmdir(remote_path)
        dirs_r += 1
        return files_r, dirs_r
    if dry_run:
        print(f"  rm {remote_path}", flush=True)
    else:
        sftp.remove(remote_path)
    return 1, 0


def main() -> None:
    p = argparse.ArgumentParser(description="Clear Laravel framework file cache via SFTP.")
    p.add_argument("--dry-run", action="store_true", help="List what would be deleted only.")
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[1]
    sd = _load_sftp_deploy(repo)
    cfg_path = sd.resolve_config_path(repo, None)
    raw = sd.load_config(cfg_path)
    host, user, password, port = sd.normalize_connection(raw)
    app_dir = str(raw.get("SFTP_APP_DIR", "koon-hosting") or "").strip()
    remote_home_ov = raw.get("SFTP_REMOTE_HOME", "").strip() or None

    paramiko = sd._load_paramiko()
    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    if sftp is None:
        transport.close()
        raise SystemExit("SFTP failed")

    dry = bool(args.dry_run)
    try:
        home = sd.detect_home(sftp, user, remote_home_ov)
        remote_app = home if app_dir == "" else sd.remote_join(home, app_dir)
        cache_data = sd.remote_join(remote_app, "storage", "framework", "cache", "data")
        print(f"Remote Laravel: {remote_app}", flush=True)
        print(f"Target:         {cache_data}", flush=True)
        if dry:
            print("DRY RUN — no deletes", flush=True)

        try:
            sftp.stat(cache_data)
        except OSError:
            print("Path does not exist (nothing to clear).", flush=True)
            return

        if dry:
            fr, dr = _rm_rf(sftp, cache_data, dry_run=True)
            print(f"Would remove under {cache_data} (walk printed above).", flush=True)
            return

        # Prefer renaming the whole tree (fast on cPanel); fall back to recursive delete.
        trash = f"{cache_data.rstrip('/')}.trash.{int(time.time())}"
        try:
            sftp.rename(cache_data, trash)
            sftp.mkdir(cache_data)
            gi = f"{cache_data.rstrip('/')}/.gitignore"
            with sftp.open(gi, "w") as gf:
                gf.write(b"*\n!.gitignore\n")
            print(f"Renamed cache data to {trash} and recreated empty {cache_data}/", flush=True)
            print("(You may delete the .trash.* folder later in File Manager if desired.)", flush=True)
        except OSError:
            print("Rename not supported or failed; falling back to slow recursive delete…", flush=True)
            fr, dr = _rm_rf(sftp, cache_data, dry_run=False)
            try:
                sftp.mkdir(cache_data)
            except OSError:
                pass
            gi = f"{cache_data.rstrip('/')}/.gitignore"
            with sftp.open(gi, "w") as gf:
                gf.write(b"*\n!.gitignore\n")
            print(f"Removed {fr} file(s) and {dr} director(ies); recreated {cache_data}/ + .gitignore", flush=True)
    finally:
        sftp.close()
        transport.close()


if __name__ == "__main__":
    main()

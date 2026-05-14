#!/usr/bin/env python3
"""
Create the public web `storage` symlink over SFTP (no SSH shell required).

Equivalent to `php artisan storage:link`: makes `{web_root}/storage` -> Laravel
`storage/app/public` so `/storage/cms/...` URLs resolve.

Uses secrets/sftp.env like scripts/sftp_deploy.py (SFTP_APP_DIR, SFTP_PUBLIC_DIR,
SFTP_REMOTE_HOME).

  pip install paramiko
  python scripts/sftp_storage_symlink.py
  python scripts/sftp_storage_symlink.py --dry-run

If this fails (host forbids SFTP symlinks), use cPanel File Manager "Create
symbolic link" or enable SSH and run scripts/ssh_storage_link.py.
"""

from __future__ import annotations

import argparse
import importlib.util
import stat
import sys
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


def _resolve_app_dir(raw: dict[str, str]) -> str:
    if "SFTP_APP_DIR" in raw:
        return str(raw.get("SFTP_APP_DIR") or "").strip()
    return "koon-hosting"


def _norm_posix(p: str) -> str:
    return p.rstrip("/")


def main() -> None:
    p = argparse.ArgumentParser(description="Create public/storage symlink via SFTP (no SSH shell).")
    p.add_argument("--dry-run", action="store_true", help="Print actions only.")
    p.add_argument(
        "--move-aside-existing-dir",
        action="store_true",
        help="If web_root/storage is a real directory, rename it to storage.__bak.<timestamp> "
        "then create the symlink (use when a mistaken copy blocks storage:link).",
    )
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[1]
    sd = _load_sftp_deploy(repo)
    cfg_path = sd.resolve_config_path(repo, None)
    raw = sd.load_config(cfg_path)
    host, user, password, port = sd.normalize_connection(raw)
    app_dir = _resolve_app_dir(raw)
    pub_dir = str(raw.get("SFTP_PUBLIC_DIR", "public_html") or "").strip() or "public_html"
    remote_home_ov = raw.get("SFTP_REMOTE_HOME", "").strip() or None

    paramiko = sd._load_paramiko()
    transport = paramiko.Transport((host, port))
    transport.banner_timeout = 60
    transport.auth_timeout = 60
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    if sftp is None:
        transport.close()
        raise SystemExit("SFTP failed")

    dry = bool(args.dry_run)
    try:
        home = sd.detect_home(sftp, user, remote_home_ov)
        remote_app = home if app_dir == "" else sd.remote_join(home, app_dir)
        remote_web = sd.remote_join(home, pub_dir)
        target = sd.remote_join(remote_app, "storage", "app", "public")
        link = sd.remote_join(remote_web, "storage")

        print(f"Remote Laravel: {remote_app}", flush=True)
        print(f"Web root:       {remote_web}", flush=True)
        print(f"Link target:    {target}", flush=True)
        print(f"Symlink path:   {link}", flush=True)

        try:
            sftp.stat(target)
        except OSError:
            raise SystemExit(
                f"Target directory does not exist: {target}\n"
                "Fix SFTP_APP_DIR / SFTP_REMOTE_HOME or create storage/app/public on the server."
            ) from None

        try:
            st = sftp.lstat(link)
        except OSError:
            st = None

        if st is not None:
            mode = int(getattr(st, "st_mode", 0) or 0)
            if stat.S_ISLNK(mode):
                try:
                    cur = sftp.readlink(link)
                except OSError:
                    cur = "?"
                cur_n = _norm_posix(cur)
                tgt_n = _norm_posix(target)
                if cur_n == tgt_n or cur_n.endswith("/storage/app/public"):
                    print("Symlink already points at storage/app/public — nothing to do.", flush=True)
                    return
                print(f"Replacing existing symlink (was -> {cur!r}).", flush=True)
                if not dry:
                    sftp.unlink(link)
            elif stat.S_ISDIR(mode):
                if not args.move_aside_existing_dir:
                    try:
                        names = [a.filename for a in sftp.listdir_attr(link)]
                    except OSError:
                        names = []
                    preview = ", ".join(sorted(names)[:20])
                    if len(names) > 20:
                        preview += ", …"
                    raise SystemExit(
                        f"{link} exists as a real directory (contents: {preview or '(empty)'}).\n"
                        "Remove or rename it in File Manager, then re-run — or pass "
                        "--move-aside-existing-dir to rename it to storage.__bak.<timestamp> first."
                    )
                aside = f"{link.rstrip('/')}.__bak.{int(time.time())}"
                print(f"Moving aside directory -> {aside}", flush=True)
                if not dry:
                    sftp.rename(link, aside)
                st = None
            else:
                print(f"Removing existing file at {link}.", flush=True)
                if not dry:
                    sftp.remove(link)

        if dry:
            print("DRY RUN: would create symlink.", flush=True)
            return

        sftp.symlink(target, link)
        print("Created symlink: public web storage -> storage/app/public", flush=True)
    finally:
        sftp.close()
        transport.close()


if __name__ == "__main__":
    main()

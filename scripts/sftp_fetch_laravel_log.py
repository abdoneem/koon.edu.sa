#!/usr/bin/env python3
"""
Download the tail of storage/logs/laravel.log via SFTP (works when SSH shell is disabled).

  python scripts/sftp_fetch_laravel_log.py
  python scripts/sftp_fetch_laravel_log.py --bytes 200000

Uses the same secrets/sftp.env as scripts/sftp_deploy.py.
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path


def _load_sftp_deploy(repo: Path):
    path = repo / "scripts" / "sftp_deploy.py"
    spec = importlib.util.spec_from_file_location("sftp_deploy", path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main() -> None:
    p = argparse.ArgumentParser(description="Tail laravel.log via SFTP.")
    p.add_argument("--bytes", type=int, default=120_000, help="Max bytes to read from end of log")
    p.add_argument("--config", type=Path, default=None)
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[1]
    sd = _load_sftp_deploy(repo)
    cfg_path = sd.resolve_config_path(repo, args.config)
    raw = sd.load_config(cfg_path)
    host, user, password, port = sd.normalize_connection(raw)

    app_dir = str(raw.get("SFTP_APP_DIR", "koon-hosting") or "").strip()
    remote_home_ov = raw.get("SFTP_REMOTE_HOME", "").strip() or None

    print(f"SFTP {user}@{host}:{port} …", flush=True)
    paramiko = sd._load_paramiko()
    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    if sftp is None:
        transport.close()
        raise SystemExit("SFTP failed")

    try:
        home = sd.detect_home(sftp, user, remote_home_ov)
        remote_app = home if app_dir == "" else sd.remote_join(home, app_dir)
        candidates = [
            f"{remote_app}/storage/logs/laravel.log",
            f"{sd.remote_join(home, 'koon-hosting')}/storage/logs/laravel.log",
            f"{home}/storage/logs/laravel.log",
        ]
        seen: set[str] = set()
        paths = [x for x in candidates if x not in seen and not seen.add(x)]

        chosen = None
        for log_path in paths:
            try:
                sftp.stat(log_path)
                chosen = log_path
                break
            except OSError:
                continue

        if chosen is None:
            print("Could not find laravel.log at:", file=sys.stderr)
            for log_path in paths:
                print(f"  - {log_path}", file=sys.stderr)
            raise SystemExit(1)

        print(f"Reading: {chosen} (last {args.bytes} bytes max)\n", flush=True)
        st = sftp.stat(chosen)
        size = int(st.st_size)
        with sftp.open(chosen, "rb") as rf:
            if size > args.bytes:
                rf.seek(max(0, size - args.bytes))
            body = rf.read()
        text = body.decode("utf-8", errors="replace")
        if size > args.bytes and text and not text.startswith("\n"):
            print("… (file truncated at start) …\n")
        print(text, end="" if text.endswith("\n") else text + "\n")
    finally:
        sftp.close()
        transport.close()


if __name__ == "__main__":
    main()

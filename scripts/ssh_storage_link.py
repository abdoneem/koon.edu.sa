#!/usr/bin/env python3
"""
Run `php artisan storage:link --force` on the production server over SSH.

Uses the same credentials and Laravel path rules as scripts/sftp_deploy.py
(secrets/sftp.env: SFTP_HOST, SFTP_USER, SFTP_PASS, SFTP_PORT, SFTP_APP_DIR,
SFTP_REMOTE_HOME).

  pip install paramiko
  python scripts/ssh_storage_link.py
  .\\scripts.ps1 -Action ssh-storage-link

If SSH shell access is disabled, use cPanel Terminal or run storage:link there.
"""

from __future__ import annotations

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


def _posix_single_quote(s: str) -> str:
    """Quote for a POSIX single-quoted string."""
    return "'" + s.replace("'", "'\"'\"'") + "'"


def _resolve_app_dir(raw: dict[str, str]) -> str:
    """Match sftp_deploy: explicit SFTP_APP_DIR= empty => home root; key absent => koon-hosting."""
    if "SFTP_APP_DIR" in raw:
        return str(raw.get("SFTP_APP_DIR") or "").strip()
    return "koon-hosting"


def main() -> None:
    repo = Path(__file__).resolve().parents[1]
    sd = _load_sftp_deploy(repo)
    cfg_path = sd.resolve_config_path(repo, None)
    raw = sd.load_config(cfg_path)
    host, user, password, port = sd.normalize_connection(raw)
    app_dir = _resolve_app_dir(raw)
    remote_home_ov = raw.get("SFTP_REMOTE_HOME", "").strip() or None

    paramiko = sd._load_paramiko()
    transport = paramiko.Transport((host, port))
    transport.banner_timeout = 60
    transport.auth_timeout = 60
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    if sftp is None:
        transport.close()
        raise SystemExit("SFTP session failed (cannot resolve home path).")
    try:
        home = sd.detect_home(sftp, user, remote_home_ov)
    finally:
        sftp.close()
        transport.close()

    remote_app = home if app_dir == "" else sd.remote_join(home, app_dir)
    print(f"Laravel root: {remote_app}", flush=True)
    print(f"Connecting SSH {user}@{host}:{port} …", flush=True)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            hostname=host,
            port=port,
            username=user,
            password=password,
            timeout=45,
            banner_timeout=45,
            auth_timeout=45,
        )
    except Exception as e:
        print(f"SSH connect failed: {e}", file=sys.stderr)
        raise SystemExit(2) from e

    inner = (
        f"set -e; cd {_posix_single_quote(remote_app)}; "
        "test -f artisan || { echo 'No artisan in this directory.' >&2; exit 1; }; "
        "php artisan storage:link --force; "
        "echo '--- public/storage ---'; "
        "ls -la public/storage | head -25"
    )
    remote_cmd = f"bash -lc {_posix_single_quote(inner)}"
    stdin, stdout, stderr = client.exec_command(remote_cmd, timeout=120)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    exit_status = stdout.channel.recv_exit_status()
    client.close()
    print(out, end="" if out.endswith("\n") else out + "\n")
    if err.strip():
        print(err, file=sys.stderr)
    combined = (out + err).lower()
    if "shell access is not enabled" in combined:
        print(
            "Host returned: shell access disabled. Use cPanel Terminal, or run:\n"
            "  python scripts/sftp_storage_symlink.py\n"
            "to create the same symlink over SFTP (no shell).",
            file=sys.stderr,
        )
        raise SystemExit(3)
    if exit_status != 0:
        raise SystemExit(exit_status)


if __name__ == "__main__":
    main()

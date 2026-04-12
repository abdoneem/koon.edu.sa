#!/usr/bin/env python3
"""
SSH diagnostics using the same host/user/password as secrets/sftp.env (cPanel: often same as SFTP).

  python scripts/ssh_diagnose_server.py

Requires: pip install paramiko
If SSH is disabled for the account, this will fail — use cPanel Terminal or Error Log instead.
"""

from __future__ import annotations

import sys
from pathlib import Path


def _parse_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        k = key.strip().upper()
        v = val.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        out[k] = v
    return out


def main() -> None:
    repo = Path(__file__).resolve().parents[1]
    cfg = repo / "secrets" / "sftp.env"
    if not cfg.is_file():
        print(f"Missing {cfg}", file=sys.stderr)
        sys.exit(1)
    raw = _parse_env(cfg)
    host = raw.get("SFTP_HOST", "").strip()
    user = raw.get("SFTP_USER", "").strip()
    password = raw.get("SFTP_PASS", raw.get("SFTP_PASSWORD", "")).strip()
    port = int(raw.get("SFTP_PORT", "22") or "22")
    if not host or not user or not password:
        print("sftp.env must define SFTP_HOST, SFTP_USER, SFTP_PASS", file=sys.stderr)
        sys.exit(1)

    try:
        import paramiko
    except ImportError:
        print("pip install paramiko", file=sys.stderr)
        sys.exit(1)

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
        sys.exit(2)

    remote = r"""bash -lc '
set +e
for d in "$HOME/koon-hosting" "$HOME"; do
  if [ -f "$d/artisan" ]; then
    echo "=== Laravel dir: $d ==="
    cd "$d"
    break
  fi
done
if [ ! -f artisan ]; then
  echo "No artisan in ~/koon-hosting or ~ — check SFTP layout (HOSTING.txt)."
  exit 0
fi
pwd
echo "=== .env ==="
if [ -f .env ]; then echo "present"; else echo "MISSING — copy .env.example to .env and set APP_KEY, DB_*, APP_URL"; fi
echo "=== PHP ==="
php -v 2>&1 | head -4
echo "=== public_html/.user.ini (first lines) ==="
if [ -f "$HOME/public_html/.user.ini" ]; then head -5 "$HOME/public_html/.user.ini"; else echo "(no file)"; fi
echo "=== php artisan about ==="
php artisan about 2>&1 | head -40 || true
echo "=== tail storage/logs/laravel.log ==="
if [ -f storage/logs/laravel.log ]; then tail -40 storage/logs/laravel.log; else echo "(no laravel.log yet)"; fi
'"""

    stdin, stdout, stderr = client.exec_command(remote, timeout=180)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    client.close()
    print(out, end="" if out.endswith("\n") else out + "\n")
    if err.strip():
        print(err, file=sys.stderr)


if __name__ == "__main__":
    main()

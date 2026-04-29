#!/usr/bin/env python3
"""
SFTP-only diagnosis for HTTP 500 on production (no SSH shell required).

What it does:
  - Connects using secrets/sftp.env (same as sftp_deploy.py)
  - Auto-detects remote home + app dir + public_html dir
  - Checks common docroot/entrypoint issues (index.php vs index.html, public/ placement)
  - Reads tail of storage/logs/laravel.log and prints the last error block

Usage:
  python scripts/sftp_diagnose_500.py
  python scripts/sftp_diagnose_500.py --log-bytes 200000
"""

from __future__ import annotations

import argparse
import importlib.util
import re
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


def _exists(sftp, path: str) -> bool:
    try:
        sftp.stat(path)
        return True
    except OSError:
        return False


def _read_tail_bytes(sftp, path: str, max_bytes: int) -> str:
    st = sftp.stat(path)
    size = int(st.st_size)
    with sftp.open(path, "rb") as rf:
        if size > max_bytes:
            rf.seek(max(0, size - max_bytes))
        body = rf.read()
    text = body.decode("utf-8", errors="replace")
    if size > max_bytes and text and not text.startswith("\n"):
        text = "… (file truncated at start) …\n" + text
    return text


def _last_error_block(log_text: str) -> str:
    """
    Try to extract the last Laravel log entry with stack context.
    Works reasonably with default Laravel Monolog formatting.
    """
    lines = log_text.splitlines()
    if not lines:
        return ""

    # A "header" line usually looks like:
    # [2026-01-01 12:00:00] production.ERROR: message {"exception":"..."}
    header_re = re.compile(r"^\[\d{4}-\d{2}-\d{2} [^\]]+\] [^\.]+\.(?:ERROR|CRITICAL|ALERT|EMERGENCY):")
    headers = [i for i, ln in enumerate(lines) if header_re.search(ln)]
    if not headers:
        # Fallback: last ~120 lines
        return "\n".join(lines[-120:])

    start = headers[-1]
    end = len(lines)
    return "\n".join(lines[start:end])


def main() -> None:
    p = argparse.ArgumentParser(description="Diagnose Laravel 500 via SFTP (no SSH).")
    p.add_argument("--log-bytes", type=int, default=180_000, help="Max bytes to read from end of laravel.log")
    p.add_argument("--config", type=Path, default=None, help="Override config path (defaults to secrets/sftp.env)")
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[1]
    sd = _load_sftp_deploy(repo)
    cfg_path = sd.resolve_config_path(repo, args.config)
    raw = sd.load_config(cfg_path)
    host, user, password, port = sd.normalize_connection(raw)

    app_dir = str(raw.get("SFTP_APP_DIR", "koon-hosting") or "").strip()
    pub_dir = str(raw.get("SFTP_PUBLIC_DIR", "public_html") or "public_html").strip() or "public_html"
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
        remote_web = sd.remote_join(home, pub_dir)

        print("", flush=True)
        print(f"Home:    {home}", flush=True)
        print(f"Laravel: {remote_app}", flush=True)
        print(f"Web:     {remote_web}", flush=True)

        # Check typical expected paths
        candidates = {
            "app/.env": f"{remote_app}/.env",
            "app/artisan": f"{remote_app}/artisan",
            "app/vendor/autoload.php": f"{remote_app}/vendor/autoload.php",
            "app/bootstrap/cache": f"{remote_app}/bootstrap/cache",
            "app/storage": f"{remote_app}/storage",
            "web/index.php": f"{remote_web}/index.php",
            "web/index.html": f"{remote_web}/index.html",
            "web/.htaccess": f"{remote_web}/.htaccess",
            "app/public/index.php": f"{remote_app}/public/index.php",
        }

        print("\n== Presence checks ==", flush=True)
        missing: list[str] = []
        for label, path in candidates.items():
            ok = _exists(sftp, path)
            print(f"{'OK ' if ok else 'MISSING'}  {label}: {path}", flush=True)
            if not ok:
                missing.append(label)

        # Heuristics / hints
        print("\n== Hints (heuristics) ==", flush=True)
        if _exists(sftp, candidates["web/index.html"]) and not _exists(sftp, candidates["web/index.php"]):
            print(
                "- Docroot has `index.html` but no `index.php`. If this is a Laravel site, upload `public/` contents to web root.",
                flush=True,
            )
        if _exists(sftp, candidates["web/index.php"]) and _exists(sftp, candidates["web/index.html"]):
            print(
                "- Both `index.php` and `index.html` exist in docroot. Some hosts prioritize `index.html`; rename/remove it to let Laravel `index.php` serve.",
                flush=True,
            )
        if not _exists(sftp, candidates["app/vendor/autoload.php"]):
            print(
                "- `vendor/autoload.php` is missing. Either upload `vendor/` or run `composer install --no-dev` on the server.",
                flush=True,
            )
        if not _exists(sftp, candidates["app/.env"]):
            print(
                "- `.env` is missing in Laravel root. Missing `APP_KEY` / DB creds commonly causes 500.",
                flush=True,
            )

        # Try reading laravel.log
        print("\n== laravel.log (tail) ==", flush=True)
        log_candidates = [
            f"{remote_app}/storage/logs/laravel.log",
            f"{sd.remote_join(home, 'koon-hosting')}/storage/logs/laravel.log",
            f"{home}/storage/logs/laravel.log",
        ]
        chosen = next((lp for lp in log_candidates if _exists(sftp, lp)), None)
        if chosen is None:
            print("MISSING  Could not find storage/logs/laravel.log in expected locations.", flush=True)
            for lp in log_candidates:
                print(f"  - {lp}", flush=True)
            raise SystemExit(2)

        print(f"Reading: {chosen} (last {args.log_bytes} bytes max)\n", flush=True)
        log_text = _read_tail_bytes(sftp, chosen, args.log_bytes)
        block = _last_error_block(log_text).strip()
        if not block:
            print("(log empty)", flush=True)
        else:
            print(block, flush=True)
    finally:
        sftp.close()
        transport.close()


if __name__ == "__main__":
    main()


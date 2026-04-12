#!/usr/bin/env python3
"""
Upload a one-time PHP script to public_html, invoke it via HTTPS (POST + secret token),
then remove the script over SFTP if it still exists.

Default runs: php artisan migrate --force; php artisan db:seed --force
(same as koon:deploy-database, but works even before that command is deployed).

  python scripts/sftp_one_shot_deploy_database.py
  python scripts/sftp_one_shot_deploy_database.py --public-url https://koon.edu.sa

Reset admin password only (reads DEFAULT_ADMIN_* / ADMIN_* from the server .env):

  python scripts/sftp_one_shot_deploy_database.py --admin-password-reset

The PHP file deletes itself in a finally{} block.

Requires: secrets/sftp.env (same as sftp_deploy.py). Optional:
  ONE_SHOT_PUBLIC_URL=https://koon.edu.sa   (default if --public-url omitted)

pip install paramiko
"""

from __future__ import annotations

import argparse
import importlib.util
import secrets
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


def _load_sftp_deploy(repo: Path):
    path = repo / "scripts" / "sftp_deploy.py"
    spec = importlib.util.spec_from_file_location("sftp_deploy", path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _php_body(*, token: str, base_line: str, admin_password_reset: bool) -> str:
    # Single-quoted PHP strings in generated code; token is urlsafe base64 [a-zA-Z0-9_-]
    if admin_password_reset:
        artisan_block = """Illuminate\\Support\\Facades\\Artisan::call('db:seed', ['--class' => 'AdminUserSeeder', '--force' => true]);
    echo Illuminate\\Support\\Facades\\Artisan::output();
    echo "\\nDone (AdminUserSeeder). Ensure server .env has DEFAULT_ADMIN_PASSWORD set.\\n";"""
    else:
        artisan_block = """Illuminate\\Support\\Facades\\Artisan::call('migrate', ['--force' => true]);
    echo Illuminate\\Support\\Facades\\Artisan::output();
    Illuminate\\Support\\Facades\\Artisan::call('db:seed', ['--force' => true]);
    echo Illuminate\\Support\\Facades\\Artisan::output();
    echo "\\nDone.\\n";"""
    return f"""<?php
declare(strict_types=1);

$expected = '{token}';
$token = (string) ($_POST['token'] ?? '');
if ($token === '' || strlen($token) !== strlen($expected) || !hash_equals($expected, $token)) {{
    header('Content-Type: text/plain; charset=utf-8', true, 403);
    echo "Forbidden\\n";
    exit(1);
}}

header('Content-Type: text/plain; charset=utf-8');
ignore_user_abort(true);
set_time_limit(600);

{base_line}

chdir($base);
require $base . '/vendor/autoload.php';
$app = require_once $base . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

try {{
    {artisan_block}
}} catch (Throwable $e) {{
    http_response_code(500);
    echo 'ERROR: ' . $e->getMessage() . "\\n";
}} finally {{
    @unlink(__FILE__);
}}
"""


def main() -> None:
    p = argparse.ArgumentParser(description="One-shot koon:deploy-database via uploaded PHP + HTTPS.")
    p.add_argument(
        "--public-url",
        default="",
        help="Site origin for the request, e.g. https://koon.edu.sa (default: ONE_SHOT_PUBLIC_URL in sftp.env or https://koon.edu.sa)",
    )
    p.add_argument("--config", type=Path, default=None)
    p.add_argument(
        "--admin-password-reset",
        action="store_true",
        help="Only run AdminUserSeeder (uses DEFAULT_ADMIN_PASSWORD on server .env to reset hashes).",
    )
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[1]
    sd = _load_sftp_deploy(repo)
    cfg_path = sd.resolve_config_path(repo, args.config)
    raw = sd.load_config(cfg_path)
    host, user, password, port = sd.normalize_connection(raw)

    app_dir = str(raw.get("SFTP_APP_DIR", "koon-hosting") or "").strip()
    pub_dir = str(raw.get("SFTP_PUBLIC_DIR", "public_html") or "public_html").strip() or "public_html"
    remote_home_ov = raw.get("SFTP_REMOTE_HOME", "").strip() or None

    public_url = (args.public_url or raw.get("ONE_SHOT_PUBLIC_URL", "") or "").strip().rstrip("/")
    if not public_url:
        public_url = "https://koon.edu.sa"

    if app_dir == "":
        base_line = "$base = dirname(__DIR__);"
    else:
        esc = app_dir.replace("\\", "\\\\").replace("'", "\\'")
        base_line = f"$base = dirname(__DIR__).'/{esc}';"

    admin_reset = bool(args.admin_password_reset)
    token = secrets.token_urlsafe(32)
    fname = (
        f"koon-admin-pw-{secrets.token_hex(6)}.php"
        if admin_reset
        else f"koon-deploy-{secrets.token_hex(6)}.php"
    )
    body = _php_body(token=token, base_line=base_line, admin_password_reset=admin_reset).encode("utf-8")

    print(f"SFTP {user}@{host}:{port} …", flush=True)
    paramiko = sd._load_paramiko()
    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    if sftp is None:
        transport.close()
        raise SystemExit("SFTP failed")

    home = sd.detect_home(sftp, user, remote_home_ov)
    remote_web = sd.remote_join(home, pub_dir)
    remote_path = f"{remote_web.rstrip('/')}/{fname}"

    try:
        with sftp.open(remote_path, "wb") as wf:
            wf.write(body)
        print(f"Uploaded: {remote_path}", flush=True)

        post = urllib.parse.urlencode({"token": token}).encode("utf-8")
        req_url = f"{public_url}/{fname}"
        req = urllib.request.Request(
            req_url,
            data=post,
            method="POST",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "KOON-sftp-one-shot-deploy/1.0",
                "Accept": "text/plain,*/*",
            },
        )
        ctx = ssl.create_default_context()
        print(f"POST {req_url} …", flush=True)
        try:
            with urllib.request.urlopen(req, timeout=600, context=ctx) as resp:
                out = resp.read().decode("utf-8", errors="replace")
                code = resp.getcode()
        except urllib.error.HTTPError as e:
            raw = e.read() if e.fp else b""
            out = raw.decode("utf-8", errors="replace")
            code = e.code
            snippet = out[:4000].strip() if out.strip() else "(empty body)"
            print(snippet, flush=True)
            raise SystemExit(
                f"HTTP {code} from server. If you see Cloudflare / mod_security, try cPanel "
                f"Terminal for: php artisan koon:deploy-database — or pause WAF for one request."
            ) from e

        print(out, end="" if out.endswith("\n") else out + "\n", flush=True)
        if code != 200:
            raise SystemExit(f"Unexpected HTTP {code}")

    finally:
        try:
            sftp.stat(remote_path)
            sftp.remove(remote_path)
            print(f"Removed remote file (leftover): {remote_path}", flush=True)
        except OSError:
            print("Remote one-shot file already removed by PHP.", flush=True)
        sftp.close()
        transport.close()


if __name__ == "__main__":
    main()

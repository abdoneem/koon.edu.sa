#!/usr/bin/env python3
"""
Set the live admin password via a one-time HTTPS POST (password never touches server .env).

Dotenv treats $ in DEFAULT_ADMIN_PASSWORD as variable interpolation, so hashes from
AdminUserSeeder often do not match what you type. This script POSTs the plaintext once,
Laravel hashes it with Hash::make(), syncs super_admin, then deletes the PHP file.

  # Recommended: one line in a gitignored file (no shell history issues)
  python scripts/sftp_one_shot_set_admin_password.py --password-file secrets/admin_password_reset.txt

  # Or pipe (PowerShell may alter encoding; prefer --password-file)
  python scripts/sftp_one_shot_set_admin_password.py --password-stdin < pw.txt

  python scripts/sftp_one_shot_set_admin_password.py --password-file pw.txt --email admin@koon.edu.sa
  python scripts/sftp_one_shot_set_admin_password.py ... --public-url https://koon.edu.sa

Requires: secrets/sftp.env (same as sftp_deploy.py). pip install paramiko
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


def _php_body(*, token: str, base_line: str, email_literal: str) -> str:
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
set_time_limit(120);

{base_line}

chdir($base);
require $base . '/vendor/autoload.php';
$app = require_once $base . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

try {{
    $email = trim((string) ($_POST['email'] ?? '{email_literal}'));
    $plain = (string) ($_POST['new_password'] ?? '');
    if ($plain === '') {{
        header('Content-Type: text/plain; charset=utf-8', true, 400);
        echo "missing new_password\\n";
        exit(1);
    }}
    $user = \\App\\Models\\User::query()->firstOrNew(['email' => $email]);
    if ($user->name === null || $user->name === '') {{
        $user->name = 'KOON Admin';
    }}
    $user->password = \\Illuminate\\Support\\Facades\\Hash::make($plain);
    $user->save();
    $user->syncRoles(['super_admin']);
    $perms = \\Spatie\\Permission\\Models\\Permission::query()->where('guard_name', 'sanctum')->get();
    $user->syncPermissions($perms);
    app()[\\Spatie\\Permission\\PermissionRegistrar::class]->forgetCachedPermissions();
    echo "OK password updated for: ".$email."\\n";
}} catch (Throwable $e) {{
    http_response_code(500);
    echo 'ERROR: '.$e->getMessage()."\\n";
}} finally {{
    @unlink(__FILE__);
}}
"""


def _read_plain_password(*, password_file: Path | None, password_stdin: bool) -> str:
    if password_stdin:
        raw = sys.stdin.buffer.read()
        return raw.decode('utf-8').rstrip('\n\r')
    if password_file is None:
        raise SystemExit("Provide --password-file or --password-stdin")
    text = password_file.read_text(encoding='utf-8')
    lines = text.replace('\r\n', '\n').replace('\r', '\n').split('\n')
    line = lines[0] if lines else ''
    if line == '':
        raise SystemExit("Password file is empty")
    return line


def main() -> None:
    p = argparse.ArgumentParser(description="One-shot set admin password on server (POST plaintext, no .env).")
    p.add_argument("--password-file", type=Path, default=None, help="UTF-8 file whose first line is the new password")
    p.add_argument("--password-stdin", action="store_true", help="Read password from stdin (whole buffer, strip newlines)")
    p.add_argument("--email", default="admin@koon.edu.sa", help="User email to update")
    p.add_argument(
        "--public-url",
        default="",
        help="HTTPS origin (default ONE_SHOT_PUBLIC_URL in sftp.env or https://koon.edu.sa)",
    )
    p.add_argument("--config", type=Path, default=None)
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[1]
    plain = _read_plain_password(password_file=args.password_file, password_stdin=args.password_stdin)

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

    email = args.email.strip()
    email_lit = email.replace("\\", "\\\\").replace("'", "\\'")

    token = secrets.token_urlsafe(32)
    fname = f"koon-setpw-{secrets.token_hex(6)}.php"
    body = _php_body(token=token, base_line=base_line, email_literal=email_lit).encode("utf-8")

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

    post_data = urllib.parse.urlencode(
        {
            "token": token,
            "email": email,
            "new_password": plain,
        }
    ).encode("utf-8")

    try:
        with sftp.open(remote_path, "wb") as wf:
            wf.write(body)
        print(f"Uploaded: {remote_path}", flush=True)

        req_url = f"{public_url}/{fname}"
        req = urllib.request.Request(
            req_url,
            data=post_data,
            method="POST",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "KOON-sftp-one-shot-setpw/1.0",
                "Accept": "text/plain,*/*",
            },
        )
        ctx = ssl.create_default_context()
        print(f"POST {req_url} …", flush=True)
        try:
            with urllib.request.urlopen(req, timeout=120, context=ctx) as resp:
                out = resp.read().decode("utf-8", errors="replace")
                code = resp.getcode()
        except urllib.error.HTTPError as e:
            raw = e.read() if e.fp else b""
            out = raw.decode("utf-8", errors="replace")
            print(out[:4000], flush=True)
            raise SystemExit(f"HTTP {e.code}") from e

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

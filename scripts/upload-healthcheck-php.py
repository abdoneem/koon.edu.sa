"""Upload one-off public_html/healthcheck.php (remove after debugging)."""
from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path

import paramiko

SFTP_TXT = Path.home() / "Downloads" / "sftp.txt"

PHP = b"""<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
header('Content-Type: text/plain; charset=utf-8');
echo "1) PHP runs\\n";
$root = dirname(__DIR__);
echo "2) root=$root\\n";
$v = $root . '/vendor/autoload.php';
echo '3) autoload exists=' . (is_file($v) ? 'yes' : 'NO') . "\\n";
if (is_file($v)) {
    require $v;
    echo "4) vendor/autoload loaded\\n";
}
$env = $root . '/.env';
echo '5) .env exists=' . (is_file($env) ? 'yes' : 'NO') . "\\n";
"""

def main() -> None:
    text = SFTP_TXT.read_text(encoding="utf-8")
    info = dict(re.findall(r"^(\w+):\s*(.+)$", text, re.MULTILINE))
    user = info["user"]
    remote = f"/home/{user}/public_html/healthcheck.php"

    t = paramiko.Transport((info["host"], 22))
    t.connect(username=user, password=info["pass"])
    s = paramiko.SFTPClient.from_transport(t)
    s.putfo(BytesIO(PHP), remote)
    s.close()
    t.close()
    print("Uploaded", remote)


if __name__ == "__main__":
    main()

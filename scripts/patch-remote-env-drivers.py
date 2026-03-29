"""SFTP: set SESSION_DRIVER=file, CACHE_STORE=file, QUEUE_CONNECTION=sync on server .env."""
from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path

import paramiko

SFTP_TXT = Path.home() / "Downloads" / "sftp.txt"


def main() -> None:
    text = SFTP_TXT.read_text(encoding="utf-8")
    info = dict(re.findall(r"^(\w+):\s*(.+)$", text, re.MULTILINE))
    user = info["user"]
    path = f"/home/{user}/.env"

    t = paramiko.Transport((info["host"], 22))
    t.connect(username=user, password=info["pass"])
    s = paramiko.SFTPClient.from_transport(t)
    f = s.open(path)
    raw = f.read().decode("utf-8")
    f.close()

    raw = raw.replace("SESSION_DRIVER=database", "SESSION_DRIVER=file")
    raw = raw.replace("CACHE_STORE=database", "CACHE_STORE=file")
    raw = raw.replace("QUEUE_CONNECTION=database", "QUEUE_CONNECTION=sync")

    s.putfo(BytesIO(raw.encode("utf-8")), path)
    s.close()
    t.close()
    print("Patched", path)


if __name__ == "__main__":
    main()

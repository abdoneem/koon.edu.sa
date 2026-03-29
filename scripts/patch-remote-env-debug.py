"""SFTP: set APP_DEBUG=true on server .env (temporary diagnosis)."""
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

    raw = re.sub(r"^APP_DEBUG=.*$", "APP_DEBUG=true", raw, flags=re.MULTILINE)

    s.putfo(BytesIO(raw.encode("utf-8")), path)
    s.close()
    t.close()
    print("APP_DEBUG=true on", path)


if __name__ == "__main__":
    main()

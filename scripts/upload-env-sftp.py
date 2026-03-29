"""
Upload backend/.env to cPanel Laravel root: /home/<user>/.env
Reads SFTP credentials from %USERPROFILE%\\Downloads\\sftp.txt (pass:, user:, host:).
Adjusts a few keys for production on koon.edu.sa (override via env PROD_* if needed).
"""
from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path

import paramiko

REPO = Path(__file__).resolve().parents[1]
ENV_PATH = REPO / "backend" / ".env"
SFTP_TXT = Path.home() / "Downloads" / "sftp.txt"


def load_sftp_info() -> dict[str, str]:
    text = SFTP_TXT.read_text(encoding="utf-8")
    return dict(re.findall(r"^(\w+):\s*(.+)$", text, re.MULTILINE))


def productionize(content: str) -> str:
    lines = content.splitlines()
    out: list[str] = []
    for line in lines:
        if line.startswith("APP_ENV="):
            out.append("APP_ENV=production")
        elif line.startswith("APP_DEBUG="):
            out.append("APP_DEBUG=false")
        elif line.startswith("APP_URL="):
            out.append("APP_URL=https://koon.edu.sa")
        elif line.startswith("LOG_LEVEL="):
            out.append("LOG_LEVEL=error")
        else:
            out.append(line)
    return "\n".join(out) + "\n"


def main() -> None:
    raw = ENV_PATH.read_text(encoding="utf-8")
    body = productionize(raw)
    info = load_sftp_info()
    user = info["user"]
    host = info["host"]
    password = info["pass"]

    remote = f"/home/{user}/.env"
    t = paramiko.Transport((host, 22))
    t.connect(username=user, password=password)
    s = paramiko.SFTPClient.from_transport(t)
    s.putfo(BytesIO(body.encode("utf-8")), remote)
    s.close()
    t.close()
    print(f"Uploaded {ENV_PATH.name} -> {remote}")


if __name__ == "__main__":
    main()

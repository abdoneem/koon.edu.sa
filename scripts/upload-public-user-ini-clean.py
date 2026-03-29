"""Remove broken Wordfence auto_prepend from public_html/.user.ini (file was deleted)."""
from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path

import paramiko

SFTP_TXT = Path.home() / "Downloads" / "sftp.txt"

# Empty directives file is valid; PHP ignores comments.
CONTENT = (
    "; KOON Laravel: removed Wordfence auto_prepend (wordfence-waf.php was missing -> HTTP 500).\n"
    "; Restore only if you reinstall WordPress + Wordfence and that file exists.\n"
).encode("utf-8")

def main() -> None:
    text = SFTP_TXT.read_text(encoding="utf-8")
    info = dict(re.findall(r"^(\w+):\s*(.+)$", text, re.MULTILINE))
    user = info["user"]
    remote = f"/home/{user}/public_html/.user.ini"

    t = paramiko.Transport((info["host"], 22))
    t.connect(username=user, password=info["pass"])
    s = paramiko.SFTPClient.from_transport(t)
    s.putfo(BytesIO(CONTENT), remote)
    s.close()
    t.close()
    print("Wrote", remote)


if __name__ == "__main__":
    main()

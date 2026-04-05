#!/usr/bin/env python3
"""Upload publish/koon-hosting/public/* to SFTP public_html (secrets/sftp.env)."""
from __future__ import annotations

import posixpath
import sys
from pathlib import Path

import paramiko

REPO = Path(__file__).resolve().parents[1]
LOCAL_PUB = REPO / "publish" / "koon-hosting" / "public"


def parse_cfg(p: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip().upper(), v.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        out[k] = v
    return out


def mkdir_p(sftp: paramiko.SFTPClient, remote_dir: str) -> None:
    remote_dir = remote_dir.replace("\\", "/").rstrip("/")
    parts = [p for p in remote_dir.split("/") if p]
    cur = ""
    for part in parts:
        cur = f"{cur}/{part}"
        try:
            sftp.stat(cur)
        except OSError:
            sftp.mkdir(cur)


def upload_tree(sftp: paramiko.SFTPClient, local_root: Path, remote_root: str) -> int:
    n = 0
    for path in local_root.rglob("*"):
        if path.is_dir():
            continue
        rel = path.relative_to(local_root).as_posix()
        remote = posixpath.join(remote_root.replace("\\", "/"), rel.replace("\\", "/"))
        mkdir_p(sftp, posixpath.dirname(remote))
        sftp.put(str(path), remote)
        n += 1
    return n


def main() -> None:
    if not LOCAL_PUB.is_dir():
        raise SystemExit(f"Missing {LOCAL_PUB} — run scripts/publish-hosting.ps1 first.")

    cfg = parse_cfg(REPO / "secrets" / "sftp.env")
    host = cfg["SFTP_HOST"]
    user = cfg["SFTP_USER"]
    pw = cfg["SFTP_PASS"]
    port = int(cfg.get("SFTP_PORT", "22") or 22)
    home = cfg.get("SFTP_REMOTE_HOME", "/home/kooneduroot").strip() or "/home/kooneduroot"
    pub = cfg.get("SFTP_PUBLIC_DIR", "public_html").strip() or "public_html"
    remote = f"{home}/{pub}"

    t = paramiko.Transport((host, port))
    t.connect(username=user, password=pw)
    sftp = paramiko.SFTPClient.from_transport(t)
    if sftp is None:
        raise SystemExit("SFTP failed")

    n = upload_tree(sftp, LOCAL_PUB, remote)
    sftp.close()
    t.close()
    print(f"OK: uploaded {n} files to {remote}")


if __name__ == "__main__":
    main()

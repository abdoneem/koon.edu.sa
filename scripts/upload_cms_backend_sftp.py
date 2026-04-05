#!/usr/bin/env python3
"""Upload CMS-related backend files from publish/koon-hosting to SFTP home (secrets/sftp.env)."""
from __future__ import annotations

import os
import sys
from pathlib import Path

import paramiko

REPO = Path(__file__).resolve().parents[1]
BUNDLE = REPO / "publish" / "koon-hosting"


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


def put_file(sftp: paramiko.SFTPClient, local: Path, remote: str) -> None:
    mkdir_p(sftp, str(Path(remote).parent).replace("\\", "/"))
    sftp.put(str(local), remote)


def main() -> None:
    if not BUNDLE.is_dir():
        raise SystemExit(f"Missing {BUNDLE} — run scripts/publish-hosting.ps1 first.")

    cfg = parse_cfg(REPO / "secrets" / "sftp.env")
    host = cfg["SFTP_HOST"]
    user = cfg["SFTP_USER"]
    pw = cfg["SFTP_PASS"]
    port = int(cfg.get("SFTP_PORT", "22") or 22)
    home = cfg.get("SFTP_REMOTE_HOME", "/home/kooneduroot").strip() or "/home/kooneduroot"

    rels: list[str] = []
    for name in ("routes/api.php", "routes/web.php"):
        rels.append(name)
    for p in BUNDLE.glob("app/Http/Controllers/Api/**/*.php"):
        rels.append(str(p.relative_to(BUNDLE)).replace("\\", "/"))
    for p in BUNDLE.glob("app/Models/Cms*.php"):
        rels.append(str(p.relative_to(BUNDLE)).replace("\\", "/"))
    for p in BUNDLE.glob("app/Http/Requests/Admin/*Cms*.php"):
        rels.append(str(p.relative_to(BUNDLE)).replace("\\", "/"))
    for p in BUNDLE.glob("database/migrations/*cms*.php"):
        rels.append(str(p.relative_to(BUNDLE)).replace("\\", "/"))

    rels = sorted(set(rels))
    missing = [r for r in rels if not (BUNDLE / r).is_file()]
    if missing:
        raise SystemExit(f"Missing files in bundle: {missing[:5]} ...")

    t = paramiko.Transport((host, port))
    t.connect(username=user, password=pw)
    sftp = paramiko.SFTPClient.from_transport(t)
    if sftp is None:
        raise SystemExit("SFTP failed")

    n = 0
    for rel in rels:
        local = BUNDLE / rel
        remote = f"{home}/{rel}"
        put_file(sftp, local, remote)
        n += 1

    sftp.close()
    t.close()
    print(f"OK: uploaded {n} files under {home}")


if __name__ == "__main__":
    main()

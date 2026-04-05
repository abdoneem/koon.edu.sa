"""Print tail of remote storage/logs/laravel.log (secrets/sftp.env)."""
from __future__ import annotations

from pathlib import Path

import paramiko


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


def main() -> None:
    repo = Path(__file__).resolve().parents[1]
    cfg = parse_cfg(repo / "secrets" / "sftp.env")
    home = cfg.get("SFTP_REMOTE_HOME", "/home/kooneduroot").strip()
    log_path = f"{home}/storage/logs/laravel.log"

    t = paramiko.Transport((cfg["SFTP_HOST"], int(cfg.get("SFTP_PORT", "22") or 22)))
    t.connect(username=cfg["SFTP_USER"], password=cfg["SFTP_PASS"])
    sftp = paramiko.SFTPClient.from_transport(t)
    if sftp is None:
        raise SystemExit("SFTP failed")

    try:
        st = sftp.stat(log_path)
        size = int(st.st_size)
        start = max(0, size - 100_000)
        with sftp.open(log_path, "r") as f:
            if start > 0:
                f.seek(start)
            data = f.read().decode("utf-8", errors="replace")
    except OSError as e:
        print(log_path, e)
        sftp.close()
        t.close()
        return

    sftp.close()
    t.close()

    lines = data.splitlines()
    tail = "\n".join(lines[-80:]) if len(lines) > 80 else data
    print(tail)


if __name__ == "__main__":
    main()

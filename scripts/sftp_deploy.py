#!/usr/bin/env python3
"""
SFTP deploy: publish/koon-hosting -> ~/koon-hosting + public/ -> ~/public_html

Config (first match):
  1) --config PATH
  2) repo/secrets/sftp.env  (SFTP_HOST, SFTP_USER, SFTP_PASS — gitignored)
  3) ~/Downloads/sftp.txt  (legacy: host:/user:/pass:)

Modes:
  (default)             — incremental: only files new/changed vs publish/last/koon-hosting
  --skip-vendor         — do not upload vendor/ (smaller sync when composer.lock unchanged)
  --full                — upload everything; still updates baseline unless --no-baseline

After a successful run (not dry-run), copies bundle -> publish/last/koon-hosting for next diff.

  pip install paramiko
  python scripts/sftp_deploy.py
  python scripts/sftp_deploy.py --full --dry-run
  python -u scripts/sftp_deploy.py --verbose   # log every uploaded file
"""

from __future__ import annotations

import argparse
import os
import posixpath
import shutil
import sys
import time
from pathlib import Path

# Paramiko is imported lazily in main() so "python -u ..." shows lines immediately.
# A top-level `import paramiko` can block 10–60s on Windows (cryptography DLLs + AV scan)
# with no terminal output, which looks like a hang.


def _load_paramiko():
    try:
        import paramiko
    except ImportError:
        print("Install paramiko: pip install paramiko", file=sys.stderr)
        sys.exit(1)
    return paramiko


MTIME_SLACK_SEC = 2.0

# Never upload these (local test DB, PHPUnit metadata).
_DEPLOY_DENYLIST = frozenset(
    {
        "database/database.sqlite",
        ".phpunit.result.cache",
    }
)


def deploy_path_excluded(rel_posix: str, *, skip_vendor: bool) -> bool:
    """Paths that must not be deployed or optionally skipped (vendor/)."""
    if rel_posix in _DEPLOY_DENYLIST:
        return True
    if skip_vendor and (rel_posix == "vendor" or rel_posix.startswith("vendor/")):
        return True
    return False


def parse_colon_config(path: Path) -> dict[str, str]:
    cfg: dict[str, str] = {}
    text = path.read_text(encoding="utf-8", errors="replace")
    for line in text.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        cfg[key.strip().lower()] = val.strip()
    return cfg


def parse_env_config(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, val = line.partition("=")
        k = key.strip().upper()
        v = val.strip()
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        out[k] = v
    return out


def normalize_connection(cfg: dict[str, str]) -> tuple[str, str, str, int]:
    """Return host, user, password, port."""
    if "SFTP_HOST" in cfg:
        host = cfg.get("SFTP_HOST", "").strip()
        user = cfg.get("SFTP_USER", "").strip()
        password = cfg.get("SFTP_PASS", cfg.get("SFTP_PASSWORD", "")).strip()
        port = int(cfg.get("SFTP_PORT", "22") or "22")
    else:
        host = cfg.get("host", "").strip()
        user = cfg.get("user", "").strip()
        password = cfg.get("pass", "").strip()
        port = int(cfg.get("port", "22") or "22")
    if not host or not user or not password:
        raise SystemExit("Config must define host, user, and password (SFTP_* or legacy colon file).")
    return host, user, password, port


def resolve_config_path(repo: Path, explicit: Path | None) -> Path:
    if explicit is not None:
        if not explicit.is_file():
            raise SystemExit(f"Config not found: {explicit}")
        return explicit
    env_path = repo / "secrets" / "sftp.env"
    if env_path.is_file():
        return env_path
    legacy = Path(os.path.expanduser("~/Downloads/sftp.txt"))
    if legacy.is_file():
        return legacy
    raise SystemExit(
        "No SFTP config. Copy secrets/sftp.env.example to secrets/sftp.env "
        "or pass --config PATH (see secrets/README.txt)."
    )


def load_config(path: Path) -> dict[str, str]:
    name = path.name.lower()
    if name.endswith(".env") or "sftp.env" in name:
        return parse_env_config(path)
    return parse_colon_config(path)


def mkdir_p(sftp, remote_dir: str) -> None:
    remote_dir = remote_dir.replace("\\", "/").rstrip("/")
    if not remote_dir.startswith("/"):
        raise ValueError(f"mkdir_p expects absolute path, got {remote_dir!r}")
    parts = [p for p in remote_dir.split("/") if p]
    cur = ""
    for part in parts:
        cur = f"{cur}/{part}"
        try:
            sftp.stat(cur)
        except OSError:
            sftp.mkdir(cur)


def remote_join(home: str, *segments: str) -> str:
    parts: list[str] = []
    for x in (home, *segments):
        if not x:
            continue
        for seg in str(x).replace("\\", "/").split("/"):
            if seg:
                parts.append(seg)
    return "/" + "/".join(parts)


def file_needs_upload(current: Path, baseline: Path | None, *, full: bool) -> bool:
    if full or baseline is None:
        return True
    try:
        if not baseline.is_file():
            return True
        s1, s2 = current.stat(), baseline.stat()
    except OSError:
        return True
    if s1.st_size != s2.st_size:
        return True
    if abs(s1.st_mtime - s2.st_mtime) > MTIME_SLACK_SEC:
        return True
    return False


def detect_home(sftp, username: str, override: str | None) -> str:
    if override and override.strip():
        return override.strip().rstrip("/")
    try:
        sftp.chdir(".")
        cwd = sftp.getcwd()
        if cwd and cwd.startswith("/"):
            return cwd.rstrip("/")
    except OSError:
        pass
    return f"/home/{username}"


def _short_rel(rel: str, max_len: int = 72) -> str:
    if len(rel) <= max_len:
        return rel
    return rel[: max_len - 3] + "..."


def upload_tree(
    sftp,
    local_root: Path,
    remote_root: str,
    *,
    dry_run: bool,
    label: str,
    baseline_root: Path | None,
    full: bool,
    skip_vendor: bool,
    verbose: bool,
) -> tuple[int, int, int]:
    """Returns uploaded, skipped, total_scanned."""
    local_root = local_root.resolve()
    if not local_root.is_dir():
        raise SystemExit(f"Not a directory: {local_root}")
    prefix = f"[{label}] " if label else ""
    print(
        f"{prefix}Indexing local tree (rglob) under {local_root.name}/ ... (large bundles can take 30-90s)",
        flush=True,
    )
    files = sorted(p for p in local_root.rglob("*") if p.is_file())
    total = len(files)
    excluded_by_rule = sum(
        1
        for p in files
        if deploy_path_excluded(p.relative_to(local_root).as_posix(), skip_vendor=skip_vendor)
    )
    eligible = total - excluded_by_rule
    print(
        f"{prefix}Local scan: {total} files, {eligible} eligible to consider"
        + (f" ({excluded_by_rule} excluded)" if excluded_by_rule else "")
        + f" -> {remote_root}",
        flush=True,
    )
    uploaded = 0
    skipped = 0
    excluded = 0
    t0 = time.monotonic()
    heartbeat_every = 300

    for i, path in enumerate(files, 1):
        if not dry_run and heartbeat_every > 0 and i > 0 and i % heartbeat_every == 0:
            elapsed = time.monotonic() - t0
            print(
                f"{prefix}... heartbeat: {i}/{total} paths scanned | "
                f"uploaded={uploaded} skipped={skipped} excluded={excluded} | {elapsed:.0f}s",
                flush=True,
            )

        rel = path.relative_to(local_root).as_posix()
        if deploy_path_excluded(rel, skip_vendor=skip_vendor):
            excluded += 1
            continue
        remote_file = posixpath.join(remote_root, rel)
        remote_dir = posixpath.dirname(remote_file)
        prev = (baseline_root / rel) if baseline_root is not None else None
        if not file_needs_upload(path, prev, full=full):
            skipped += 1
            if dry_run and skipped <= 3 and uploaded == 0:
                print(f"{prefix}(skip) {rel}", flush=True)
            continue
        uploaded += 1
        if dry_run:
            if uploaded <= 5 or i == total:
                print(f"{prefix}PUT {rel}", flush=True)
            elif uploaded == 6:
                print(f"{prefix}... (more changed files in dry-run)", flush=True)
            continue
        mkdir_p(sftp, remote_dir)
        sftp.put(str(path), remote_file)
        elapsed = time.monotonic() - t0
        pct = 100 * i // max(total, 1)
        if verbose or uploaded == 1 or uploaded % 10 == 0 or i == total:
            print(
                f"{prefix}PUT #{uploaded} {_short_rel(rel)} | scan {i}/{total} ({pct}%) | {elapsed:.0f}s elapsed",
                flush=True,
            )

    elapsed = time.monotonic() - t0
    if dry_run:
        ex = f", {excluded} excluded" if excluded else ""
        print(
            f"{prefix}dry-run: would upload {uploaded}, skip {skipped}{ex} (of {total}) in {elapsed:.1f}s",
            flush=True,
        )
    elif not full and skipped:
        print(
            f"{prefix}done: {uploaded} uploaded, {skipped} unchanged (skipped) in {elapsed:.1f}s",
            flush=True,
        )
    else:
        print(
            f"{prefix}done: {uploaded} uploaded, {skipped} skipped, {excluded} excluded in {elapsed:.1f}s",
            flush=True,
        )
    return uploaded, skipped, total


def save_baseline(bundle: Path, repo: Path) -> None:
    last = repo / "publish" / "last" / "koon-hosting"
    if last.exists():
        shutil.rmtree(last)
    last.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(bundle, last, dirs_exist_ok=False)


def main() -> None:
    print("sftp_deploy: resolving repo and CLI args …", flush=True)
    repo = Path(__file__).resolve().parents[1]
    default_bundle = repo / "publish" / "koon-hosting"

    p = argparse.ArgumentParser(description="SFTP deploy koon-hosting bundle.")
    p.add_argument("--bundle", type=Path, default=default_bundle, help="Path to publish/koon-hosting")
    p.add_argument("--config", type=Path, default=None, help="sftp.env or legacy sftp.txt")
    p.add_argument("--app-dir", default=None, help="Remote Laravel folder under home (default from config or koon-hosting)")
    p.add_argument("--public-html", default=None, help="Remote web root (default from config or public_html)")
    p.add_argument("--remote-home", default=None, help="Override SFTP_REMOTE_HOME / SFTP home detection")
    p.add_argument("--full", action="store_true", help="Upload all files (ignore publish/last baseline)")
    p.add_argument("--no-baseline", action="store_true", help="Do not refresh publish/last after upload")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument(
        "--skip-vendor",
        action="store_true",
        help="Do not upload vendor/ (use when composer.lock unchanged; run composer on server if deps changed).",
    )
    p.add_argument(
        "--verbose",
        action="store_true",
        help="Log every uploaded file (noisy). Default: every 10 files + path.",
    )
    args = p.parse_args()

    full = bool(args.full)

    bundle: Path = args.bundle
    if not bundle.is_dir():
        raise SystemExit(
            f"Bundle missing: {bundle}\nRun: .\\scripts\\publish-hosting.ps1 (from repo root)"
        )

    cfg_path = resolve_config_path(repo, args.config)
    raw = load_config(cfg_path)
    host, user, password, port = normalize_connection(raw)

    if args.app_dir is not None:
        app_dir = str(args.app_dir).strip()
    else:
        # Empty SFTP_APP_DIR = Laravel root is the SFTP home (same level as public_html).
        app_dir = str(raw.get("SFTP_APP_DIR", "koon-hosting") or "").strip()
    pub_dir = args.public_html or raw.get("SFTP_PUBLIC_DIR", "public_html").strip() or "public_html"
    remote_home_ov = args.remote_home or raw.get("SFTP_REMOTE_HOME", "").strip() or None

    public_local = bundle / "public"
    if not public_local.is_dir():
        raise SystemExit(f"Missing public/ under bundle: {public_local}")

    baseline_root = repo / "publish" / "last" / "koon-hosting"
    baseline = baseline_root if baseline_root.is_dir() else None
    if full:
        baseline = None
    elif baseline is None:
        print("Note:   no publish/last/koon-hosting — this run uploads all files (first sync).", flush=True)

    print(f"Config: {cfg_path}", flush=True)
    skip_vendor = bool(args.skip_vendor)
    verbose = bool(args.verbose)
    mode = "FULL" if full else "incremental (size/mtime vs publish/last)"
    if skip_vendor and not full:
        mode += "; vendor/ skipped"
    print(f"Mode:   {mode}", flush=True)
    print(f"Bundle: {bundle}", flush=True)
    print(f"Connecting to {host}:{port} (SFTP)…", flush=True)

    print(
        "Loading paramiko / cryptography (first run can take 10–60s on Windows; not frozen) …",
        flush=True,
    )
    paramiko = _load_paramiko()
    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=password)
    print("Connected. Starting uploads…", flush=True)
    sftp = paramiko.SFTPClient.from_transport(transport)
    if sftp is None:
        transport.close()
        raise SystemExit("SFTP failed")

    try:
        home = detect_home(sftp, user, remote_home_ov)
        remote_app = home if app_dir == "" else remote_join(home, app_dir)
        remote_web = remote_join(home, pub_dir)

        print(f"Home:    {home}", flush=True)
        print(f"Laravel: {remote_app}", flush=True)
        print(f"Web:     {remote_web}", flush=True)
        if args.dry_run:
            print("DRY RUN - no files transferred\n", flush=True)

        print("== Phase 1/2: Laravel app (uploading; progress every 10 files) ==", flush=True)
        up1, sk1, t1 = upload_tree(
            sftp,
            bundle,
            remote_app,
            dry_run=args.dry_run,
            label="app",
            baseline_root=baseline,
            full=full,
            skip_vendor=skip_vendor,
            verbose=verbose,
        )

        print("== Phase 2/2: public_html (web root) ==", flush=True)
        up2, sk2, t2 = upload_tree(
            sftp,
            public_local,
            remote_web,
            dry_run=args.dry_run,
            label="web",
            baseline_root=baseline / "public" if baseline else None,
            full=full,
            skip_vendor=False,
            verbose=verbose,
        )

        if not args.dry_run and not args.no_baseline:
            print("\nUpdating local baseline publish/last/koon-hosting …", flush=True)
            save_baseline(bundle, repo)
            print("Baseline saved for next incremental run.", flush=True)

        if not args.dry_run:
            print(
                "\nDone. On server: php artisan migrate --force (if needed), php artisan config:cache",
                flush=True,
            )
    finally:
        sftp.close()
        transport.close()


if __name__ == "__main__":
    # Line-buffer stdout/stderr where supported (extra safety besides python -u).
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            try:
                _stream.reconfigure(line_buffering=True)
            except OSError:
                pass
    print("sftp_deploy: started (before paramiko import).", flush=True)
    main()

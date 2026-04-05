SFTP credentials for scripts/sftp_deploy.py

1. Copy sftp.env.example to sftp.env
2. Set SFTP_HOST, SFTP_USER, SFTP_PASS (and optional keys)
3. sftp.env is listed in .gitignore — do not commit it

Incremental deploys use publish/last/koon-hosting as a local baseline (also gitignored under publish/).

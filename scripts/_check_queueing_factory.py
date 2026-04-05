from pathlib import Path
import paramiko


def cfg():
    o = {}
    for line in Path("secrets/sftp.env").read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip().upper(), v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        o[k] = v
    return o


c = cfg()
h = c["SFTP_REMOTE_HOME"].strip()
p = f"{h}/vendor/laravel/framework/src/Illuminate/Contracts/Cookie/QueueingFactory.php"
t = paramiko.Transport((c["SFTP_HOST"], int(c["SFTP_PORT"])))
t.connect(username=c["SFTP_USER"], password=c["SFTP_PASS"])
s = paramiko.SFTPClient.from_transport(t)
if s is None:
    raise SystemExit("SFTP failed")
try:
    st = s.stat(p)
    print("EXISTS", st.st_size)
except OSError as e:
    print("MISSING", e)
s.close()
t.close()

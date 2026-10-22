#!/usr/bin/env node
// Stage and checksum an immutable release, then atomically switch the origin.
// --apply is required; SSH uses the existing lanxin-official-direct host config.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const host = 'lanxin-official-direct';
const manifest = JSON.parse(await fs.readFile('release-manifest.json', 'utf8'));
const uploaded = JSON.parse(await fs.readFile('release-evidence/cdn-upload.json', 'utf8'));
if (!/^compact-[a-f0-9]{16}$/.test(manifest.release)) throw new Error('Invalid release');
if (uploaded.release !== manifest.release || uploaded.files.length !== manifest.cdnFiles.length) throw new Error('CDN upload must finish for this release first');
const release = manifest.release;
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
const destination = `/var/www/lancloudtech-releases/${release}`;
const stage = `/var/www/lancloudtech-releases/.${release}-${stamp}`;
const backup = `/var/backups/lancloudtech/${stamp}`;
const checks = [];
async function walk(dir, prefix = '') {
  for (const item of await fs.readdir(dir, {withFileTypes:true})) {
    const rel = path.posix.join(prefix, item.name);
    if (item.isDirectory()) await walk(path.join(dir,item.name),rel);
    else {
      if (!item.isFile()) throw new Error('Unexpected non-file: '+rel);
      const bytes = await fs.readFile(path.join(dir,item.name));
      checks.push([rel, createHash('sha256').update(bytes).digest('hex')]);
    }
  }
}
await walk('dist');
const plan = {release,host,destination,backup,fileCount:checks.length};
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify(plan,null,2));
  process.exit(0);
}
const ssh = script => execFileSync('ssh',[host,'bash','-s'],{input:script,encoding:'utf8',stdio:['pipe','pipe','inherit']});
ssh(`set -eu\nmkdir -p '${stage}' '${backup}'\n`);
execFileSync('rsync',['-az','dist/',`${host}:${stage}/`],{stdio:'inherit'});
execFileSync('scp',['ops/nginx/lancloudtech.com.conf',`${host}:${backup}/nginx-candidate.conf`],{stdio:'inherit'});
const verify = `import hashlib, json, pathlib\nroot=pathlib.Path(${JSON.stringify(stage)})\nchecks=json.loads(${JSON.stringify(JSON.stringify(checks))})\nfor name, expected in checks:\n    assert hashlib.sha256((root/name).read_bytes()).hexdigest()==expected, name\nprint('Verified origin files:',len(checks))\n`;
console.log(ssh(`set -eu\npython3 - <<'PY'\n${verify}PY\n`));
const result = ssh(`set -eu
cp -p /etc/nginx/sites-available/lancloudtech.com '${backup}/nginx-before.conf'
previous=$(readlink /var/www/lancloudtech-current || true)
printf '%s\n' "$previous" > '${backup}/previous-target.txt'
if [ -e '${destination}' ]; then
  diff -qr '${stage}' '${destination}' >/dev/null
else
  mv '${stage}' '${destination}'
fi
ln -s '${destination}' /var/www/lancloudtech-current.next
mv -Tf /var/www/lancloudtech-current.next /var/www/lancloudtech-current
install -m 644 '${backup}/nginx-candidate.conf' /etc/nginx/sites-available/lancloudtech.com
rollback() {
  cp -p '${backup}/nginx-before.conf' /etc/nginx/sites-available/lancloudtech.com
  if [ -n "$previous" ]; then
    ln -s "$previous" /var/www/lancloudtech-current.rollback
    mv -Tf /var/www/lancloudtech-current.rollback /var/www/lancloudtech-current
  fi
  nginx -t && systemctl reload nginx
}
if ! nginx -t; then rollback; exit 1; fi
if ! systemctl reload nginx; then rollback; exit 1; fi
# Nginx reload is graceful: the first connection can reach the old worker.
# Verify a full response with bounded retries instead of rolling back that race.
healthy=false
for attempt in 1 2 3 4 5 6; do
  if curl --fail --silent --show-error --connect-timeout 3 --max-time 5 --resolve lancloudtech.com:443:127.0.0.1 https://lancloudtech.com/ -o '${backup}/health.html' && grep -q '${release}' '${backup}/health.html'; then
    healthy=true
    break
  fi
  sleep 1
done
if [ "$healthy" != true ]; then
  rollback
  exit 1
fi
printf 'Origin active: %s\n' '${release}'
`);
console.log(result);
await fs.writeFile('release-evidence/origin-deploy.json',JSON.stringify({...plan,deployedAt:new Date().toISOString(),verifiedFiles:checks.length},null,2)+'\n');

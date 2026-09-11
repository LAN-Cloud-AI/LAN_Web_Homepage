/**
 * Install versioned Nginx vhosts on the origin host.
 * Host alias: lanxin-official-direct (see ~/.ssh/config).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.LANXIN_NGINX_HOST || "lanxin-official-direct";
const company = path.join(root, "ops/nginx/lancloudtech.com.conf");
const statsTls = path.join(root, "ops/nginx/stats.lancloudtech.com.conf");
const statsHttp = path.join(root, "ops/nginx/stats.lancloudtech.com.http.conf");

const run = (command, args, input) => {
  const result = spawnSync(command, args, { stdio: input ? ["pipe", "inherit", "inherit"] : "inherit", input });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const ssh = (script) => run("ssh", [host, script]);

run("scp", [company, `${host}:/etc/nginx/sites-available/lancloudtech.com.next`]);
ssh(
  "cp /etc/nginx/sites-available/lancloudtech.com /etc/nginx/sites-available/lancloudtech.com.bak.$(date +%Y%m%d-%H%M%S) && mv /etc/nginx/sites-available/lancloudtech.com.next /etc/nginx/sites-available/lancloudtech.com && ln -sfn /etc/nginx/sites-available/lancloudtech.com /etc/nginx/sites-enabled/lancloudtech.com",
);

const certCheck = spawnSync("ssh", [host, "test -f /etc/letsencrypt/live/stats.lancloudtech.com/fullchain.pem"], {
  stdio: "ignore",
});
const statsSrc = certCheck.status === 0 ? statsTls : statsHttp;
run("scp", [statsSrc, `${host}:/etc/nginx/sites-available/stats.lancloudtech.com.next`]);
ssh(
  "mkdir -p /var/www/acme && mv /etc/nginx/sites-available/stats.lancloudtech.com.next /etc/nginx/sites-available/stats.lancloudtech.com && ln -sfn /etc/nginx/sites-available/stats.lancloudtech.com /etc/nginx/sites-enabled/stats.lancloudtech.com && nginx -t && systemctl reload nginx",
);

console.log(`Nginx installed on ${host} (stats=${certCheck.status === 0 ? "tls" : "http-acme"})`);

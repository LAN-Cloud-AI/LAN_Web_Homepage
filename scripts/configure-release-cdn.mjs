#!/usr/bin/env node
// Configure only static delivery features on the existing domestic CDN domain.
// Credentials stay in the child environment, never in CLI arguments or reports.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { getOssEnv } from './oss/env.mjs';

const account = getOssEnv();
const domain = new URL(account.publicBaseUrl).hostname;
if (domain !== 'img.lancloudtech.com') throw new Error('Unexpected CDN domain');
const env = { ...process.env,
  ALIBABA_CLOUD_ACCESS_KEY_ID: account.accessKeyId,
  ALIBABA_CLOUD_ACCESS_KEY_SECRET: account.accessKeySecret,
  ALIBABA_CLOUD_REGION_ID: 'cn-hangzhou',
  ALIBABA_CLOUD_USER_AGENT: 'AlibabaCloud-Agent-Skills/alibabacloud-cli-guidance',
};
function cli(operation, args = []) {
  const r = spawnSync('aliyun', ['cdn', operation, ...args], {env, encoding:'utf8'});
  if (r.status !== 0) throw new Error(`${operation}: ${r.stderr || r.stdout}`);
  return JSON.parse(r.stdout);
}
const functions = [
  ['path_based_ttl_set', {path:'/lanxin/webpage/releases/', ttl:'31536000', weight:'99', swift_origin_cache_high:'on'}],
  ['set_resp_header', {key:'Access-Control-Allow-Origin', value:'*', header_operation_type:'add', duplicate:'off'}],
  ['brotli', {enable:'on'}],
  ['gzip', {enable:'on'}],
];
const names = functions.map(([name])=>name).join(',');
const read = () => cli('describe-cdn-domain-configs', ['--domain-name',domain,'--function-names',names]).DomainConfigs?.DomainConfig || [];
const before = read();
const changes = functions.map(([functionName, args])=>{
  const old = before.find(c=>c.FunctionName===functionName && (!args.key || c.FunctionArgs.FunctionArg.some(a=>a.ArgName==='key' && a.ArgValue===args.key)) && (!args.path || c.FunctionArgs.FunctionArg.some(a=>a.ArgName==='path' && a.ArgValue===args.path)));
  return {functionName, functionArgs:Object.entries(args).map(([argName,argValue])=>({argName,argValue})), ...(old ? {configId:old.ConfigId} : {})};
});
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({domain, before, changes, note:'Pass --apply to apply this plan.'},null,2));
} else {
  const report = {domain, before, changes, appliedAt:new Date().toISOString()};
  await fs.mkdir('release-evidence',{recursive:true});
  await fs.writeFile('release-evidence/cdn-before.json',JSON.stringify(report,null,2)+'\n');
  report.result = cli('batch-set-cdn-domain-config',['--domain-names',domain,'--functions',JSON.stringify(changes)]);
  report.after = read();
  await fs.writeFile('release-evidence/cdn-config.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}

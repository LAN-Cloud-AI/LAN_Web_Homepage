#!/usr/bin/env node
// Upload one content-addressed release without changing previous release keys.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createOssClient} from './oss/client.mjs';
const manifest=JSON.parse(await fs.readFile('release-manifest.json','utf8'));
if(!/^lanxin\/webpage\/releases\/compact-[a-f0-9]{16}$/.test(manifest.cdnPrefix)) throw new Error('Invalid release prefix');
const types={'.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.ttf':'font/ttf','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain; charset=utf-8','.pdf':'application/pdf'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const client=createOssClient();
let next=0,done=0;const uploaded=[];
await Promise.all(Array.from({length:6},async()=>{
  while(next<manifest.cdnFiles.length){
    const file=manifest.cdnFiles[next++],local=path.join('dist-cdn',file.path);
    if(!file.key.startsWith(manifest.cdnPrefix+'/'))throw new Error('Asset outside release');
    const data=await fs.readFile(local);
    if(data.length!==file.bytes||sha(data)!==file.sha256)throw new Error('Build changed: '+file.path);
    let existing;
    try{existing=await client.head(file.key);}catch(e){if(!['NoSuchKey','NotFound'].includes(e.code)&&e.status!==404)throw e;}
    if(existing){
      if(existing.res.headers['x-oss-meta-sha256']!==file.sha256)throw new Error('Immutable key collision: '+file.path);
    }else await client.put(file.key,data,{headers:{'Content-Type':types[path.extname(file.path)]||'application/octet-stream','Cache-Control':'public, max-age=31536000, immutable','x-oss-meta-sha256':file.sha256}});
    uploaded.push({path:file.path,sha256:file.sha256,bytes:file.bytes,alreadyPresent:!!existing});
    done++;if(done%25===0)console.log(`CDN assets ${done}/${manifest.cdnFiles.length}`);
  }
}));
await fs.mkdir('release-evidence',{recursive:true});
await fs.writeFile('release-evidence/cdn-upload.json',JSON.stringify({release:manifest.release,cdnBase:manifest.cdnBase,uploadedAt:new Date().toISOString(),files:uploaded.sort((a,b)=>a.path.localeCompare(b.path))},null,2)+'\n');
console.log(JSON.stringify({release:manifest.release,uploaded:uploaded.length,totalBytes:uploaded.reduce((n,f)=>n+f.bytes,0)}));

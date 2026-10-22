#!/usr/bin/env node
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await fs.readFile('release-manifest.json','utf8'));
let next=0;const results=[];
await Promise.all(Array.from({length:6},async()=>{
  while(next<manifest.cdnFiles.length){
    const file=manifest.cdnFiles[next++];
    const url=manifest.cdnBase+'/'+file.path;
    const response=await fetch(url,{method:'HEAD',headers:{Origin:'https://lancloudtech.com',Referer:'https://lancloudtech.com/','Accept-Encoding':'identity'},signal:AbortSignal.timeout(30000)});
    assert.equal(response.status,200,url);
    assert.equal(Number(response.headers.get('content-length')),file.bytes,url+' length');
    assert.equal(response.headers.get('x-oss-meta-sha256'),file.sha256,url+' digest');
    assert.equal(response.headers.get('access-control-allow-origin'),'*',url+' CORS');
    assert.match(response.headers.get('cache-control')||'',/max-age=31536000/,url+' cache');
    const mime=response.headers.get('content-type');
    if(file.path.endsWith('.js'))assert.match(mime,/javascript/,url+' MIME');
    if(file.path.endsWith('.css'))assert.match(mime,/text\/css/,url+' MIME');
    results.push({path:file.path,status:response.status,bytes:file.bytes,mime,cache:response.headers.get('cache-control'),cors:response.headers.get('access-control-allow-origin')});
  }
}));
const samples=[];
for(const extension of ['.css','.js','.ttf','.svg','.webp']){
  const file=manifest.cdnFiles.find(f=>f.path.endsWith(extension));
  const response=await fetch(manifest.cdnBase+'/'+file.path,{headers:{Origin:'https://lancloudtech.com',Referer:'https://lancloudtech.com/'},signal:AbortSignal.timeout(60000)});
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(response.status,200);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path+' full body');
  samples.push({path:file.path,status:response.status,sha256:file.sha256,encoding:response.headers.get('content-encoding')});
}
const font=manifest.cdnFiles.find(f=>f.path.endsWith('.ttf'));
const ranged=await fetch(manifest.cdnBase+'/'+font.path,{headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(30000)});
assert.equal(ranged.status,206);assert.equal((await ranged.arrayBuffer()).byteLength,1024);
const evidence={release:manifest.release,verifiedAt:new Date().toISOString(),assets:results.sort((a,b)=>a.path.localeCompare(b.path)),bodySamples:samples,fontRange:ranged.headers.get('content-range')};
await fs.writeFile('release-evidence/cdn-http.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({release:manifest.release,assets:results.length,fullBodySamples:samples.length,fontRange:evidence.fontRange}));

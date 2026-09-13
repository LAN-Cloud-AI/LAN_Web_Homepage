import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

/** Stable filenames keep old clients working; new documents use an immutable release graph. */
export async function fingerprintAssets(output, files) {
  const assets = files.filter(file => /\.(?:js|css)$/.test(file));
  const source = new Map(await Promise.all(assets.map(async file => [file, await fs.readFile(path.join(output, file), 'utf8')])));
  const hash = createHash('sha256');
  for (const [file, text] of source) hash.update(file).update('\0').update(text).update('\0');
  const version = hash.digest('hex').slice(0,12);
  const names = new Map(assets.map(file => [file, file.replace(/\.(js|css)$/, `.${version}.$1`)]));
  const rewrite = (text, file) => text.replace(/(["'`])((?:\.{0,2}\/)?[A-Za-z0-9_./-]+\.(?:js|css))([?#][^"'`\s<>]*)?\1/g, (all, quote, url, query='') => {
    if (url.startsWith('//')) return all;
    const target = url.startsWith('/') ? url.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), url));
    const renamed = names.get(target);
    if (!renamed) return all;
    let relative = url.startsWith('/') ? '/' + renamed : path.posix.relative(path.posix.dirname(file), renamed);
    if (!url.startsWith('/') && !relative.startsWith('.')) relative = './' + relative;
    return quote + relative + query + quote;
  });
  for (const [file, text] of source) await fs.writeFile(path.join(output, names.get(file)), rewrite(text,file));
  for (const file of files.filter(file=>file.endsWith('.html'))) {
    const full = path.join(output,file);
    await fs.writeFile(full, rewrite(await fs.readFile(full,'utf8'),file));
  }
  return version;
}

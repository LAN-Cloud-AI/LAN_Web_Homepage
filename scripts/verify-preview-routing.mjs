import assert from "node:assert/strict";
import { localeFromPathname, stripLocalePrefix, withLocalePrefix, localeAwareUrl, absoluteLocaleUrl, hreflangLinks } from "../site-identity.js";

for (const prefix of ["", "/preview"]) {
  assert.equal(localeFromPathname(`${prefix}/en/solutions/`), "en");
  assert.equal(localeFromPathname(`${prefix}/zh-Hant/`), "zh-Hant");
  assert.equal(localeFromPathname(`${prefix}/ai-course/`), "zh-Hans");
  assert.equal(stripLocalePrefix(`${prefix}/en/solutions/`), `${prefix}/solutions/`);
  assert.equal(withLocalePrefix(`${prefix}/en/solutions/`, "zh-Hant"), `${prefix}/zh-Hant/solutions/`);
  assert.equal(withLocalePrefix(`${prefix}/en/`, "zh-Hans"), `${prefix}/`);
  assert.equal(localeAwareUrl(`${prefix}/en/?inquiry=training#contact`, "zh-Hant"), `${prefix}/zh-Hant/?inquiry=training#contact`);
  assert.equal(absoluteLocaleUrl(`${prefix}/practice/`, "en"), `https://lancloudtech.com${prefix}/en/practice/`);
  assert.equal(new Set(hreflangLinks(`${prefix}/solutions/`).map(x => x.href)).size, 3);
  assert.ok(hreflangLinks(`${prefix}/solutions/`).every(x => x.href.startsWith(`https://lancloudtech.com${prefix}/`)));
}
assert.equal(localeFromPathname("/previewish/en/"), "zh-Hans");
assert.equal(withLocalePrefix("/preview/zh-Hant", "en"), "/preview/en/");
console.log("Compatibility routing verified: three locales and preserved query/hash.");

const { resolvePreviewRequest } = await import('./dev-server.mjs');
assert.deepEqual(await resolvePreviewRequest('/preview/en/practice/?host=cn'), {redirect:'/en/practice/?host=cn',status:301});
assert.deepEqual(await resolvePreviewRequest('/preview?host=cn'), {redirect:'/?host=cn',status:301});
assert.deepEqual(await resolvePreviewRequest('/en/ai-course/index.html?x=1'), {redirect:'/en/ai-course/?x=1',status:301});
assert.deepEqual(await resolvePreviewRequest('/leadshunter/'), {redirect:'https://leadshunter.lancloudtech.com/',status:301});

import fs from "node:fs/promises";
import { SHARE_BY_ROUTE } from "../share-meta.js";

const rows = await Promise.all(Object.entries(SHARE_BY_ROUTE).map(async ([id, card]) => ({
  id, path: card.path, locales: card.locales,
  image: `data:image/jpeg;base64,${(await fs.readFile(new URL(`../images/generated/share/${card.image.split("/").pop()}`, import.meta.url))).toString("base64")}`,
})));
const data = JSON.stringify(rows).replaceAll("<", "\\u003c");
const html = `<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>新版官网 · 微信分享卡片预览</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f3f5f3;color:#17201f;font:15px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}main{max-width:1120px;margin:auto;padding:40px 24px}header{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:30px}h1{font-size:28px;margin:4px 0 8px;letter-spacing:-1px}.eyebrow{color:#0f766e;letter-spacing:2px;font-size:12px}p{color:#62706b;margin:0}select{font:inherit;padding:10px 16px;border:1px solid #cdd5d0;border-radius:8px;background:white}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}article{background:white;border:1px solid #e3e8e4;border-radius:16px;overflow:hidden}.art{display:block;width:100%;height:190px;object-fit:contain;background:#f7f8f6;padding:6px}.card{padding:18px;border-top:1px solid #e5eae6;min-height:130px}.copy{display:flex;gap:12px;align-items:start}.thumb{width:58px;height:58px;object-fit:cover;border-radius:3px;flex:none}h2{font-size:16px;line-height:1.35;margin:0 0 7px}article p{font-size:12px;line-height:1.55}a{color:inherit;text-decoration:none}a:hover h2{text-decoration:underline}.path{font-size:11px;color:#87958d;margin-top:10px;font-family:monospace}footer{margin-top:24px;font-size:12px;color:#68766e}@media(max-width:760px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}header{align-items:start;flex-direction:column}h1{font-size:24px}}@media(max-width:480px){.grid{grid-template-columns:1fr}main{padding:24px 18px}}@media(prefers-color-scheme:dark){body{background:#14201d;color:#e8ede9}article{background:#22302a;border-color:#37463e}.card{border-color:#37463e}p,footer{color:#a9b8af}select{background:#22302a;color:inherit;border-color:#506357}.eyebrow{color:#86c2ae}}
</style>
<main><header><div><div class="eyebrow">LAN CLOUD AI · SHARE CARDS</div><h1>新版官网，分享时也清晰。</h1><p>9 类页面 · 三语文案 · 独立正方形配图</p></div><label>分享语言 <select id="locale"><option value="zh-Hans">简体中文</option><option value="zh-Hant">繁體中文</option><option value="en">English</option></select></label></header><section class="grid" id="cards" aria-label="页面分享卡片"></section><footer>上方为配图，下方按小缩略图展示标题与摘要。此页为布局预览，微信客户端实际展示受版本与缓存影响。点击卡片可访问对应新版页面。</footer></main>
<script>
const cards=${data};
const container=document.getElementById('cards');
function render(){const locale=document.getElementById('locale').value;const prefix=locale==='en'?'/en':locale==='zh-Hant'?'/zh-Hant':'';document.documentElement.lang=locale==='zh-Hans'?'zh-CN':locale;container.replaceChildren(...cards.map(card=>{const copy=card.locales[locale];const article=document.createElement('article');const url='https://lancloudtech.com/preview'+prefix+card.path;const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';const art=document.createElement('img');art.src=card.image;art.alt=copy.title+'分享配图';art.className='art';art.width=600;art.height=600;const body=document.createElement('div');body.className='card';const row=document.createElement('div');row.className='copy';const text=document.createElement('div');const h=document.createElement('h2');h.textContent=copy.title;const p=document.createElement('p');p.textContent=copy.desc;text.append(h,p);const thumb=art.cloneNode();thumb.className='thumb';thumb.alt='';thumb.width=58;thumb.height=58;row.append(text,thumb);const path=document.createElement('div');path.className='path';path.textContent='/preview'+prefix+card.path;body.append(row,path);link.append(art,body);article.append(link);return article;}));}
document.getElementById('locale').addEventListener('change',render);render();
</script></html>`;
await fs.writeFile(new URL("../docs/wechat-share-cards-v3.html", import.meta.url), html);
console.log("Created self-contained docs/wechat-share-cards-v3.html (9 cards, 3 languages).");

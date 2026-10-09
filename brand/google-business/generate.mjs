/**
 * Google Business Profile images: a square logo (mark only, sized for the
 * circular crop) and a 16:9 cover. Rebuild after changing the logo or the
 * hero headline:  node brand/google-business/generate.mjs
 */
import { chromium } from "playwright";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = dirname(fileURLToPath(import.meta.url));
const ANVIL = (size) => `<svg viewBox="0 0 32 32" width="${size}" height="${size}">
  <g fill="#F1EFE6" stroke="#F1EFE6" stroke-width="0.08" stroke-linejoin="round"><path d="M8.4 13.1 H2.8 L8.4 18.7 Z"/><path d="M23.6 13.1 H29.2 L23.6 18.1 Z"/>
  <rect x="8.4" y="12.4" width="15.2" height="6.4" rx="0.7"/><rect x="12.6" y="18.8" width="6.8" height="2.8"/>
  <path d="M12.6 21.6 H19.4 L22.8 24.6 H9.2 Z"/><rect x="6.2" y="24.6" width="19.6" height="3.2" rx="0.7"/></g>
  <g fill="#3FDDB0"><rect x="13.7" y="4.4" width="4.6" height="1.6" rx="0.5"/><rect x="15.1" y="5.6" width="1.8" height="5.2"/>
  <rect x="13.7" y="10.4" width="4.6" height="1.6" rx="0.5"/></g></svg>`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box}
  body{background:#0B0E14;color:#F1EFE6;position:relative;overflow:hidden;
       font-family:"Inter",ui-sans-serif,system-ui,"Segoe UI",Roboto,Arial,sans-serif}
  .glow{position:absolute;border-radius:50%;filter:blur(120px)}
  .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(93,101,121,.30) 1px,transparent 1px);
        background-size:34px 34px;-webkit-mask-image:radial-gradient(120% 100% at 50% 0%,#000 25%,transparent 85%)}
  .mono{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace}.mint{color:#3FDDB0}`;

// Logo: mark only, centred with room for Google's circular crop; text would be illegible that small.
const LOGO = `<html><head><style>${BASE}
  body{width:720px;height:720px;display:flex;align-items:center;justify-content:center}
  .g1{top:-200px;left:-200px;width:560px;height:560px;background:radial-gradient(circle,rgba(232,166,62,.18),transparent 68%)}
  .g2{bottom:-220px;right:-220px;width:600px;height:600px;background:radial-gradient(circle,rgba(63,221,176,.16),transparent 68%)}
  .mark{position:relative;margin-top:-10px}</style></head><body>
  <div class="glow g1"></div><div class="glow g2"></div><div class="mark">${ANVIL(400)}</div></body></html>`;

// Cover: 16:9, key content kept in the centre so Google's crops don't cut it.
const COVER = `<html><head><style>${BASE}
  body{width:1600px;height:900px;display:flex;flex-direction:column;justify-content:center;padding:0 150px}
  .g1{top:-260px;left:-200px;width:820px;height:820px;background:radial-gradient(circle,rgba(232,166,62,.20),transparent 68%)}
  .g2{top:-160px;right:-260px;width:880px;height:880px;background:radial-gradient(circle,rgba(63,221,176,.18),transparent 68%)}
  .row{position:relative;display:flex;align-items:center;gap:26px}
  .word{font-size:56px;font-weight:700;letter-spacing:.18em}
  h1{position:relative;font-size:98px;line-height:1.03;letter-spacing:-.035em;font-weight:800;margin-top:52px;max-width:17ch}
  .sub{position:relative;margin-top:36px;font-size:32px;color:#E8A63E}
  .foot{position:relative;margin-top:54px;display:flex;gap:18px;font-size:26px}
  .pill{border:1px solid #232A3A;background:#121620;border-radius:999px;padding:13px 24px}</style></head><body>
  <div class="glow g1"></div><div class="glow g2"></div><div class="dots"></div>
  <div class="row">${ANVIL(124)}<span class="word mono">FORGE<span class="mint">WEB</span></span></div>
  <h1>Des sites web qui travaillent pour votre activité.</h1>
  <div class="sub mono">Développement Web Full-Stack · React &amp; Next.js</div>
  <div class="foot mono"><span class="pill">Sites vitrines</span><span class="pill">Applications web</span><span class="pill">Bases de données &amp; API</span></div>
  </body></html>`;

const b = await chromium.launch({ headless: true });
for (const [name, html, w, h] of [["logo-720.png", LOGO, 720, 720], ["cover-1600x900.png", COVER, 1600, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html, { waitUntil: "load" }); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${name}` }); await p.close();
}
await b.close(); console.log("done");

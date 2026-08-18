/**
 * Renders public/og-image.png (1200x630) — the card WhatsApp, Facebook and
 * LinkedIn show when the link is shared. Re-run after changing the wordmark
 * or the hero headline so the card stays in step.
 */
import { chromium } from "playwright";

const ANVIL = `
<svg viewBox="0 0 32 32" width="104" height="104">
  <g fill="#F1EFE6">
    <path d="M8.4 13.1 H2.8 L8.4 18.7 Z"/>
    <path d="M23.6 13.1 H29.2 L23.6 18.1 Z"/>
    <rect x="8.4" y="12.4" width="15.2" height="6.4" rx="0.7"/>
    <rect x="12.6" y="18.8" width="6.8" height="2.8"/>
    <path d="M12.6 21.6 H19.4 L22.8 24.6 H9.2 Z"/>
    <rect x="6.2" y="24.6" width="19.6" height="3.2" rx="0.7"/>
  </g>
  <g fill="#3FDDB0">
    <rect x="13.7" y="4.4" width="4.6" height="1.6" rx="0.5"/>
    <rect x="15.1" y="5.6" width="1.8" height="5.2"/>
    <rect x="13.7" y="10.4" width="4.6" height="1.6" rx="0.5"/>
  </g>
</svg>`;

const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; background:#0B0E14; color:#F1EFE6; position:relative;
    overflow:hidden; display:flex; flex-direction:column; justify-content:center;
    padding:0 86px;
    font-family:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  }
  .glow { position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }
  .g1 { top:-190px; left:-140px; width:620px; height:620px;
        background:radial-gradient(circle,rgba(232,166,62,0.20),transparent 68%); }
  .g2 { top:-120px; right:-190px; width:660px; height:660px;
        background:radial-gradient(circle,rgba(63,221,176,0.18),transparent 68%); }
  .dots { position:absolute; inset:0;
    background-image:radial-gradient(rgba(93,101,121,0.30) 1px, transparent 1px);
    background-size:34px 34px;
    -webkit-mask-image:radial-gradient(120% 100% at 50% 0%, #000 25%, transparent 85%); }
  .row { position:relative; display:flex; align-items:center; gap:22px; }
  .word { font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;
          font-size:44px; font-weight:700; letter-spacing:0.18em; }
  .mint { color:#3FDDB0; }
  h1 { position:relative; font-size:74px; line-height:1.04; letter-spacing:-0.035em;
       font-weight:800; margin-top:44px; max-width:19ch; }
  .sub { position:relative; margin-top:30px; font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;
         font-size:25px; color:#E8A63E; letter-spacing:0.01em; }
  .foot { position:relative; margin-top:46px; display:flex; align-items:center; gap:16px;
          font-family:ui-monospace,"Cascadia Mono",Consolas,monospace; font-size:21px; color:#8791A6; }
  .pill { border:1px solid #232A3A; background:#121620; border-radius:999px;
          padding:11px 20px; color:#F1EFE6; }
</style></head><body>
  <div class="glow g1"></div><div class="glow g2"></div><div class="dots"></div>
  <div class="row">${ANVIL}<span class="word">FORGE<span class="mint">WEB</span></span></div>
  <h1>Des sites web qui travaillent pour votre activité.</h1>
  <div class="sub">Développement Web Full-Stack · React &amp; Next.js</div>
  <div class="foot">
    <span class="pill">Sites vitrines</span>
    <span class="pill">Applications web</span>
    <span class="pill">Bases de données &amp; API</span>
  </div>
</body></html>`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(HTML, { waitUntil: "load" });
await page.waitForTimeout(400);
await page.screenshot({ path: "./public/og-image.png" });
await browser.close();
console.log("wrote public/og-image.png (1200x630)");

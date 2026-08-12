/** Renders logo candidates side by side at display and favicon sizes. */
import { chromium } from "playwright";

const TILE = (inner) =>
  `<rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#121620" stroke="#232A3A" stroke-width="1.5"/>${inner}`;

// A plain F, positioned by x offset and scale.
const F = (x, w = 4, armTop = 12, armMid = 8.5, fill = "#F1EFE6") => `
  <rect x="${x}" y="7.5" width="${w}" height="17" rx="1.2" fill="${fill}"/>
  <rect x="${x}" y="7.5" width="${armTop}" height="${w}" rx="1.2" fill="${fill}"/>
  <rect x="${x}" y="13.5" width="${armMid}" height="${w}" rx="1.2" fill="${fill}"/>`;

const VARIANTS = {
  "current (reads FI)": TILE(`${F(7.5)}<rect x="21.5" y="7.5" width="3" height="17" rx="1.2" fill="#3FDDB0"/>`),

  "A · mint top arm": TILE(`
    <rect x="10" y="7.5" width="4" height="17" rx="1.2" fill="#F1EFE6"/>
    <rect x="10" y="7.5" width="13" height="4" rx="1.2" fill="#3FDDB0"/>
    <rect x="10" y="13.5" width="9" height="4" rx="1.2" fill="#F1EFE6"/>`),

  "B · FW monogram": TILE(`
    ${F(5, 3.4, 9.5, 7)}
    <path d="M18.5 7.5 L21 24.5 L23.5 14.5 L26 24.5 L28.5 7.5"
          fill="none" stroke="#3FDDB0" stroke-width="3.2"
          stroke-linecap="round" stroke-linejoin="round"/>`),

  "C · mint frame": `<rect x="1" y="1" width="30" height="30" rx="8" fill="#121620" stroke="#3FDDB0" stroke-width="2"/>${F(10)}`,

  "D · forge spark": TILE(`
    ${F(9)}
    <circle cx="23" cy="10.5" r="2.6" fill="#E8A63E"/>`),

  "E · F alone": TILE(F(10)),
};

const cell = (label, svg) => `
  <div style="text-align:center">
    <div style="height:104px;display:flex;align-items:center;justify-content:center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="96" height="96">${svg}</svg>
    </div>
    <div style="height:44px;display:flex;gap:14px;align-items:center;justify-content:center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="40" height="40">${svg}</svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">${svg}</svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16">${svg}</svg>
    </div>
    <div style="color:#8791A6;font-size:12px;margin-top:12px;font-family:monospace">${label}</div>
  </div>`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1180, height: 460 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.setContent(`<body style="margin:0;background:#0B0E14;padding:34px 26px;
  display:grid;grid-template-columns:repeat(3,1fr);gap:34px 20px;font-family:system-ui">
  ${Object.entries(VARIANTS).map(([k, v]) => cell(k, v)).join("")}
</body>`);
await page.waitForTimeout(400);
await page.locator("body").screenshot({ path: "./test/shots/logo-variants.png" });
await browser.close();
console.log("wrote test/shots/logo-variants.png");

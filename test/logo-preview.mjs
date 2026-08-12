/** Renders the header lockup and the mark at favicon sizes. */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const URL = process.env.BASE_URL || "http://localhost:5173/";
const SIZES = [96, 64, 40, 24, 16];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 900, height: 230 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.locator("header").screenshot({ path: "./test/shots/logo-header.png" });

const svg = readFileSync("public/favicon.svg", "utf8");
const cells = SIZES.map(
  (s) => `<div style="text-align:center">
    <div style="height:96px;display:flex;align-items:flex-end;justify-content:center">
      ${svg.replace('width="32" height="32"', `width="${s}" height="${s}"`)}
    </div>
    <div style="color:#8791A6;font-size:11px;margin-top:10px">${s}px</div>
  </div>`
).join("");

await page.setContent(
  `<body style="margin:0;background:#0B0E14;display:flex;gap:30px;align-items:flex-end;
     padding:28px;font-family:monospace">${cells}</body>`
);
await page.waitForTimeout(300);
await page.locator("body").screenshot({ path: "./test/shots/logo-sizes.png" });

await browser.close();
console.log("wrote test/shots/logo-header.png and logo-sizes.png");

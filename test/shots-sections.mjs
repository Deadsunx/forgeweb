import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = "http://localhost:5173/";
const OUT = "./test/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const width = Number(process.argv[2] || 1280);
const height = Number(process.argv[3] || 900);
const tag = process.argv[4] || String(width);

const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(900);

const targets = [
  ["services", "#services"],
  ["methode", "#methode"],
  ["stack", "section[aria-labelledby='stack-title']"],
  ["realisations", "#realisations"],
  ["tarifs", "#tarifs"],
  ["faq", "#faq"],
  ["contact", "#contact"],
  ["footer", "footer"],
];

for (const [name, sel] of targets) {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await el.screenshot({ path: `${OUT}/${tag}-s-${name}.png` });
}

await browser.close();
console.log("done", tag);

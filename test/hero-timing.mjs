/**
 * How long until a visitor on slow mobile data can read the headline and tap
 * "Demander un devis"? Emulates slow 4G (1.6 Mbps, 150 ms) and a 4x slower CPU.
 *   BASE_URL=https://www.forgewebafrica.com/ node test/hero-timing.mjs
 * Measure a production build (vite preview or the live site): the dev server
 * ships unbundled modules and is far slower on a throttled link.
 */
import { chromium } from "playwright";

const URL = process.env.BASE_URL || "http://localhost:4173/";
const fmt = (ms) => (ms == null ? "never" : `${(ms / 1000).toFixed(1)}s`);

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const t0 = Date.now();
await page.goto(URL, { waitUntil: "commit" });
let painted = null, h1At = null, ctaAt = null, intro = false;
while (Date.now() - t0 < 15000 && (h1At == null || ctaAt == null)) {
  const s = await page.evaluate(() => {
    const op = (el) => { let o = 1; for (let n = el; n; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity); return o; };
    const still = (el) => { const tf = getComputedStyle(el).transform; return tf === "none" || /^matrix\(1, 0, 0, 1, -?0(\.\d+)?, -?0(\.\d+)?\)$/.test(tf); };
    const h1 = document.querySelector("#top h1");
    const cta = [...document.querySelectorAll("#top a")].find((a) => /devis|quote/i.test(a.textContent));
    const glyphs = h1 ? [...h1.querySelectorAll(".fw-forge-char")] : [];
    const covered = !!document.querySelector(".fw-intro:not(.is-open)");
    return {
      painted: !!h1,
      intro: !!document.querySelector(".fw-intro"),
      h1: !!h1 && !covered && op(h1) > 0.95 && glyphs.every((g) => parseFloat(getComputedStyle(g).opacity) > 0.95 && still(g)),
      cta: !!cta && !covered && op(cta) > 0.95 && cta.getBoundingClientRect().top < innerHeight,
    };
  }).catch(() => ({}));
  const t = Date.now() - t0;
  if (s.painted && painted == null) painted = t;
  if (s.intro) intro = true;
  if (s.h1 && h1At == null) h1At = t;
  if (s.cta && ctaAt == null) ctaAt = t;
  await page.waitForTimeout(50);
}
console.log(`${URL}\n  page appears ${fmt(painted)} | headline readable ${fmt(h1At)} | "Demander un devis" visible ${fmt(ctaAt)} | full-screen intro on phone: ${intro ? "yes" : "no"}`);
await b.close();
process.exit(h1At != null && ctaAt != null ? 0 : 1);

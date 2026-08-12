/** Header headroom across narrow widths, plus the logo's accessible name. */
import { chromium } from "playwright";

const URL = process.env.BASE_URL || "http://localhost:5173/";
const browser = await chromium.launch({ headless: true });
const problems = [];

for (const w of [320, 340, 350, 375, 414]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 700 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const r = await page.evaluate(() => {
    const bar = document.querySelector("header > div");
    const used = [...bar.children].reduce((s, k) => s + k.getBoundingClientRect().width, 0);
    const cs = getComputedStyle(bar);
    const inner = bar.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const link = document.querySelector('header a[href="#top"]');
    const mark = link.querySelector("svg");
    return {
      slack: Math.round(inner - used),
      name: link.textContent.trim(),
      markVisible: mark.getBoundingClientRect().width > 8,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    };
  });

  console.log(
    `${String(w).padStart(3)}px: ${String(r.slack).padStart(3)}px slack | name "${r.name}" | mark ${
      r.markVisible ? "shown" : "MISSING"
    } | overflow ${r.scrollW > r.clientW ? "YES" : "no"}`
  );

  if (r.scrollW > r.clientW) problems.push(`${w}px: page overflows horizontally`);
  if (r.slack < 8) problems.push(`${w}px: only ${r.slack}px of header slack`);
  if (r.name !== "FORGEWEB") problems.push(`${w}px: logo accessible name is "${r.name}"`);
  if (!r.markVisible) problems.push(`${w}px: logo mark not rendered`);

  await ctx.close();
}

await browser.close();

console.log("\n============= HEADER FIT =============");
console.log(problems.length ? problems.map((p) => "  FAIL " + p).join("\n") : "  all passed");
console.log("=====================================");
process.exit(problems.length ? 1 : 0);

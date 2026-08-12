/** WCAG 2.1 AA audit: contrast, labels, roles, focus visibility, zoom reflow. */
import { chromium } from "playwright";

const URL = process.env.BASE_URL || "http://localhost:5173/";
const browser = await chromium.launch({ headless: true });

const AUDIT = `(() => {
  const parseRGB = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((v) => parseFloat(v));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const effBg = (el) => {
    let node = el, acc = null;
    while (node && node !== document.documentElement.parentNode) {
      const c = parseRGB(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc.a >= 0.999) return acc;
      }
      node = node.parentElement;
    }
    return acc && acc.a >= 0.999 ? acc : { r: 11, g: 14, b: 20, a: 1 };
  };

  const results = { contrast: [], labels: [], focus: [], misc: [] };

  // --- text contrast on every element with its own text ---
  for (const el of document.querySelectorAll("body *")) {
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim())
      .join(" ");
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // skip visually-hidden helper text
    if (cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)") continue;

    const fgRaw = parseRGB(cs.color);
    const bg = effBg(el);
    const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(fg, bg);
    if (cr < need) {
      results.contrast.push({
        text: own.slice(0, 52),
        color: cs.color,
        bg: \`rgb(\${Math.round(bg.r)}, \${Math.round(bg.g)}, \${Math.round(bg.b)})\`,
        size: size + "px/" + weight,
        ratio: Math.round(cr * 100) / 100,
        need,
      });
    }
  }

  // --- non-text contrast: borders of inputs/buttons vs their background (1.4.11) ---
  for (const el of document.querySelectorAll("input, select, textarea")) {
    const cs = getComputedStyle(el);
    const bc = parseRGB(cs.borderTopColor);
    const bg = effBg(el.parentElement);
    if (!bc) continue;
    const cr = ratio(bc.a < 1 ? over(bc, bg) : bc, bg);
    if (cr < 3) {
      results.misc.push(\`non-text contrast \${cr.toFixed(2)}:1 on \${el.tagName.toLowerCase()}#\${el.id} border \${cs.borderTopColor}\`);
    }
  }

  // --- form labels & error wiring (3.3.1 / 3.3.2 / 4.1.2) ---
  for (const el of document.querySelectorAll("input, select, textarea")) {
    const id = el.id;
    const hasLabel = id && document.querySelector(\`label[for="\${id}"]\`);
    if (!hasLabel && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby"))
      results.labels.push(\`no accessible name: \${el.tagName.toLowerCase()}#\${id || "(no id)"}\`);
    const desc = el.getAttribute("aria-describedby");
    if (desc && !document.getElementById(desc))
      results.labels.push(\`aria-describedby points at missing id "\${desc}" on #\${id}\`);
  }

  // --- icon-only controls need a name (4.1.2) ---
  for (const el of document.querySelectorAll("a, button")) {
    const name = (el.textContent || "").trim() || el.getAttribute("aria-label") || el.getAttribute("title");
    if (!name) results.labels.push(\`unnamed control <\${el.tagName.toLowerCase()}> class="\${(el.className||"").toString().slice(0,60)}"\`);
  }

  // --- aria-controls / aria-labelledby integrity ---
  for (const el of document.querySelectorAll("[aria-controls], [aria-labelledby]")) {
    for (const attr of ["aria-controls", "aria-labelledby"]) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      for (const idref of v.split(/\\s+/)) {
        if (!document.getElementById(idref))
          results.misc.push(\`\${attr}="\${idref}" has no matching element\`);
      }
    }
  }

  // --- landmarks ---
  if (!document.querySelector("main")) results.misc.push("no <main> landmark");
  if (!document.querySelector("footer")) results.misc.push("no <footer> landmark");
  const navs = [...document.querySelectorAll("nav")].filter((n) => !n.getAttribute("aria-label"));
  if (navs.length) results.misc.push(\`\${navs.length} <nav> without aria-label\`);
  if (!["fr", "en"].includes(document.documentElement.lang)) results.misc.push("unexpected html lang: " + document.documentElement.lang);

  // --- img alt ---
  for (const img of document.querySelectorAll("img")) {
    if (img.getAttribute("alt") === null) results.misc.push("img without alt: " + img.src.slice(0, 60));
  }

  return results;
})()`;

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });

// Audit the English copy with: LANG_CODE=en node test/a11y.mjs
if (process.env.LANG_CODE === "en") {
  await page.locator(`button[lang="en"]`).click();
  await page.waitForTimeout(400);
}

await page.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(500);

// Open every FAQ panel + expose error states so those get audited too.
await page.locator("#faq-button-1").click();
await page.getByRole("button", { name: /envoyer la demande|send request/i }).click();
await page.waitForTimeout(300);

const res = await page.evaluate(AUDIT);

console.log("=== CONTRAST FAILURES (1.4.3) ===");
if (!res.contrast.length) console.log("  none");
for (const c of res.contrast)
  console.log(`  ${c.ratio}:1 (need ${c.need}) ${c.size} ${c.color} on ${c.bg} — "${c.text}"`);

console.log("\n=== NAMES / LABELS (3.3.2, 4.1.2) ===");
console.log(res.labels.length ? res.labels.map((s) => "  " + s).join("\n") : "  none");

console.log("\n=== MISC (1.4.11, 1.3.1, landmarks) ===");
console.log(res.misc.length ? [...new Set(res.misc)].map((s) => "  " + s).join("\n") : "  none");

/* ---- focus indicator visibility on every focusable ---- */
const focusIssues = await page.evaluate(async () => {
  const out = [];
  const els = [...document.querySelectorAll("a[href], button, input, select, textarea")].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  for (const el of els) {
    el.focus();
    const cs = getComputedStyle(el);
    const hasRing =
      cs.outlineStyle !== "none" ||
      cs.boxShadow !== "none" ||
      cs.getPropertyValue("--tw-ring-shadow");
    if (!hasRing)
      out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.ariaLabel || "").trim().slice(0, 30)}"`);
  }
  return out;
});
console.log("\n=== FOCUS INDICATOR (2.4.7) ===");
console.log(focusIssues.length ? focusIssues.map((s) => "  no visible ring: " + s).join("\n") : "  all focusables show a ring");

/* ---- 200% zoom reflow (1.4.4 / 1.4.10) ---- */
await ctx.close();
const zctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const zpage = await zctx.newPage();
await zpage.goto(URL, { waitUntil: "networkidle" });
await zpage.evaluate(() => (document.body.style.zoom = "200%"));
await zpage.waitForTimeout(500);
const zoom = await zpage.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
console.log("\n=== 200% ZOOM (1.4.4) ===");
console.log(
  zoom.scrollW > zoom.clientW + 2
    ? `  horizontal scroll at 200%: ${zoom.scrollW} > ${zoom.clientW}`
    : "  no horizontal scroll at 200%"
);

/* ---- 320px reflow (1.4.10) ---- */
const sctx = await browser.newContext({ viewport: { width: 320, height: 700 }, reducedMotion: "reduce" });
const spage = await sctx.newPage();
await spage.goto(URL, { waitUntil: "networkidle" });
await spage.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
});
await spage.waitForTimeout(400);
const narrow = await spage.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
console.log("\n=== 320px REFLOW (1.4.10) ===");
console.log(
  narrow.scrollW > narrow.clientW + 2
    ? `  horizontal scroll at 320px: ${narrow.scrollW} > ${narrow.clientW}`
    : "  no horizontal scroll at 320px"
);
await spage.screenshot({ path: "./test/shots/320-full.png", fullPage: true });

/* ---- anchor scroll offset vs sticky header ---- */
const anchor = await spage.evaluate(async () => {
  document.querySelector('a[href="#tarifs"]').click();
  await new Promise((r) => setTimeout(r, 1200));
  const top = document.getElementById("tarifs").getBoundingClientRect().top;
  const headerH = document.querySelector("header").getBoundingClientRect().height;
  return { top: Math.round(top), headerH: Math.round(headerH) };
});
console.log("\n=== ANCHOR OFFSET ===");
console.log(
  anchor.top >= anchor.headerH
    ? `  ok: #tarifs lands ${anchor.top}px from top, header is ${anchor.headerH}px`
    : `  section hidden under header: top=${anchor.top}, header=${anchor.headerH}`
);

await browser.close();

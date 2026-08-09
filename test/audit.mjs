/**
 * Layout + interaction audit for the FORGEWEB page.
 * Run with the dev server on http://localhost:5173.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.BASE_URL || "http://localhost:5173/";
const OUT = process.env.SHOT_DIR || "./test/shots";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 900 },
];

const problems = [];
const note = (v, msg) => problems.push(`[${v}] ${msg}`);

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  // Reveal every scroll-triggered block before measuring.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  /* ---------- horizontal overflow ---------- */
  const overflow = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") continue;
      if (r.right > docW + 1 || r.left < -1) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 90),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    }
    return {
      scrollW: document.documentElement.scrollWidth,
      clientW: docW,
      offenders: out.slice(0, 12),
    };
  });
  if (overflow.scrollW > overflow.clientW + 1) {
    note(vp.name, `page scrolls horizontally: ${overflow.scrollW} > ${overflow.clientW}`);
    for (const o of overflow.offenders) note(vp.name, `  overflow ${o.tag}.${o.cls} [${o.left}..${o.right}]`);
  }

  /* ---------- text clipping / container escape ---------- */
  const clipped = await page.evaluate(() => {
    // Tailwind's sr-only clips to a 1px box on purpose — not a layout bug.
    const srOnly = (el) => {
      for (let n = el; n; n = n.parentElement) {
        if (getComputedStyle(n).clip === "rect(0px, 0px, 0px, 0px)") return true;
      }
      return false;
    };
    const out = [];
    const sel = "h1,h2,h3,p,li,span,a,button,label,option";
    for (const el of document.querySelectorAll(sel)) {
      if (!el.textContent.trim()) continue;
      if (srOnly(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.overflow === "hidden" || cs.overflowX === "hidden") {
        if (el.scrollWidth > el.clientWidth + 2) {
          out.push({ tag: el.tagName.toLowerCase(), text: el.textContent.trim().slice(0, 55) });
        }
      }
      // child text wider than its own box while not allowed to scroll
      if (cs.overflowX === "visible" && el.scrollWidth > el.clientWidth + 2 && cs.whiteSpace === "nowrap") {
        out.push({ tag: el.tagName.toLowerCase(), text: el.textContent.trim().slice(0, 55), why: "nowrap" });
      }
    }
    return out.slice(0, 15);
  });
  for (const c of clipped) note(vp.name, `clipped text <${c.tag}> "${c.text}" ${c.why || ""}`);

  /* ---------- touch targets ---------- */
  const small = await page.evaluate(() => {
    // sr-only controls (skip link, honeypot) are not pointer targets.
    const srOnly = (el) => {
      for (let n = el; n; n = n.parentElement) {
        if (getComputedStyle(n).clip === "rect(0px, 0px, 0px, 0px)") return true;
      }
      return false;
    };
    const out = [];
    for (const el of document.querySelectorAll("a, button, input, select, textarea")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (getComputedStyle(el).visibility === "hidden") continue;
      if (srOnly(el)) continue;
      if (r.height < 36) {
        out.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40),
          h: Math.round(r.height),
          w: Math.round(r.width),
        });
      }
    }
    return out.slice(0, 15);
  });
  for (const s of small) note(vp.name, `small target <${s.tag}> "${s.text}" ${s.w}x${s.h}`);

  /* ---------- heading hierarchy ---------- */
  if (vp.name === "1280") {
    const headings = await page.$$eval("h1,h2,h3,h4,h5,h6", (els) =>
      els.map((e) => ({ lvl: Number(e.tagName[1]), text: e.textContent.trim().slice(0, 48) }))
    );
    let prev = 0;
    for (const h of headings) {
      if (prev && h.lvl > prev + 1) note(vp.name, `heading jump h${prev} -> h${h.lvl} at "${h.text}"`);
      prev = h.lvl;
    }
    const h1s = headings.filter((h) => h.lvl === 1).length;
    if (h1s !== 1) note(vp.name, `expected exactly one h1, found ${h1s}`);
    console.log("\nHEADINGS:", headings.map((h) => `h${h.lvl} ${h.text}`).join("\n          "));
  }

  /* ---------- overlap check between sibling cards ---------- */
  const overlaps = await page.evaluate(() => {
    const out = [];
    const groups = document.querySelectorAll("[class*='grid']");
    for (const g of groups) {
      const kids = [...g.children].map((k) => ({ el: k, r: k.getBoundingClientRect() }));
      for (let i = 0; i < kids.length; i++) {
        for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].r;
          const b = kids[j].r;
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 6 && oy > 6) {
            out.push(`${kids[i].el.tagName}/${kids[j].el.tagName} overlap ${Math.round(ox)}x${Math.round(oy)}`);
          }
        }
      }
    }
    return [...new Set(out)].slice(0, 10);
  });
  for (const o of overlaps) note(vp.name, `overlap: ${o}`);

  /* ---------- screenshots ---------- */
  await page.screenshot({ path: `${OUT}/${vp.name}-full.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/${vp.name}-hero.png` });

  /* ---------- interactions ---------- */
  if (vp.name === "375") {
    // Burger menu
    const burger = page.getByRole("button", { name: /ouvrir le menu/i });
    await burger.click();
    const menu = page.locator("#mobile-menu");
    if (!(await menu.isVisible())) note(vp.name, "mobile menu did not open");
    if ((await burger.count()) && (await page.getByRole("button", { name: /fermer le menu/i }).count()) === 0)
      note(vp.name, "burger aria-label did not flip to 'Fermer le menu'");
    await page.screenshot({ path: `${OUT}/375-menu.png` });
    // Anchor click closes menu and navigates
    await menu.getByRole("link", { name: "Tarifs" }).click();
    await page.waitForTimeout(800);
    if (await menu.isVisible()) note(vp.name, "mobile menu stayed open after anchor click");
    const y = await page.evaluate(() => window.scrollY);
    if (y < 100) note(vp.name, `anchor navigation did not scroll (scrollY=${y})`);
    // Escape closes
    await burger.click();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    if (await page.locator("#mobile-menu").isVisible()) note(vp.name, "Escape did not close mobile menu");
  }

  // Accordion
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const btn0 = page.locator("#faq-button-0");
  const btn2 = page.locator("#faq-button-2");
  if ((await btn0.getAttribute("aria-expanded")) !== "true") note(vp.name, "faq item 0 not open by default");
  if (await page.locator("#faq-panel-2").isVisible()) note(vp.name, "faq panel 2 visible while collapsed");
  await btn2.click();
  await page.waitForTimeout(250);
  if (!(await page.locator("#faq-panel-2").isVisible())) note(vp.name, "faq panel 2 did not open on click");
  if (await page.locator("#faq-panel-0").isVisible()) note(vp.name, "faq panel 0 stayed open (should collapse)");
  await btn2.click();
  await page.waitForTimeout(250);
  if (await page.locator("#faq-panel-2").isVisible()) note(vp.name, "faq panel 2 did not close on second click");
  await btn0.click();
  await page.waitForTimeout(250);
  await page.locator("#faq").screenshot({ path: `${OUT}/${vp.name}-faq.png` });

  // Contact validation
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(250);
  const errCount = await page.locator("[id$='-error']").count();
  if (errCount !== 4) note(vp.name, `expected 4 validation errors on empty submit, got ${errCount}`);
  const focused = await page.evaluate(() => document.activeElement?.id);
  if (focused !== "contact-name") note(vp.name, `focus not moved to first invalid field (got ${focused})`);
  await page.locator("#contact").screenshot({ path: `${OUT}/${vp.name}-contact-errors.png` });

  // Partial fill -> only remaining errors
  await page.fill("#contact-name", "A");
  await page.fill("#contact-email", "pas-un-email");
  await page.selectOption("#contact-type", "Site vitrine");
  await page.fill("#contact-message", "court");
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(200);
  const msgs = await page.locator("[id$='-error']").allTextContents();
  if (msgs.length !== 3) note(vp.name, `expected 3 errors for bad values, got ${msgs.length}: ${msgs.join(" | ")}`);

  // Valid fill -> confirmation state
  await page.route("mailto:**", (r) => r.abort());
  await page.fill("#contact-name", "Awa Traoré");
  await page.fill("#contact-email", "awa@exemple.com");
  await page.fill("#contact-message", "Je souhaite un site vitrine pour mon restaurant à Bamako.");
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(500);
  const okVisible = await page.getByText(/Demande préparée|Message envoyé/i).isVisible().catch(() => false);
  if (!okVisible) note(vp.name, "confirmation state did not appear after valid submit");
  await page.locator("#contact").screenshot({ path: `${OUT}/${vp.name}-contact-ok.png` });
  // Reset returns to the form
  await page.getByRole("button", { name: /écrire une autre demande/i }).click();
  await page.waitForTimeout(250);
  const back = await page.locator("#contact-name").inputValue().catch(() => null);
  if (back !== "") note(vp.name, `reset did not clear the form (name="${back}")`);

  if (consoleErrors.length) note(vp.name, `console errors: ${consoleErrors.slice(0, 4).join(" ;; ")}`);

  await context.close();
}

/* ---------- keyboard focus order (desktop) ---------- */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const order = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    order.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return "none";
        const style = getComputedStyle(el);
        return `${el.tagName.toLowerCase()}:${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 26)}|outline=${style.outlineStyle}`;
      })
    );
  }
  console.log("\nTAB ORDER:\n  " + order.join("\n  "));
  await context.close();
}

await browser.close();

console.log("\n================ AUDIT ================");
if (problems.length === 0) console.log("No problems found.");
else problems.forEach((p) => console.log(p));
console.log("=======================================");
console.log(`Screenshots in ${OUT}`);

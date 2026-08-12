/**
 * Language toggle tests.
 *
 * The important one is coverage: after switching to English, no French text
 * may remain anywhere on the page. Accented Latin characters are the strongest
 * signal — the English copy contains none — backed by a list of French words
 * that have no English homograph.
 */
import { chromium } from "playwright";

const URL = process.env.BASE_URL || "http://localhost:5173/";

const FRENCH_CHARS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/g;
const FRENCH_WORDS =
  /\b(nous|vous|votre|vos|avec|pour|cette|chaque|notre|nos|devis|aucune|selon|jusqu|ligne)\b/gi;

const problems = [];
const note = (m) => problems.push(m);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();

await page.route("**/api/contact", (route) =>
  route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' })
);

await page.goto(URL, { waitUntil: "networkidle" });

/** Expand everything that hides text, then return all visible copy. */
async function fullText() {
  await page.evaluate(async () => {
    for (const b of document.querySelectorAll('[id^="faq-button-"]')) {
      if (b.getAttribute("aria-expanded") !== "true") b.click();
    }
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  return page.evaluate(() => document.body.innerText);
}

const setLang = async (code) => {
  await page.locator(`button[lang="${code}"]`).click();
  await page.waitForTimeout(400);
};

/* ---------- 1. defaults to French ---------- */
{
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "fr") note(`default: html lang is "${lang}", expected "fr"`);
  const text = await fullText();
  if (!/Ce que nous faisons/.test(text)) note("default: French heading missing");
  const pressed = await page.locator('button[lang="fr"]').getAttribute("aria-pressed");
  if (pressed !== "true") note(`default: FR button aria-pressed is ${pressed}`);
}

/* ---------- 2. switching to English translates everything ---------- */
{
  await setLang("en");

  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "en") note(`en: html lang is "${lang}", expected "en"`);

  const text = await fullText();

  const accents = text.match(FRENCH_CHARS);
  if (accents) {
    const lines = text
      .split("\n")
      .filter((l) => FRENCH_CHARS.test(l))
      .slice(0, 6);
    note(`en: ${accents.length} accented char(s) left untranslated:`);
    lines.forEach((l) => note(`     "${l.trim().slice(0, 80)}"`));
  }

  const words = text.match(FRENCH_WORDS);
  if (words) {
    const lines = text
      .split("\n")
      .filter((l) => FRENCH_WORDS.test(l))
      .slice(0, 6);
    note(`en: French word(s) left untranslated: ${[...new Set(words)].join(", ")}`);
    lines.forEach((l) => note(`     "${l.trim().slice(0, 80)}"`));
  }

  // A missing translation key renders as one of these.
  if (/\bundefined\b/.test(text)) note("en: 'undefined' rendered — a copy key is missing");
  if (/\[object Object\]/.test(text)) note("en: '[object Object]' rendered — a copy key is an object");

  // Spot-check that real English arrived, not just absence of French.
  for (const expected of [
    "What we do",
    "Four steps, no surprises",
    "Live projects, not mockups",
    "Clear starting points",
    "Common questions",
    "Send request",
    "All rights reserved",
  ]) {
    if (!text.includes(expected)) note(`en: missing expected copy "${expected}"`);
  }

  const pressed = await page.locator('button[lang="en"]').getAttribute("aria-pressed");
  if (pressed !== "true") note(`en: EN button aria-pressed is ${pressed}`);
}

/* ---------- 3. English also reaches attributes and hidden text ---------- */
{
  const burgerLabel = await page
    .locator('button[aria-controls="mobile-menu"]')
    .getAttribute("aria-label");
  if (FRENCH_CHARS.test(burgerLabel || "") || /menu$/i.test(burgerLabel || "") === false)
    note(`en: burger aria-label not translated ("${burgerLabel}")`);

  const skip = await page.locator('a[href="#main-content"]').textContent();
  if (!/Skip to main content/i.test(skip || "")) note(`en: skip link not translated ("${skip}")`);

  const wa = await page.locator('a[href^="https://wa.me/"]').getAttribute("href");
  if (!/Hello%20FORGEWEB/i.test(wa || "")) note("en: WhatsApp prefilled message not translated");

  const placeholder = await page.locator("#contact-message").getAttribute("placeholder");
  if (FRENCH_CHARS.test(placeholder || "")) note(`en: message placeholder not translated`);
}

/* ---------- 4. validation messages follow the language ---------- */
{
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /send request/i }).click();
  await page.waitForTimeout(300);
  const errs = await page.locator("[id$='-error']").allTextContents();
  if (errs.length !== 4) note(`en: expected 4 validation errors, got ${errs.length}`);
  for (const e of errs) {
    if (FRENCH_CHARS.test(e)) note(`en: validation message still French ("${e.trim()}")`);
  }
}

/* ---------- 5. the code window swaps too ---------- */
{
  const code = await page.locator("pre").first().innerText();
  if (!/Full-Stack Web Development/.test(code)) note("en: code window value not translated");
  if (!/\bavailable\b/.test(code)) note("en: code window key not translated");
  if (/disponible/.test(code)) note("en: code window still shows the French key");
}

/* ---------- 6. switching back restores French ---------- */
{
  await setLang("fr");
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "fr") note(`back to fr: html lang is "${lang}"`);
  const text = await fullText();
  if (!/Questions fréquentes/.test(text)) note("back to fr: French copy did not return");
  if (/What we do/.test(text)) note("back to fr: English copy still present");
}

/* ---------- 7. a typed project type survives the switch ---------- */
{
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.fill("#contact-name", "Awa");
  await page.selectOption("#contact-type", "Application web sur-mesure");
  await setLang("en");
  const carried = await page.locator("#contact-type").inputValue();
  if (carried !== "Custom web application")
    note(`switch: project type became "${carried}", expected the English equivalent`);
  const name = await page.locator("#contact-name").inputValue();
  if (name !== "Awa") note(`switch: typed name was lost ("${name}")`);
  await setLang("fr");
  const back = await page.locator("#contact-type").inputValue();
  if (back !== "Application web sur-mesure") note(`switch back: project type became "${back}"`);
}

/* ---------- 8. anchors keep working in English ---------- */
{
  await setLang("en");
  await page.locator('nav a[href="#tarifs"]').first().click();
  await page.waitForTimeout(900);
  const y = await page.evaluate(() => window.scrollY);
  if (y < 100) note(`en: anchor navigation did not scroll (scrollY=${y})`);
}

await ctx.close();
await browser.close();

console.log("=============== I18N TESTS ===============");
console.log(problems.length ? problems.map((p) => "  FAIL " + p).join("\n") : "  all passed");
console.log("=========================================");
process.exit(problems.length ? 1 : 0);

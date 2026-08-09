/**
 * Contact-form delivery tests.
 *
 * Intercepts /api/contact, so these run against `npm run dev` without the
 * serverless function present and never send real mail.
 */
import { chromium } from "playwright";

const URL = process.env.BASE_URL || "http://localhost:5173/";
const ENDPOINT = "**/api/contact";

const problems = [];
const note = (m) => problems.push(m);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });

async function newPage() {
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  return page;
}

async function fillValid(page) {
  await page.fill("#contact-name", "Awa Traoré");
  await page.fill("#contact-email", "awa@exemple.com");
  await page.selectOption("#contact-type", "Site vitrine");
  await page.fill("#contact-message", "Je souhaite un site vitrine pour mon activité.");
}

const json = (status, body) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

/* ---------- 1. happy path ---------- */
{
  const page = await newPage();
  let payload = null;
  let method = null;
  await page.route(ENDPOINT, async (route) => {
    method = route.request().method();
    payload = JSON.parse(route.request().postData() || "{}");
    await route.fulfill(json(200, { success: true }));
  });

  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);

  if (!payload) note("happy path: endpoint was never called");
  else {
    if (method !== "POST") note(`happy path: method was ${method}, expected POST`);
    if (payload.name !== "Awa Traoré") note(`happy path: name not sent (${payload.name})`);
    if (payload.email !== "awa@exemple.com") note(`happy path: email not sent (${payload.email})`);
    if (payload.projectType !== "Site vitrine")
      note(`happy path: projectType not sent (${payload.projectType})`);
    if (!payload.message) note("happy path: message not sent");
    if ("access_key" in payload) note("happy path: client is still sending an access_key");
  }
  const ok = await page.getByText(/Message envoyé/i).isVisible().catch(() => false);
  if (!ok) note("happy path: success state did not render");
  await page.close();
}

/* ---------- 2. server error ---------- */
{
  const page = await newPage();
  await page.route(ENDPOINT, (route) => route.fulfill(json(502, { success: false, error: "delivery_failed" })));
  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);
  if (!(await page.getByRole("alert").isVisible().catch(() => false)))
    note("server error: error alert did not render");
  if (!(await page.locator("#contact-name").isVisible().catch(() => false)))
    note("server error: form was replaced, user loses their typed message");
  const kept = await page.locator("#contact-message").inputValue().catch(() => "");
  if (!kept) note("server error: typed message was cleared");
  await page.close();
}

/* ---------- 3. misconfigured server (no API key) ---------- */
{
  const page = await newPage();
  await page.route(ENDPOINT, (route) =>
    route.fulfill(json(500, { success: false, error: "server_misconfigured" }))
  );
  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);
  if (!(await page.getByRole("alert").isVisible().catch(() => false)))
    note("misconfigured: error alert did not render");
  await page.close();
}

/* ---------- 4. function not deployed -> mailto fallback ---------- */
{
  const page = await newPage();
  await page.route(ENDPOINT, (route) => route.fulfill(json(404, { error: "not_found" })));
  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(700);
  const fellBack = await page.getByText(/Demande préparée/i).isVisible().catch(() => false);
  if (!fellBack) note("404: did not fall back to the mail client");
  const asserts = await page.getByText(/s’est ouvert\b/i).isVisible().catch(() => false);
  if (asserts) note("404: confirmation claims the mail client opened");
  await page.close();
}

/* ---------- 5. network failure ---------- */
{
  const page = await newPage();
  await page.route(ENDPOINT, (route) => route.abort("failed"));
  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);
  if (!(await page.getByRole("alert").isVisible().catch(() => false)))
    note("network failure: error alert did not render");
  const fallback = await page
    .getByRole("alert")
    .locator("a[href^='mailto:']")
    .isVisible()
    .catch(() => false);
  if (!fallback) note("network failure: no mailto fallback offered in the error");
  await page.close();
}

/* ---------- 6. sending state, no double submit ---------- */
{
  const page = await newPage();
  let hits = 0;
  await page.route(ENDPOINT, async (route) => {
    hits += 1;
    await new Promise((r) => setTimeout(r, 900));
    await route.fulfill(json(200, { success: true }));
  });
  await fillValid(page);
  const btn = page.getByRole("button", { name: /envoyer|envoi/i });
  await btn.click();
  await page.waitForTimeout(250);
  if (!(await btn.isDisabled())) note("sending: button not disabled during request");
  if (!/Envoi en cours/i.test((await btn.textContent()) || ""))
    note("sending: label did not change");
  await btn.click({ force: true }).catch(() => {});
  await page.waitForTimeout(1200);
  if (hits !== 1) note(`double submit: endpoint hit ${hits} times, expected 1`);
  await page.close();
}

/* ---------- 7. honeypot ---------- */
{
  const page = await newPage();
  let hits = 0;
  await page.route(ENDPOINT, (route) => {
    hits += 1;
    return route.fulfill(json(200, { success: true }));
  });
  await fillValid(page);
  await page.evaluate(() => {
    const trap = document.querySelector('input[name="botcheck"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(trap, "spam");
    trap.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);
  if (hits !== 0) note("honeypot: bot submission still reached the endpoint");
  if (!(await page.getByText(/Message envoyé/i).isVisible().catch(() => false)))
    note("honeypot: bot did not get the decoy success state");
  await page.close();
}

/* ---------- 8. validation gates the request ---------- */
{
  const page = await newPage();
  let hits = 0;
  await page.route(ENDPOINT, (route) => {
    hits += 1;
    return route.fulfill(json(200, { success: true }));
  });
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(300);
  if (hits !== 0) note("validation: empty form still hit the endpoint");
  const errs = await page.locator("[id$='-error']").count();
  if (errs !== 4) note(`validation: expected 4 errors, got ${errs}`);
  await page.close();
}

/* ---------- 9. WhatsApp button ---------- */
{
  const page = await newPage();
  const wa = page.locator('a[href^="https://wa.me/"]');
  if ((await wa.count()) === 0) note("whatsapp: button not rendered");
  else {
    const href = await wa.first().getAttribute("href");
    if (!/^https:\/\/wa\.me\/\d{8,15}\?text=/.test(href || ""))
      note(`whatsapp: malformed href (${href})`);
    if (/\+|\s/.test((href || "").split("?")[0]))
      note(`whatsapp: number contains + or spaces (${href})`);
    if ((await wa.first().getAttribute("rel")) !== "noopener noreferrer")
      note("whatsapp: missing rel=noopener noreferrer");
  }
  await page.close();
}

await ctx.close();
await browser.close();

console.log("=============== FORM TESTS ===============");
console.log(problems.length ? problems.map((p) => "  FAIL " + p).join("\n") : "  all passed");
console.log("=========================================");
process.exit(problems.length ? 1 : 0);

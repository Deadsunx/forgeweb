/**
 * Contact-form delivery tests.
 *
 * Exercises the Web3Forms path by intercepting the endpoint, so it runs
 * without a real access key and never sends live mail. Requires the dev
 * server to have a key configured (see run-form-tests below).
 */
import { chromium } from "playwright";

const URL = process.env.BASE_URL || "http://localhost:5173/";
const ENDPOINT = "https://api.web3forms.com/submit";

const problems = [];
const note = (m) => problems.push(m);

const browser = await chromium.launch({ headless: true });

async function newPage(context) {
  const page = await context.newPage();
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

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });

/* ---------- 1. happy path ---------- */
{
  const page = await newPage(ctx);
  let payload = null;
  await page.route(ENDPOINT, async (route) => {
    payload = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Email sent successfully" }),
    });
  });

  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);

  if (!payload) note("happy path: endpoint was never called");
  else {
    if (!payload.access_key) note("happy path: access_key missing from payload");
    if (payload.name !== "Awa Traoré") note(`happy path: name not sent (${payload.name})`);
    if (payload.email !== "awa@exemple.com") note(`happy path: email not sent (${payload.email})`);
    if (payload.projet !== "Site vitrine") note(`happy path: projet not sent (${payload.projet})`);
    if (!/Site vitrine/.test(payload.subject || "")) note(`happy path: subject wrong (${payload.subject})`);
  }
  const ok = await page.getByText(/Message envoyé/i).isVisible().catch(() => false);
  if (!ok) note("happy path: success state did not render");
  await page.close();
}

/* ---------- 2. server rejects ---------- */
{
  const page = await newPage(ctx);
  await page.route(ENDPOINT, (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Invalid access key" }),
    })
  );
  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);
  const alert = await page.getByRole("alert").isVisible().catch(() => false);
  if (!alert) note("rejection: error alert did not render");
  const stillHasForm = await page.locator("#contact-name").isVisible().catch(() => false);
  if (!stillHasForm) note("rejection: form was replaced, user loses their typed message");
  await page.close();
}

/* ---------- 3. network failure ---------- */
{
  const page = await newPage(ctx);
  await page.route(ENDPOINT, (route) => route.abort("failed"));
  await fillValid(page);
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(600);
  const alert = await page.getByRole("alert").isVisible().catch(() => false);
  if (!alert) note("network failure: error alert did not render");
  const mailtoFallback = await page
    .getByRole("alert")
    .locator("a[href^='mailto:']")
    .isVisible()
    .catch(() => false);
  if (!mailtoFallback) note("network failure: no mailto fallback offered in the error");
  await page.close();
}

/* ---------- 4. sending state disables the button ---------- */
{
  const page = await newPage(ctx);
  let hits = 0;
  await page.route(ENDPOINT, async (route) => {
    hits += 1;
    await new Promise((r) => setTimeout(r, 900));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  await fillValid(page);
  const btn = page.getByRole("button", { name: /envoyer|envoi/i });
  await btn.click();
  await page.waitForTimeout(250);
  if (!(await btn.isDisabled())) note("sending: button not disabled during request");
  const label = await btn.textContent();
  if (!/Envoi en cours/i.test(label || "")) note(`sending: label did not change (${label})`);
  await btn.click({ force: true }).catch(() => {});
  await page.waitForTimeout(1200);
  if (hits !== 1) note(`double submit: endpoint hit ${hits} times, expected 1`);
  await page.close();
}

/* ---------- 5. honeypot silently drops bots ---------- */
{
  const page = await newPage(ctx);
  let hits = 0;
  await page.route(ENDPOINT, (route) => {
    hits += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
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
  const ok = await page.getByText(/Message envoyé/i).isVisible().catch(() => false);
  if (!ok) note("honeypot: bot did not get the decoy success state");
  await page.close();
}

/* ---------- 6. validation still gates the request ---------- */
{
  const page = await newPage(ctx);
  let hits = 0;
  await page.route(ENDPOINT, (route) => {
    hits += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
  });
  await page.getByRole("button", { name: /envoyer la demande/i }).click();
  await page.waitForTimeout(300);
  if (hits !== 0) note("validation: empty form still hit the endpoint");
  const errs = await page.locator("[id$='-error']").count();
  if (errs !== 4) note(`validation: expected 4 errors, got ${errs}`);
  await page.close();
}

await ctx.close();
await browser.close();

console.log("=============== FORM TESTS ===============");
console.log(problems.length ? problems.map((p) => "  FAIL " + p).join("\n") : "  all passed");
console.log("=========================================");
process.exit(problems.length ? 1 : 0);

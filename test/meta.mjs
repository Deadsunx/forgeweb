/**
 * Guards the social-preview and structured-data markup.
 *
 * Runs against a URL (BASE_URL) or, by default, the local index.html plus
 * public/og-image.png so it works without a server.
 */
import { readFileSync, statSync } from "node:fs";

const BASE = process.env.BASE_URL;
const problems = [];
const note = (m) => problems.push(m);

const html = BASE
  ? await (await fetch(new URL("/", BASE))).text()
  : readFileSync("index.html", "utf8");

const meta = (attr, value) => {
  const re = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  return tag?.match(/content=["']([^"']*)["']/i)?.[1] ?? null;
};

/* ---------- Open Graph ---------- */
const REQUIRED_OG = {
  "og:type": /^website$/,
  "og:site_name": /FORGEWEB/,
  "og:url": /^https:\/\//,
  "og:title": /FORGEWEB/,
  "og:description": /.{60,}/,
  "og:image": /^https:\/\/.+\.png$/,
  "og:image:width": /^1200$/,
  "og:image:height": /^630$/,
  "og:image:alt": /.{10,}/,
  "og:locale": /^fr_FR$/,
};
for (const [prop, pattern] of Object.entries(REQUIRED_OG)) {
  const v = meta("property", prop);
  if (v === null) note(`missing ${prop}`);
  else if (!pattern.test(v)) note(`${prop} = "${v}" does not match ${pattern}`);
}

/* ---------- Twitter ---------- */
for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
  if (meta("name", name) === null) note(`missing ${name}`);
}
if (meta("name", "twitter:card") !== "summary_large_image")
  note("twitter:card should be summary_large_image so the image renders full width");

/* ---------- canonical + description ---------- */
if (!/<link[^>]*rel=["']canonical["'][^>]*href=["']https:\/\//i.test(html))
  note("missing absolute canonical link");
const desc = meta("name", "description");
if (!desc) note("missing meta description");
else if (desc.length < 70 || desc.length > 320)
  note(`meta description is ${desc.length} chars (aim 70-320)`);

/* ---------- the image itself ---------- */
const ogUrl = meta("property", "og:image");
if (ogUrl) {
  if (BASE) {
    const res = await fetch(ogUrl);
    if (!res.ok) note(`og:image returned ${res.status}`);
    else {
      const buf = Buffer.from(await res.arrayBuffer());
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      if (w !== 1200 || h !== 630) note(`og:image is ${w}x${h}, expected 1200x630`);
      if (buf.length > 5_000_000) note(`og:image is ${(buf.length / 1e6).toFixed(1)}MB — WhatsApp may skip it`);
    }
  } else {
    const buf = readFileSync("public/og-image.png");
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (w !== 1200 || h !== 630) note(`og-image.png is ${w}x${h}, expected 1200x630`);
    if (statSync("public/og-image.png").size > 5_000_000) note("og-image.png over 5MB");
  }
}

/* ---------- JSON-LD ---------- */
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
if (!ld) note("no JSON-LD block");
else {
  let data;
  try {
    data = JSON.parse(ld);
  } catch (e) {
    note(`JSON-LD does not parse: ${e.message}`);
  }
  if (data) {
    if (data["@context"] !== "https://schema.org") note("JSON-LD @context is not schema.org");
    if (!/Service|LocalBusiness|Organization/.test(data["@type"]))
      note(`JSON-LD @type "${data["@type"]}" is not a business type`);
    for (const key of ["name", "url", "description", "email", "address", "areaServed"]) {
      if (!data[key]) note(`JSON-LD missing ${key}`);
    }
    if (data.address && !data.address.addressCountry) note("JSON-LD address missing addressCountry");
    if (!Array.isArray(data.makesOffer) || data.makesOffer.length === 0)
      note("JSON-LD lists no services");
    // Structured data that cannot be substantiated is worse than none.
    for (const forbidden of ["aggregateRating", "review", "openingHours", "openingHoursSpecification"]) {
      if (data[forbidden]) note(`JSON-LD contains unverifiable "${forbidden}" — remove it`);
    }
    if (data.address?.streetAddress) note("JSON-LD has a streetAddress that was never provided");
  }
}

/* ---------- absolute URLs everywhere they must be ---------- */
for (const prop of ["og:url", "og:image", "twitter:image"]) {
  const v = meta("property", prop) ?? meta("name", prop);
  if (v && !v.startsWith("https://")) note(`${prop} must be absolute, got "${v}"`);
}

console.log("============ META / SCHEMA ============");
console.log(problems.length ? problems.map((p) => "  FAIL " + p).join("\n") : "  all passed");
console.log(`  (checked ${BASE || "local index.html"})`);
console.log("======================================");
process.exit(problems.length ? 1 : 0);

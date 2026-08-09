/**
 * Contact form endpoint — Vercel Serverless Function.
 *
 * Deploys automatically from the /api directory; no framework change and no
 * vercel.json needed. The mail credential stays server-side and is never
 * shipped to the browser.
 *
 * Environment variables (Vercel > Settings > Environment Variables):
 *   RESEND_API_KEY  required — from https://resend.com
 *   MAIL_TO         optional — inbox that receives the leads
 *   MAIL_FROM       optional — verified sender; see the note below
 *
 * On a fresh Resend account with no verified domain you may only send FROM
 * onboarding@resend.dev and only TO the address you signed up with. Verify a
 * domain to send from your own address and to anyone.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAIL_TO = process.env.MAIL_TO || "forgeweb.ml@gmail.com";
const MAIL_FROM = process.env.MAIL_FROM || "FORGEWEB <onboarding@resend.dev>";

const MAX = { name: 120, email: 200, projectType: 80, message: 5000 };

/** Mirrors the client-side rules — never trust what the browser sends. */
function validate(body) {
  const errors = [];
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const projectType = String(body.projectType ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 2) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push("email");
  if (!projectType) errors.push("projectType");
  if (message.length < 10) errors.push("message");

  for (const [key, value] of Object.entries({ name, email, projectType, message })) {
    if (value.length > MAX[key]) errors.push(key);
  }

  return { errors: [...new Set(errors)], clean: { name, email, projectType, message } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "method_not_allowed" });
  }

  // Vercel parses application/json for us; tolerate a raw string just in case.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, error: "invalid_json" });
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ success: false, error: "invalid_body" });
  }

  // Honeypot: accept and discard so the bot sees success and moves on.
  if (String(body.botcheck ?? "").trim()) {
    return res.status(200).json({ success: true });
  }

  const { errors, clean } = validate(body);
  if (errors.length) {
    return res.status(400).json({ success: false, error: "validation_failed", fields: errors });
  }

  if (!process.env.RESEND_API_KEY) {
    // Configuration problem, not the visitor's fault — log it, stay vague.
    console.error("RESEND_API_KEY is not set; cannot send contact email.");
    return res.status(500).json({ success: false, error: "server_misconfigured" });
  }

  const text = [
    `Nom : ${clean.name}`,
    `E-mail : ${clean.email}`,
    `Type de projet : ${clean.projectType}`,
    "",
    "Message :",
    clean.message,
  ].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [MAIL_TO],
        reply_to: clean.email,
        subject: `Demande de devis — ${clean.projectType} — ${clean.name}`,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Resend rejected the message:", response.status, detail.slice(0, 500));
      return res.status(502).json({ success: false, error: "delivery_failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact endpoint threw:", err);
    return res.status(502).json({ success: false, error: "delivery_failed" });
  }
}

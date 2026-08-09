/**
 * Unit tests for api/contact.js — runs the handler directly with mock
 * req/res objects and a stubbed fetch. Never touches the network.
 */
import handler from "../api/contact.js";

const problems = [];
const note = (m) => problems.push(m);

function mockRes() {
  const res = {
    statusCode: null,
    payload: null,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
  return res;
}

const VALID = {
  name: "Awa Traoré",
  email: "awa@exemple.com",
  projectType: "Site vitrine",
  message: "Je souhaite un site vitrine pour mon activité.",
};

/** Runs the handler with fetch stubbed; returns { res, calls }. */
async function run(body, { method = "POST", apiKey = "re_test_key", resendStatus = 200 } = {}) {
  const calls = [];
  const realFetch = globalThis.fetch;
  const realKey = process.env.RESEND_API_KEY;
  const realError = console.error;

  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: resendStatus >= 200 && resendStatus < 300,
      status: resendStatus,
      text: async () => "stubbed",
    };
  };
  if (apiKey === null) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = apiKey;
  console.error = () => {};

  const res = mockRes();
  try {
    await handler({ method, body }, res);
  } finally {
    globalThis.fetch = realFetch;
    console.error = realError;
    if (realKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = realKey;
  }
  return { res, calls };
}

/* 1. happy path */
{
  const { res, calls } = await run(VALID);
  if (res.statusCode !== 200) note(`happy: status ${res.statusCode}, expected 200`);
  if (!res.payload?.success) note("happy: success flag not returned");
  if (calls.length !== 1) note(`happy: fetch called ${calls.length} times`);
  else {
    const sent = JSON.parse(calls[0].init.body);
    if (!calls[0].url.includes("api.resend.com")) note(`happy: wrong endpoint ${calls[0].url}`);
    if (calls[0].init.headers.Authorization !== "Bearer re_test_key")
      note("happy: API key not sent in Authorization header");
    if (sent.reply_to !== VALID.email) note(`happy: reply_to is ${sent.reply_to}`);
    if (!sent.subject.includes("Site vitrine")) note(`happy: subject missing project type`);
    if (!sent.text.includes(VALID.message)) note("happy: message body not included");
  }
}

/* 2. non-POST rejected */
{
  const { res, calls } = await run(VALID, { method: "GET" });
  if (res.statusCode !== 405) note(`method: status ${res.statusCode}, expected 405`);
  if (res.headers.Allow !== "POST") note("method: missing Allow header");
  if (calls.length) note("method: GET still sent mail");
}

/* 3. server-side validation rejects what the client would have caught */
{
  const cases = [
    ["missing name", { ...VALID, name: "" }],
    ["short name", { ...VALID, name: "A" }],
    ["bad email", { ...VALID, email: "pas-un-email" }],
    ["missing project", { ...VALID, projectType: "" }],
    ["short message", { ...VALID, message: "court" }],
    ["oversized message", { ...VALID, message: "x".repeat(5001) }],
  ];
  for (const [label, body] of cases) {
    const { res, calls } = await run(body);
    if (res.statusCode !== 400) note(`validation ${label}: status ${res.statusCode}, expected 400`);
    if (calls.length) note(`validation ${label}: invalid payload still sent mail`);
  }
}

/* 4. honeypot accepted and discarded */
{
  const { res, calls } = await run({ ...VALID, botcheck: "spam" });
  if (res.statusCode !== 200) note(`honeypot: status ${res.statusCode}, expected 200`);
  if (!res.payload?.success) note("honeypot: bot should see success");
  if (calls.length) note("honeypot: bot submission still sent mail");
}

/* 5. missing API key */
{
  const { res, calls } = await run(VALID, { apiKey: null });
  if (res.statusCode !== 500) note(`no key: status ${res.statusCode}, expected 500`);
  if (calls.length) note("no key: attempted to send anyway");
  if (JSON.stringify(res.payload).includes("RESEND")) note("no key: leaked env var name to client");
}

/* 6. upstream rejection surfaces as 502, key never leaked */
{
  const { res } = await run(VALID, { resendStatus: 403 });
  if (res.statusCode !== 502) note(`upstream: status ${res.statusCode}, expected 502`);
  if (JSON.stringify(res.payload).includes("re_test_key")) note("upstream: leaked API key to client");
}

/* 7. malformed bodies */
{
  for (const [label, body] of [
    ["string json", JSON.stringify(VALID)],
    ["broken json", "{not json"],
    ["null", null],
  ]) {
    const { res } = await run(body);
    const ok = label === "string json" ? res.statusCode === 200 : res.statusCode === 400;
    if (!ok) note(`body ${label}: status ${res.statusCode}`);
  }
}

console.log("============ API ENDPOINT TESTS ============");
console.log(problems.length ? problems.map((p) => "  FAIL " + p).join("\n") : "  all passed");
console.log("===========================================");
process.exit(problems.length ? 1 : 0);

/**
 * test-login.js  —  Login flow integration tests
 *
 * Requirements : Node.js 18.14+ (built-in fetch + Headers.getSetCookie)
 * Usage        : node test-login.js
 *               PORT=8080 node test-login.js   (custom port)
 *
 * NOTE: The backend listens on port 8000 by default, NOT 3000.
 * The script registers a throw-away account once, runs all tests,
 * then reports results. Test accounts are left in the DB (no DELETE
 * endpoint exists); each run uses a unique timestamp suffix so re-runs
 * never conflict.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8000;
const BASE = `http://localhost:${PORT}/api/v1`;

// Unique suffix prevents conflicts across multiple runs
const SUFFIX      = Date.now();
const TEST_USER   = `testuser_${SUFFIX}`;
const TEST_EMAIL  = `testuser_${SUFFIX}@test.local`;
const TEST_PASS   = "TestPass1!";

// ─────────────────────────────────────────────────────────────────────────────
// Cookie Jar
// Tracks Set-Cookie headers and re-sends them on subsequent requests,
// mimicking browser cookie storage for a single origin.
// ─────────────────────────────────────────────────────────────────────────────

class CookieJar {
  constructor() {
    this._store = {};
  }

  /** Parse every Set-Cookie header from a Response and store name=value. */
  ingest(headers) {
    let cookies = [];
    // getSetCookie() is available from Node 18.14 / undici 5.19
    if (typeof headers.getSetCookie === "function") {
      cookies = headers.getSetCookie();
    } else {
      // Fallback: single combined string (comma-separated for simple values)
      const raw = headers.get("set-cookie");
      if (raw) cookies = raw.split(/,(?=[A-Za-z0-9_-]+=)/);
    }
    for (const line of cookies) {
      const [nameVal] = line.split(";");
      const eq = nameVal.indexOf("=");
      if (eq === -1) continue;
      const name = nameVal.slice(0, eq).trim();
      const val  = nameVal.slice(eq + 1).trim();
      this._store[name] = val;
    }
  }

  /** Produce the Cookie: header value for outgoing requests. */
  header() {
    return Object.entries(this._store)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  has(name) {
    return Object.prototype.hasOwnProperty.call(this._store, name);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /csrf-token, store cookies, return the token string.
 * Must be called once per jar before any POST, and again after login because
 * session.regenerate() changes the session ID (= the CSRF secret).
 */
async function getCsrfToken(jar) {
  const res = await fetch(`${BASE}/csrf-token`, {
    headers: { cookie: jar.header() },
  });
  jar.ingest(res.headers);
  const body = await res.json();
  return body.csrfToken;
}

/**
 * POST with JSON body, CSRF header, and current cookies.
 * Returns { status, data } where data is the parsed JSON body (or null).
 */
async function postJSON(path, body, jar, csrfToken) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cookie":         jar.header(),
      "x-csrf-token":   csrfToken,
    },
    body: JSON.stringify(body),
  });
  jar.ingest(res.headers);
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

/**
 * GET with current cookies.
 * Returns { status, data }.
 */
async function getJSON(path, jar) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { cookie: jar.header() },
  });
  jar.ingest(res.headers);
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test runner
// ─────────────────────────────────────────────────────────────────────────────

let _pass = 0;
let _fail = 0;

function check(label, condition, note = "") {
  if (condition) {
    console.log(`    ✅  PASS  ${label}`);
    _pass++;
  } else {
    const detail = note ? `  →  ${note}` : "";
    console.log(`    ❌  FAIL  ${label}${detail}`);
    _fail++;
  }
}

function section(title) {
  const bar = "─".repeat(Math.max(0, 60 - title.length - 4));
  console.log(`\n── ${title} ${bar}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(62));
  console.log(`  Login Flow Test Suite`);
  console.log(`  Target : ${BASE}`);
  console.log(`  Account: ${TEST_USER}`);
  console.log("═".repeat(62));

  // ── SETUP ─────────────────────────────────────────────────────────────────
  // Register a fresh test account that the login tests will use.
  // Each run uses a unique timestamp so repeated runs never conflict.
  section("SETUP — register throw-away test account");

  const setupJar  = new CookieJar();
  const setupCsrf = await getCsrfToken(setupJar);

  const { status: regStatus, data: regData } = await postJSON(
    "/auth/register",
    { username: TEST_USER, email: TEST_EMAIL, password: TEST_PASS },
    setupJar,
    setupCsrf
  );

  check(
    `POST /auth/register → 201`,
    regStatus === 201,
    `got ${regStatus}: ${JSON.stringify(regData)}`
  );

  if (regStatus !== 201) {
    console.log("\n  ⛔  Setup failed — aborting.\n");
    process.exit(1);
  }

  // ── TEST 1: Correct credentials ───────────────────────────────────────────
  section("TEST 1 — Correct username and password");

  const jar1  = new CookieJar();
  const csrf1 = await getCsrfToken(jar1);

  const { status: s1, data: d1 } = await postJSON(
    "/auth/login",
    { username: TEST_USER, password: TEST_PASS },
    jar1,
    csrf1
  );

  check("POST /auth/login → 200",           s1 === 200, `got ${s1}`);
  check("Response contains username",        d1?.username === TEST_USER);
  check("Response contains id",              typeof d1?.id === "number");
  check("Response contains email",           typeof d1?.email === "string");
  check("Response omits passwordHash",       !("passwordHash" in (d1 ?? {})));
  check("sessionId cookie issued",           jar1.has("sessionId"),
    `cookies: ${JSON.stringify(jar1._store)}`);

  // After session.regenerate() the old CSRF token is tied to the old session
  // ID.  Re-fetch the token now (same as frontend auth.js does with
  // await initCsrf()) before making the /auth/me GET (GET doesn't need CSRF,
  // but we need the fresh token for the POST in Test 6 below).
  const csrf1Refreshed = await getCsrfToken(jar1);

  const { status: meS1, data: meD1 } = await getJSON("/auth/me", jar1);
  check("GET /auth/me → 200 with user",
    meS1 === 200 && meD1?.user?.username === TEST_USER,
    JSON.stringify(meD1));

  // ── TEST 2: Wrong password ────────────────────────────────────────────────
  section("TEST 2 — Wrong password");

  const jar2  = new CookieJar();
  const csrf2 = await getCsrfToken(jar2);

  const { status: s2, data: d2 } = await postJSON(
    "/auth/login",
    { username: TEST_USER, password: "WrongPassword99!" },
    jar2,
    csrf2
  );

  check("POST /auth/login → 401",           s2 === 401, `got ${s2}`);
  check("Response contains error field",     typeof d2?.error === "string",
    JSON.stringify(d2));
  check("Error message is 'Invalid credentials'",
    d2?.error === "Invalid credentials");

  // ── TEST 3: Non-existent account ──────────────────────────────────────────
  section("TEST 3 — Non-existent account");

  const jar3  = new CookieJar();
  const csrf3 = await getCsrfToken(jar3);

  const { status: s3, data: d3 } = await postJSON(
    "/auth/login",
    { username: "ghost_user_that_does_not_exist", password: TEST_PASS },
    jar3,
    csrf3
  );

  check("POST /auth/login → 401",           s3 === 401, `got ${s3}`);
  check("Response contains error field",     typeof d3?.error === "string",
    JSON.stringify(d3));
  // Same message as wrong-password: prevents user-enumeration attacks
  check("Error message identical to wrong-password (no user enumeration)",
    d3?.error === d2?.error,
    `non-existent: "${d3?.error}"  wrong-pass: "${d2?.error}"`);

  // ── TEST 4: Empty username and password ───────────────────────────────────
  section("TEST 4 — Empty username and password");

  const jar4  = new CookieJar();
  const csrf4 = await getCsrfToken(jar4);

  const { status: s4, data: d4 } = await postJSON(
    "/auth/login",
    { username: "", password: "" },
    jar4,
    csrf4
  );

  // handlers.js line 48: !username → 400 "Username and password are required"
  check("POST /auth/login → 400",            s4 === 400, `got ${s4}`);
  check("Response contains error field",      typeof d4?.error === "string",
    JSON.stringify(d4));
  check("Error message mentions both fields",
    d4?.error?.toLowerCase().includes("username") &&
    d4?.error?.toLowerCase().includes("password"));

  // ── TEST 5: SQL injection ─────────────────────────────────────────────────
  section("TEST 5 — SQL injection  (' OR '1'='1)");

  const jar5  = new CookieJar();
  const csrf5 = await getCsrfToken(jar5);

  // The login handler does NOT validate username format (only register does),
  // so this string reaches Prisma.  Prisma uses parameterised queries:
  // the value is treated as a literal string → no user found → 401.
  const sqlPayload = "' OR '1'='1";
  const { status: s5, data: d5 } = await postJSON(
    "/auth/login",
    { username: sqlPayload, password: sqlPayload },
    jar5,
    csrf5
  );

  check("POST /auth/login → 4xx (not 200)",  s5 >= 400 && s5 < 500,
    `got ${s5}`);
  check("Response contains error field",      typeof d5?.error === "string",
    JSON.stringify(d5));

  // Confirm the session is NOT authenticated after the injection attempt
  const { status: meS5, data: meD5 } = await getJSON("/auth/me", jar5);
  check("GET /auth/me → user is null (no session hijack)",
    meS5 === 200 && meD5?.user === null,
    JSON.stringify(meD5));

  // ── TEST 6: Authenticated endpoint after login ────────────────────────────
  section("TEST 6 — POST to auth-required endpoint after login");

  // jar1 still holds the session from Test 1.
  // csrf1Refreshed was fetched after login (session.regenerate() already ran)
  // so it is bound to the NEW session ID — no stale-token 403 will occur.
  const { status: s6, data: d6 } = await postJSON(
    "/messages",
    { content: "Hello from test-login.js" },
    jar1,
    csrf1Refreshed
  );

  check("POST /messages (logged-in) → 201",  s6 === 201,
    `got ${s6}: ${JSON.stringify(d6)}`);
  check("Response contains content",          d6?.content === "Hello from test-login.js");
  check("Response contains author.username",  d6?.author?.username === TEST_USER);
  check("Response contains createdAt",        typeof d6?.createdAt === "string");

  // ── TEST 7: Guest cannot POST to auth-required endpoint ───────────────────
  section("TEST 7 — Guest POST to auth-required endpoint (no login)");

  const guestJar  = new CookieJar();
  const guestCsrf = await getCsrfToken(guestJar);

  const { status: guestS, data: guestD } = await postJSON(
    "/messages",
    { content: "This should be blocked" },
    guestJar,
    guestCsrf
  );

  // middleware/requireAuth.js returns 401 when session.userId is absent
  check("POST /messages (guest) → 401",       guestS === 401,
    `got ${guestS}: ${JSON.stringify(guestD)}`);
  check("Response contains error field",       typeof guestD?.error === "string");

  // ── RESULTS ───────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(62));
  const total = _pass + _fail;
  console.log(`  Results: ${_pass}/${total} passed,  ${_fail} failed`);
  if (_fail === 0) {
    console.log("  ✅  All tests passed.");
  } else {
    console.log("  ❌  Some tests failed — see FAIL lines above.");
  }
  console.log("═".repeat(62) + "\n");

  process.exit(_fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\n⛔  Unhandled error:", err.message);
  process.exit(1);
});

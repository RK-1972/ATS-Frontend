/**
 * Runtime probe for enterprise routes — read-only diagnostic, no app changes.
 */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:5173";
const ROUTES = [
  { name: "Recruiter", path: "/recruiter" },
  { name: "Platform Configuration", path: "/platform-configuration" },
  { name: "Business Rules", path: "/business-rules" },
  { name: "Master Data", path: "/master-data" },
  { name: "Workforce Planning", path: "/workforce-planning" },
  { name: "Hiring Control Tower", path: "/hiring-control-tower" }
];

function parseStack(stack = "") {
  const frames = stack
    .split("\n")
    .slice(1, 8)
    .map((l) => l.trim())
    .filter(Boolean);
  return frames;
}

function firstComponentFromStack(stack = "") {
  const m = stack.match(/at (\w+) \(/);
  if (m) return m[1];
  const file = stack.match(/\/([\w]+)\.(jsx|js|tsx)/);
  return file ? file[1] : null;
}

async function probeRoute(page, route) {
  const pageErrors = [];
  const consoleErrors = [];
  const networkErrors = [];

  const onPageError = (err) => pageErrors.push({ message: err.message, stack: err.stack || "" });
  const onConsole = (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  const failedModules = [];
  const badModuleResponses = [];
  const onRequestFailed = (req) => {
    const url = req.url();
    const err = `${req.method()} ${url} — ${req.failure()?.errorText || "failed"}`;
    networkErrors.push(err);
    if (/\.(jsx|js|tsx|ts)(\?|$)/.test(url) && url.includes("/src/")) {
      failedModules.push(err);
    }
  };
  const onResponse = (res) => {
    const url = res.url();
    if (res.status() >= 400 && url.includes("/api/")) {
      networkErrors.push(`${res.status()} ${url}`);
    }
    if (res.status() >= 400 && /\/src\/.*\.(jsx|js)(\?|$)/.test(url)) {
      badModuleResponses.push(`${res.status()} ${url}`);
    }
  };

  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);

  const bodyText = (await page.locator("body").innerText()).trim();
  const mainHtml = await page.locator("main, [role='main'], #root").first().innerHTML().catch(() => "");
  const isBlank = bodyText.length < 30 || (!bodyText && mainHtml.length < 100);

  page.off("pageerror", onPageError);
  page.off("console", onConsole);
  page.off("requestfailed", onRequestFailed);
  page.off("response", onResponse);

  const firstPageError = pageErrors[0];
  const stack = firstPageError?.stack || "";
  const frames = parseStack(stack);

  return {
    route: route.path,
    name: route.name,
    isBlank,
    bodyLength: bodyText.length,
    bodySample: bodyText.slice(0, 120).replace(/\s+/g, " "),
    firstReactException: firstPageError?.message || null,
    firstConsoleError: consoleErrors[0] || null,
    firstNetworkError: networkErrors[0] || null,
    renderStopComponent: firstComponentFromStack(stack),
    stackFrames: frames,
    allPageErrors: pageErrors.map((e) => e.message),
    allConsoleErrors: consoleErrors.slice(0, 5),
    allNetworkErrors: networkErrors.slice(0, 10),
    failedModuleImports: failedModules,
    badModuleResponses
  };
}

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PW_CHANNEL || "msedge"
});
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
// Login via API if credentials provided
const LOGIN_EMAIL = process.env.PROBE_EMAIL || "";
const LOGIN_PASSWORD = process.env.PROBE_PASSWORD || "";
if (LOGIN_EMAIL && LOGIN_PASSWORD) {
  const loginRes = await page.request.post("http://localhost:5000/login", {
    data: { email_id: LOGIN_EMAIL, password: LOGIN_PASSWORD }
  });
  const loginJson = await loginRes.json();
  if (loginJson.token) {
    await page.evaluate(({ token, user }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }, { token: loginJson.token, user: loginJson.user });
    console.log("Logged in as:", loginJson.user?.role_name);
  } else {
    console.log("Login failed:", loginJson.message || loginJson);
  }
} else {
  await page.evaluate(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        user_id: 1,
        employee_code: "ADMIN001",
        full_name: "Admin User",
        role_name: "Admin",
        email_id: "admin@igsglobal.com"
      })
    );
    localStorage.setItem("token", "probe-token");
  });
}

const results = [];
for (const route of ROUTES) {
  const r = await probeRoute(page, route);
  results.push(r);
  console.log("---");
  console.log(JSON.stringify(r, null, 2));
}

await browser.close();
console.log("\n=== SUMMARY JSON ===");
console.log(JSON.stringify(results, null, 2));

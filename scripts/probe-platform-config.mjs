/**
 * Platform Configuration module probe — first error capture only.
 */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:5173";
const ROUTE = "/platform-configuration";

function firstComponent(stack = "") {
  const m = stack.match(/at (\w+) \(/);
  if (m) return m[1];
  const f = stack.match(/\/([\w]+)\.(jsx|js)/);
  return f ? f[1] : null;
}

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();

const pageErrors = [];
const consoleErrors = [];
const networkErrors = [];

page.on("pageerror", (e) => pageErrors.push({ message: e.message, stack: e.stack || "" }));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("requestfailed", (req) => {
  networkErrors.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText || "failed"}`);
});
page.on("response", (res) => {
  const url = res.url();
  if (res.status() >= 400) {
    if (url.includes("/api/") || /\/src\/.*\.(jsx|js)(\?|$)/.test(url)) {
      networkErrors.push(`${res.status()} ${url}`);
    }
  }
});

// Real login via UI if credentials supplied
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
const email = process.env.PROBE_EMAIL;
const password = process.env.PROBE_PASSWORD;

if (email && password) {
  await page.fill('input[name="email_id"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
} else {
  console.log("NOTE: Set PROBE_EMAIL and PROBE_PASSWORD for authenticated probe");
}

await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const bodyText = (await page.locator("body").innerText()).trim();
const hasPlatform = /platform configuration|modules|workflows|overview/i.test(bodyText);
const isBlank = bodyText.length < 40;

const firstPage = pageErrors[0];
const report = {
  route: ROUTE,
  isBlank,
  bodyLength: bodyText.length,
  hasPlatformContent: hasPlatform,
  bodySample: bodyText.slice(0, 200).replace(/\s+/g, " "),
  firstReactException: firstPage?.message || null,
  firstConsoleError: consoleErrors.find((e) => !e.includes("401") && !e.includes("bootstrap")) || consoleErrors[0] || null,
  firstNetworkError: networkErrors.find((e) => !e.startsWith("401")) || networkErrors[0] || null,
  failingComponent: firstPage ? firstComponent(firstPage.stack) : null,
  stackFrames: firstPage ? (firstPage.stack || "").split("\n").slice(0, 8) : [],
  allPageErrors: pageErrors.map((e) => e.message),
  allConsoleErrors: consoleErrors.slice(0, 10),
  allNetworkErrors: networkErrors.slice(0, 10)
};

console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(isBlank || firstPage ? 1 : 0);

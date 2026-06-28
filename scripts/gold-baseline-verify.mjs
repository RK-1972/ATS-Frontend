/**
 * Enterprise Gold Baseline verification — read-only diagnostic.
 * Usage: node scripts/gold-baseline-verify.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:5173";
const API = process.env.API_URL || "http://localhost:5000";

const ROUTES = [
  { group: "Enterprise", path: "/platform-configuration", expect: ["Platform"] },
  { group: "Enterprise", path: "/platform-configuration/modules", expect: ["Module"] },
  { group: "Enterprise", path: "/platform-configuration/workflows", expect: ["Workflow"] },
  { group: "Enterprise", path: "/platform-configuration/budget", expect: ["Budget"] },
  { group: "Enterprise", path: "/platform-configuration/notifications", expect: ["Notification"] },
  { group: "Enterprise", path: "/platform-configuration/ai", expect: ["AI"] },
  { group: "Enterprise", path: "/platform-configuration/roles", expect: ["Role"] },
  { group: "Enterprise", path: "/business-rules", expect: ["Business Rules"] },
  { group: "Enterprise", path: "/business-rules/library", expect: ["Rule"] },
  { group: "Enterprise", path: "/business-rules/designer", expect: ["Designer"] },
  { group: "Enterprise", path: "/business-rules/approval-matrix", expect: ["Approval"] },
  { group: "Enterprise", path: "/business-rules/simulator", expect: ["Simul"] },
  { group: "Enterprise", path: "/business-rules/history", expect: ["History"] },
  { group: "Enterprise", path: "/master-data", expect: ["Master"] },
  { group: "Enterprise", path: "/workforce-planning", expect: ["Workforce"] },
  { group: "Enterprise", path: "/workforce-planning/requests", expect: ["Budget"] },
  { group: "Enterprise", path: "/workforce-planning/approvals", expect: ["Approval"] },
  { group: "Enterprise", path: "/workforce-planning/catalogue", expect: ["catalogue"] },
  { group: "Enterprise", path: "/workforce-planning/exceptions", expect: ["Exception"] },
  { group: "Enterprise", path: "/workforce-planning/analytics", expect: ["Analytics"] },
  { group: "Enterprise", path: "/hiring-control-tower", expect: ["Hiring Control Tower"] },
  { group: "Recruitment", path: "/candidates", role: "Recruiter", expect: ["Candidate"] },
  { group: "Recruitment", path: "/requisitions", role: "Admin", expect: ["Requisition"] },
  { group: "Recruitment", path: "/recruiter", role: "Recruiter", expect: ["Recruiter"] },
  { group: "Interview", path: "/interview-schedule", role: "Recruiter", expect: ["Interview"] },
  { group: "Interview", path: "/interview-panel", role: "Recruiter", expect: ["Interview"] },
  { group: "Interview", path: "/interviewer", role: "Interviewer", expect: ["Interviewer"] },
  { group: "Offer", path: "/candidates", role: "Recruiter", expect: ["Candidate"] },
  { group: "Dashboard", path: "/", role: "Admin", expect: ["Dashboard"] },
  { group: "Dashboard", path: "/", role: "Recruiter", expect: ["Recruiter"] }
];

function seedSession(page, role) {
  return page.evaluate((userRole) => {
    localStorage.setItem("token", "gold-baseline-token");
    localStorage.setItem("user", JSON.stringify({
      user_id: 1,
      employee_code: userRole === "Recruiter" ? "REC001" : "ADMIN001",
      full_name: `${userRole} User`,
      role_name: userRole,
      email_id: `${userRole.toLowerCase()}@example.com`
    }));
  }, role);
}

async function probeRoute(page, { path, role = "Admin", expect = [] }) {
  const pageErrors = [];
  const onErr = (error) => pageErrors.push(error.message);

  page.on("pageerror", onErr);
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await seedSession(page, role);
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1200);

  const text = await page.locator("main").innerText().catch(async () => page.locator("body").innerText());
  const ok = pageErrors.length === 0
    && text.length > 80
    && expect.some((snippet) => text.includes(snippet));

  page.off("pageerror", onErr);

  return {
    path,
    role,
    ok,
    mainLen: text.length,
    pageErrors: pageErrors.slice(0, 1)
  };
}

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PW_CHANNEL || "msedge"
});
const page = await browser.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
const loginFormOk = (await page.locator('input[name="email_id"]').count()) > 0
  && (await page.locator('input[name="password"]').count()) > 0;

const badLogin = await page.request.post(`${API}/login`, {
  data: { email_id: "invalid-probe@example.com", password: "invalid" }
});
const loginApiOk = badLogin.status() === 401;

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.fill('input[name="email_id"]', "invalid-probe@example.com");
await page.fill('input[name="password"]', "invalid");
const loginButton = page.getByRole("button", { name: /login|sign in/i });
if (await loginButton.count()) {
  await loginButton.first().click();
} else {
  await page.locator("button").filter({ hasText: /login/i }).first().click();
}
await page.waitForTimeout(2000);
const loginUiErrorOk = /Invalid|Login Failed|Failed/i.test(await page.locator("body").innerText());

const routeResults = [];
for (const route of ROUTES) {
  routeResults.push({ group: route.group, ...(await probeRoute(page, route)) });
}

const summary = {
  loginPage: loginFormOk,
  loginApiEndpoint: loginApiOk,
  loginUiErrorHandling: loginUiErrorOk,
  totalRoutes: routeResults.length,
  passedRoutes: routeResults.filter((item) => item.ok).length,
  failedRoutes: routeResults.filter((item) => !item.ok),
  routeResults
};

console.log(JSON.stringify(summary, null, 2));
await browser.close();

process.exit(summary.failedRoutes.length || !loginFormOk || !loginApiOk || !loginUiErrorOk ? 1 : 0);

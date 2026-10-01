/**
 * Mobile responsive master audit — trace only, outputs JSON to stdout.
 * Usage: node scripts/responsiveMasterAudit.mjs
 * Requires: frontend :5173, backend :5000, playwright chromium
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_JSON = path.resolve(__dirname, "../../docs/responsive-master-matrix.json");

const BASE = process.env.BASE_URL || "http://localhost:5173";
const API = process.env.API_URL || "http://localhost:5000";
const PASSWORD = process.env.E2E_DEMO_PASSWORD || "Demo@Optalynx2026";

const VIEWPORTS = [
  { id: "390x844", width: 390, height: 844 },
  { id: "375x812", width: 375, height: 812 },
  { id: "430x932", width: 430, height: 932 }
];

const USERS = {
  admin: "demo.admin@optalynx.demo",
  recruiter: "demo.recruiter@optalynx.demo",
  interviewer: "demo.interviewer@optalynx.demo"
};

async function login(email) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_id: email, password: PASSWORD })
  });
  const body = await res.json();
  const token = body?.token || body?.data?.token;
  if (!token) throw new Error(`Login failed ${email}: ${body?.message || res.status}`);
  return { token, user: body.user || body.data?.user || body.data };
}

async function measurePage(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(
      doc.scrollWidth,
      body?.scrollWidth || 0
    ) - doc.clientWidth;
    const offenders = [];
    const vw = doc.clientWidth;
    const walk = (el, depth) => {
      if (!el || depth > 12 || el.nodeType !== 1) return;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return;
      if (rect.width < 2 || rect.height < 2) return;
      const right = rect.right;
      const left = rect.left;
      if (right > vw + 2 || left < -2) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && String(el.className).slice(0, 80)) || "";
        offenders.push({
          tag,
          class: cls,
          right: Math.round(right),
          left: Math.round(left),
          width: Math.round(rect.width)
        });
      }
      for (const child of el.children) walk(child, depth + 1);
    };
    walk(body, 0);
    const smallTargets = [];
    document.querySelectorAll("button, a, [role='button'], .MuiIconButton-root").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40)) {
        smallTargets.push({
          w: Math.round(r.width),
          h: Math.round(r.height),
          text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)
        });
      }
    });
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      overflowPx: Math.max(0, Math.round(overflowX)),
      offenderCount: offenders.length,
      topOffenders: offenders.slice(0, 8),
      smallTouchTargets: smallTargets.slice(0, 10),
      hasHorizontalScroll: doc.scrollWidth > doc.clientWidth + 1
    };
  });
}

async function auditRoute(browser, viewport, route, label, auth, extraWaitMs = 0) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36"
  });
  const page = await context.newPage();
  const result = {
    route,
    label,
    viewport: viewport.id,
    status: "ok",
    notes: [],
    metrics: null,
    classification: "A"
  };
  try {
    if (auth) {
      await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.evaluate(({ token, user }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        const ws = user?.workspace || {};
        if (Object.keys(ws).length) localStorage.setItem("workspace", JSON.stringify(ws));
      }, { token: auth.token, user: auth.user });
    }
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 120000 });
    if (extraWaitMs) await page.waitForTimeout(extraWaitMs);
    result.metrics = await measurePage(page);
    const bodyText = await page.locator("body").innerText();
    if (/unable to load|error|403|404/i.test(bodyText) && bodyText.length < 800) {
      result.notes.push("Possible error/empty state on load");
    }
    if (result.metrics.hasHorizontalScroll) {
      result.classification = "C";
      result.notes.push(`Page-level horizontal overflow ~${result.metrics.overflowPx}px`);
    } else if (result.metrics.offenderCount > 3) {
      result.classification = "B";
      result.notes.push("Minor elements extend viewport; no document scroll");
    }
    if (result.metrics.smallTouchTargets.length >= 5) {
      result.notes.push("Multiple sub-40px touch targets");
      if (result.classification === "A") result.classification = "B";
    }
  } catch (error) {
    result.status = "error";
    result.notes.push(error.message);
    result.classification = "F";
  } finally {
    await context.close();
  }
  return result;
}

async function auditLoginForm(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  const metrics = await measurePage(page);
  const canSubmit = await page.locator('button[type="submit"], button:has-text("Sign In")').first().isVisible();
  await context.close();
  return { metrics, canSubmit };
}

async function main() {
  const health = await fetch(`${API}/login`, { method: "OPTIONS" }).catch(() => null);
  const fe = await fetch(BASE).catch(() => null);
  if (!fe?.ok) {
    console.error("Frontend not reachable at", BASE);
    process.exit(1);
  }

  const auths = {};
  for (const [key, email] of Object.entries(USERS)) {
    try {
      auths[key] = await login(email);
    } catch (e) {
      auths[key] = null;
      console.warn("Login skip", key, e.message);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const primaryVp = VIEWPORTS[0];
  const routes = [
    { route: "/login", label: "Login", auth: null },
    { route: "/workspace", label: "Workspace picker", auth: "recruiter" },
    { route: "/recruiter", label: "Recruiter cockpit", auth: "recruiter" },
    { route: "/recruiter/workspace", label: "Recruiter workspace", auth: "recruiter" },
    { route: "/ta-lead", label: "TA Lead workspace", auth: "admin" },
    { route: "/hiring-manager", label: "Hiring Manager workspace", auth: "recruiter" },
    { route: "/interviewer", label: "Interviewer home", auth: "interviewer" },
    { route: "/candidates", label: "Candidate list", auth: "recruiter" },
    { route: "/candidate/login", label: "Candidate portal login", auth: null },
    { route: "/candidate/jobs", label: "Candidate jobs (may redirect)", auth: null },
    { route: "/hiring-control-tower", label: "HCT", auth: "admin" },
    { route: "/recruiter/my-requisitions", label: "My requisitions", auth: "recruiter" },
    { route: "/interview-schedule", label: "Interview schedule", auth: "recruiter" },
    { route: "/offers", label: "Offer hub", auth: "recruiter" },
    { route: "/reports", label: "Reports center", auth: "admin" },
    { route: "/", label: "Admin home", auth: "admin" },
    { route: "/platform-configuration", label: "Platform config", auth: "admin" },
    { route: "/requisitions", label: "Requisitions", auth: "recruiter" }
  ];

  const results = [];
  const loginChecks = [];

  for (const vp of VIEWPORTS) {
    const login = await auditLoginForm(browser, vp);
    loginChecks.push({ viewport: vp.id, ...login });
  }

  for (const vp of VIEWPORTS) {
    for (const item of routes) {
      const auth = item.auth ? auths[item.auth] : null;
      if (item.auth && !auth) continue;
      results.push(await auditRoute(browser, vp, item.route, item.label, auth, 1500));
    }
  }

  // Try requisition details if list has link
  if (auths.recruiter) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate(({ token, user }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }, auths.recruiter);
    await page.goto(`${BASE}/recruiter/my-requisitions`, { waitUntil: "networkidle", timeout: 120000 });
    const link = page.locator("a[href*='/recruiter/my-requisitions/'], [role='row']").first();
    let reqDetail = null;
    if (await link.count()) {
      try {
        await link.click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        reqDetail = await measurePage(page);
      } catch {
        reqDetail = { note: "Could not open requisition detail row" };
      }
    }
    results.push({
      route: "/recruiter/my-requisitions/:code",
      label: "Requisition details",
      viewport: "390x844",
      status: "ok",
      metrics: reqDetail,
      classification: reqDetail?.hasHorizontalScroll ? "C" : "B",
      notes: []
    });
    await ctx.close();
  }

  await browser.close();

  const payload = {
    auditedAt: new Date().toISOString(),
    baseUrl: BASE,
    viewports: VIEWPORTS.map((v) => v.id),
    loginChecks,
    routeResults: results,
    summary: {
      total: results.length,
      pageOverflow: results.filter((r) => r.metrics?.hasHorizontalScroll).length,
      errors: results.filter((r) => r.status === "error").length
    }
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));
  console.log("Wrote", OUT_JSON);
  console.log(JSON.stringify(payload.summary));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Runtime check against dev app + real /interview-schedules (no schedule mock).
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, "../../ats-backend/package.json"));
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const manifestPath = path.resolve(__dirname, "../../ats-backend/demo/e2e-demo.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
dotenv.config({ path: path.resolve(__dirname, "../../ats-backend/.env") });

const APP_BASE = process.env.E2E_APP_BASE_URL || "http://localhost:5173";
const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:5000";

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail) {
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
  process.exitCode = 1;
}

function buildRecruiterSession() {
  const account = manifest.users.accounts.find((item) => item.key === "recruiter");
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  const user = {
    user_id: 1,
    employee_code: "IGS001",
    email_id: account.email,
    role_name: "Recruiter",
    secondary_role: null
  };
  const token = jwt.sign(
    {
      user_id: user.user_id,
      employee_code: user.employee_code,
      email_id: user.email_id,
      role_name: user.role_name,
      secondary_role: null
    },
    secret,
    { expiresIn: "2h" }
  );
  return { token, user };
}

async function main() {
  const { token, user } = buildRecruiterSession();
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  await page.addInitScript(
    ({ authToken, authUser }) => {
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));
    },
    { authToken: token, authUser: user }
  );

  const schedulesResponse = await page.request.get(`${API_BASE}/interview-schedules`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const schedulesBody = await schedulesResponse.json();
  const apiRows = schedulesBody.data || [];
  const rishabhInApi = apiRows.filter((row) =>
    String(row.candidate_name || "").toLowerCase().includes("rishabh sehgal")
  );
  const shankarInApi = apiRows.filter((row) =>
    String(row.candidate_name || "").toLowerCase().includes("shankar")
  );
  console.log(
    `API schedules: total=${apiRows.length} rishabh=${rishabhInApi.length} shankar=${shankarInApi.length}`
  );

  await page.goto(`${APP_BASE}/interview-schedule`, { waitUntil: "domcontentloaded", timeout: 60000 });

  const section = page
    .getByRole("heading", { name: "Scheduled Interviews" })
    .locator("xpath=ancestor::*[.//*[@role='grid'] or .//input][1]");

  await page.getByPlaceholder(/Search requisition, position, candidate/i).waitFor({ timeout: 30000 });

  const searchInput = page.getByPlaceholder(/Search requisition, position, candidate/i);
  await searchInput.fill("Rishabh Sehgal");
  await page.waitForTimeout(800);

  const bodyText = await page.locator("main").innerText();
  const hasRishabh = /Rishabh\s+Sehgal/i.test(bodyText);
  const hasShankar = /shankar\s+adiga/i.test(bodyText);

  console.log(`DOM has Rishabh Sehgal: ${hasRishabh}`);
  console.log(`DOM has shankar adiga: ${hasShankar}`);

  if (rishabhInApi.length > 0) {
    if (hasRishabh && !hasShankar) {
      pass("Live UI: Rishabh visible, shankar hidden after search");
    } else {
      fail(
        "Live UI search",
        `hasRishabh=${hasRishabh} hasShankar=${hasShankar} (API has ${rishabhInApi.length} Rishabh row(s))`
      );
    }
  } else {
    console.log("SKIP: no Rishabh Sehgal row in API for IGS001");
  }

  await searchInput.fill("");
  await page.waitForTimeout(400);
  const clearedText = await page.locator("main").innerText();
  if (shankarInApi.length > 0 && /shankar\s+adiga/i.test(clearedText)) {
    pass("Clear search restores shankar row in UI");
  } else if (shankarInApi.length === 0) {
    console.log("SKIP: no shankar row in API");
  } else {
    fail("Clear search", "expected shankar visible after clear");
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

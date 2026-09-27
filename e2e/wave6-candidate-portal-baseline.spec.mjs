/**
 * Wave 6 Phase 2 — Candidate portal journey baseline (execution only).
 */
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:5000";
const PASSWORD = "TestPass1!";

function buildMinimalPdfBuffer() {
  return Buffer.from(
    `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj
4 0 obj<</Length 80>>stream
BT /F1 12 Tf 72 720 Td (Wave6 E2E Candidate) Tj ET
endstream
endobj
trailer<</Size 4/Root 1 0 R>>
startxref
200
%%EOF`,
    "utf8"
  );
}

async function registerAndLogin(request, suffix) {
  const email = `w6.e2e.${suffix}@example.com`;
  const register = await request.post(`${API_BASE}/candidate-portal/register`, {
    data: {
      full_name: `Wave6 E2E ${suffix}`,
      mobile_number: "9876501234",
      email_id: email,
      password: PASSWORD,
      confirm_password: PASSWORD
    }
  });
  expect(register.ok()).toBeTruthy();
  const login = await request.post(`${API_BASE}/candidate-portal/login`, {
    data: { email_id: email, password: PASSWORD }
  });
  expect(login.ok()).toBeTruthy();
  const loginBody = await login.json();
  const token = loginBody.data?.token;
  expect(token).toBeTruthy();
  return { email, token };
}

async function completePortalProfile(request, token, email) {
  const intake = await request.post(`${API_BASE}/candidate-portal/profile/intake`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(intake.ok()).toBeTruthy();
  const intakeId = (await intake.json()).data?.intake_id;
  const pdfPath = path.join(__dirname, "artifacts", `w6-resume-${Date.now()}.pdf`);
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  fs.writeFileSync(pdfPath, buildMinimalPdfBuffer());
  const upload = await request.post(
    `${API_BASE}/candidate-portal/profile/intake/${intakeId}/process`,
    {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        resume: {
          name: "resume.pdf",
          mimeType: "application/pdf",
          buffer: buildMinimalPdfBuffer()
        }
      }
    }
  );
  expect(upload.ok()).toBeTruthy();
  const parse = await request.post(
    `${API_BASE}/candidate-portal/profile/intake/${intakeId}/parse`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  expect(parse.ok()).toBeTruthy();
  const save = await request.put(`${API_BASE}/candidate-portal/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      first_name: "Wave6",
      last_name: "E2E",
      email,
      mobile: "9876501234"
    }
  });
  expect(save.ok()).toBeTruthy();
}

async function seedCandidateSession(page, token, account) {
  await page.goto("/candidate/login");
  await page.evaluate(
    ({ tokenValue, user }) => {
      localStorage.setItem("candidate_token", tokenValue);
      localStorage.setItem("candidate_user", JSON.stringify(user));
    },
    {
      tokenValue: token,
      user: {
        full_name: account.full_name || "Wave6 E2E",
        email_id: account.email,
        candidate_id: account.candidate_id
      }
    }
  );
}

function emailField(page) {
  return page.locator('input[type="email"]').first();
}

function passwordField(page, name = "Password") {
  return page.getByRole("textbox", { name, exact: true });
}

test.describe("Wave 6 — Candidate portal baseline", () => {
  test("register and login via UI", async ({ page }) => {
    const suffix = Date.now();
    const email = `w6.ui.reg.${suffix}@example.com`;
    await page.goto("/candidate/register");
    await page.getByLabel("Full Name").fill(`Wave6 UI ${suffix}`);
    await page.getByLabel("Mobile Number").fill("9876510101");
    await emailField(page).fill(email);
    await passwordField(page, "Password").fill(PASSWORD);
    await page.getByRole("textbox", { name: "Confirm Password" }).fill(PASSWORD);
    await page.getByRole("button", { name: /^register$/i }).click();
    await expect(page.getByText(/account created successfully/i)).toBeVisible({
      timeout: 60000
    });
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/candidate\/login/, { timeout: 60000 });
    await emailField(page).fill(email);
    await passwordField(page, "Password").fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/candidate\/workspace/, { timeout: 90000 });
  });

  test("full journey: profile → jobs → apply → applications (API profile seed)", async ({
    page,
    request
  }) => {
    const suffix = Date.now();
    const { email, token } = await registerAndLogin(request, `journey.${suffix}`);
    await completePortalProfile(request, token, email);
    const me = await request.get(`${API_BASE}/candidate-portal/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meBody = await me.json();
    await seedCandidateSession(page, token, {
      email,
      full_name: meBody.data?.account?.full_name,
      candidate_id: meBody.data?.account?.candidate_id
    });

    await page.goto("/candidate/workspace");
    await expect(page.getByText(/Wave6 E2E|Wave6 UI/i).first()).toBeVisible({
      timeout: 60000
    });

    const open = await request.get(`${API_BASE}/candidate-portal/open-requisitions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const openBody = await open.json();
    const requisitions = Array.isArray(openBody.data?.requisitions)
      ? openBody.data.requisitions
      : [];
    const targetJob =
      requisitions.find(
        (row) =>
          row.requisition_code &&
          !/^REQ-SEC-IVW-/i.test(row.requisition_code)
      ) || requisitions[0];
    test.skip(!targetJob?.requisition_code, "no published open requisition for apply");

    await page.goto(
      `/candidate/jobs/${encodeURIComponent(targetJob.requisition_code)}`
    );
    await expect(page.getByText(targetJob.requisition_code).first()).toBeVisible({
      timeout: 60000
    });
    const applyBtn = page.getByRole("button", { name: /apply/i });
    await expect(applyBtn).toBeEnabled({ timeout: 60000 });
    await applyBtn.click();
    await expect(
      page.getByText(/submitted successfully|already applied/i).first()
    ).toBeVisible({ timeout: 90000 });

    await page.goto("/candidate/applications");
    await expect(page.getByText(/My Applications|Applications/i).first()).toBeVisible({
      timeout: 60000
    });
    await expect(page.locator("body")).toContainText(/Applied|REQ-/i);
  });

  test("apply disabled before profile readiness", async ({ page, request }) => {
    const suffix = Date.now();
    const { token } = await registerAndLogin(request, `unready.${suffix}`);
    await seedCandidateSession(page, token, { email: `w6.e2e.unready.${suffix}@example.com` });
    await page.goto("/candidate/jobs");
    const firstViewJob = page.getByRole("button", { name: "View Job" }).first();
    await expect(firstViewJob).toBeVisible({ timeout: 60000 });
    await firstViewJob.click();
    const applyBtn = page.getByRole("button", { name: /apply/i });
    await expect(applyBtn).toBeDisabled({ timeout: 60000 });
  });

  test("refresh while authenticated retains workspace", async ({ page, request }) => {
    const suffix = Date.now();
    const { token } = await registerAndLogin(request, `refresh.${suffix}`);
    await seedCandidateSession(page, token, { email: `w6.e2e.refresh.${suffix}@example.com` });
    await page.goto("/candidate/workspace");
    await expect(page.getByText(/workspace|profile/i).first()).toBeVisible({
      timeout: 60000
    });
    await page.reload();
    await expect(page).toHaveURL(/\/candidate\/workspace/, { timeout: 60000 });
  });

  test("logout and protected route redirect", async ({ page, request }) => {
    const suffix = Date.now();
    const { token } = await registerAndLogin(request, `logout.${suffix}`);
    await seedCandidateSession(page, token, { email: `w6.e2e.logout.${suffix}@example.com` });
    await page.goto("/candidate/workspace");
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/candidate\/login/, { timeout: 60000 });
    await page.goto("/candidate/applications");
    await expect(page).toHaveURL(/\/candidate\/login/, { timeout: 60000 });
  });

  test("deep-link to job detail while authenticated", async ({ page, request }) => {
    const suffix = Date.now();
    const { token } = await registerAndLogin(request, `deeplink.${suffix}`);
    const open = await request.get(`${API_BASE}/candidate-portal/open-requisitions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const openBody = await open.json();
    const code = openBody.data?.requisitions?.[0]?.requisition_code;
    test.skip(!code, "no published open requisition");
    await seedCandidateSession(page, token, { email: `w6.e2e.deeplink.${suffix}@example.com` });
    await page.goto(`/candidate/jobs/${encodeURIComponent(code)}`);
    await expect(page.getByText(code).first()).toBeVisible({ timeout: 60000 });
  });
});

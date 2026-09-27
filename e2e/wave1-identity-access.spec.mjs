import { test, expect } from "@playwright/test";

import { loginAs, logout } from "./helpers/session.mjs";
import { wave1Users } from "./helpers/wave1-identities.mjs";
import { applyEmployeeSession, loadHmBrowserSession } from "./helpers/hm-session.mjs";
import { loginEmployeeViaApi } from "./helpers/api-login.mjs";

const users = wave1Users();

test.describe("Wave 1 — identity, access, navigation", () => {
  test("employee login reaches protected workspace", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await expect(page).not.toHaveURL(/\/login$/);
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();
  });

  test("logout blocks protected route", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await logout(page);
    await page.goto("/recruiter");
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
  });

  test("refresh while authenticated keeps session", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login$/);
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();
    expect(page.url()).toMatch(/\/(workspace|recruiter|interviewer|offers|ta-lead|my-approvals|workforce-planning|\/?$)/);
  });

  test("refresh after logout redirects protected content to login", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await page.goto("/recruiter", { waitUntil: "domcontentloaded" });
    await logout(page);
    await page.goto("/recruiter");
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
  });

  test("direct restricted workspace navigation requires auth", async ({ page }) => {
    await logout(page);
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login/, { timeout: 60000 });
  });

  test("unauthorized Hiring Manager workspace redirects to picker", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await page.goto("/hiring-manager", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/(workspace|hiring-manager)/, { timeout: 60000 });
    const flags = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("workspace") || "{}")
    );
    if (flags.showHiringManagerWorkspace) {
      test.skip(true, "Recruiter account has HM workspace flag — use another identity");
    }
    await expect(page).toHaveURL(/\/workspace/);
  });

  test("unauthorized TA Lead workspace redirects to picker", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await page.goto("/ta-lead", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/(workspace|ta-lead)/, { timeout: 90000 });
    const flags = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("workspace") || "{}")
    );
    if (flags.showTaLeadWorkspace) {
      test.skip(true, "Recruiter account has TA Lead workspace flag");
    }
    await expect(page).toHaveURL(/\/workspace/);
  });

  test("workspace picker lists available workspaces", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password);
    await page.goto("/workspace", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Choose Workspace")).toBeVisible({ timeout: 60000 });
    await expect(page.getByText("Recruitment Workspace", { exact: false })).toBeVisible();
  });

  test("candidate protected route redirects to candidate login", async ({ page }) => {
    await logout(page);
    await page.goto("/candidate/workspace");
    await expect(page).toHaveURL(/\/candidate\/login/, { timeout: 60000 });
  });
});

test.describe("Wave 1 — workspace entry (real identities)", () => {
  test("Hiring Manager workspace entry", async ({ page, request }) => {
    const hmSession = loadHmBrowserSession();
    const wave1Password = process.env.WAVE1_EMPLOYEE_PASSWORD;

    if (hmSession) {
      await applyEmployeeSession(page, hmSession);
    } else if (users.hiringManager && wave1Password) {
      const loginResponse = await request.post(
        `${process.env.E2E_API_BASE_URL || "http://localhost:5000"}/login`,
        { data: { email_id: users.hiringManager.email, password: wave1Password } }
      );
      test.skip(
        loginResponse.status() !== 200,
        "HM API login failed — run issueWave1HmBrowserSession.js"
      );
      await loginEmployeeViaApi(
        page,
        request,
        users.hiringManager.email,
        wave1Password
      );
    } else {
      test.skip(
        true,
        "Run node ats-backend/scripts/issueWave1HmBrowserSession.js or set WAVE1_EMPLOYEE_PASSWORD"
      );
    }

    await page.goto("/hiring-manager", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Hiring Manager Workspace")).toBeVisible({
      timeout: 120000
    });
  });

  test("Interviewer workspace entry", async ({ page }) => {
    await loginAs(page, users.interviewer.email, users.interviewer.password);
    await page.goto("/interviewer", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Interviewer Workspace")).toBeVisible({
      timeout: 120000
    });
  });

  test("Offer workspace entry", async ({ page }) => {
    await loginAs(page, users.recruiter.email, users.recruiter.password, {
      workspaceCard: "Offer Workspace"
    });
    await page.goto("/offers", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("main").getByText("Offer Workspace", { exact: true })
    ).toBeVisible({ timeout: 120000 });
  });
});

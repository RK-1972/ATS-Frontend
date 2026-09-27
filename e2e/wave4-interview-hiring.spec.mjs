import { test, expect } from "@playwright/test";

import { loginAs } from "./helpers/session.mjs";
import { loginEmployeeViaApi } from "./helpers/api-login.mjs";
import { resolveInterviewWorkspaceFixtures } from "./helpers/interview-workspace-fixtures.mjs";

const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:5000";

test.describe.configure({ mode: "serial" });

let fixtures = null;

test.beforeAll(async ({ request }) => {
  fixtures = await resolveInterviewWorkspaceFixtures(request);
});

test.describe("Wave 4 — Interview & hiring execution (browser)", () => {
  test("interviewer workspace entry and schedule list", async ({ page }) => {
    test.skip(!fixtures.hasPanelInterviews, "No /my-interviews rows for demo interviewer");

    await loginAs(page, fixtures.interviewerEmail, fixtures.password);
    await page.goto("/interviewer");

    await expect(page.getByText("Interviewer Workspace").first()).toBeVisible({
      timeout: 90000
    });
    await expect(page.getByText("My Interview Schedule").first()).toBeVisible();
    await expect(page.locator(".MuiDataGrid-row").first()).toBeVisible();
  });

  test("recruiter interview schedule workspace", async ({ page }) => {
    await loginAs(page, fixtures.recruiterEmail, fixtures.password);
    await page.goto("/interview-schedule");

    await expect(page.getByText("Interview Schedule").first()).toBeVisible({
      timeout: 90000
    });
    await expect(page.getByRole("button", { name: "Schedule Interview" }).first()).toBeVisible();
  });

  test("recruiter nav reaches interview management", async ({ page }) => {
    await loginAs(page, fixtures.recruiterEmail, fixtures.password);
    await page.goto("/recruiter");
    await page.getByRole("button", { name: "Interview Management" }).click();
    await expect(page).toHaveURL(/\/interview-schedule/);
    await expect(page.getByText("Interview Schedule").first()).toBeVisible();
  });

  test("panel member feedback form deep link", async ({ page, request }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");

    await loginEmployeeViaApi(
      page,
      request,
      fixtures.interviewerEmail,
      fixtures.password
    );
    await page.goto(`/feedback/${fixtures.panelScheduleId}`);

    await expect(page.getByText("Interview Feedback").first()).toBeVisible({
      timeout: 90000
    });
  });

  test("recruiter denied on panel feedback deep link", async ({ page }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");
    test.skip(
      !fixtures.recruiterDeniedFeedbackOnPanelSchedule,
      "Expected recruiter 403 on feedback-details for panel schedule"
    );

    await loginAs(page, fixtures.recruiterEmail, fixtures.password);
    await page.goto(`/feedback/${fixtures.panelScheduleId}`);

    await expect(page.getByText("Unable to load interview feedback")).toBeVisible({
      timeout: 90000
    });
    await expect(
      page.getByText(/not authorized to access feedback/i)
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit Feedback" })).toHaveCount(0);
  });

  test("unauthenticated view-feedback deep link is API-gated", async ({ page }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");

    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(`/view-feedback/${fixtures.panelScheduleId}`);

    await expect(
      page.getByText(/unable to load feedback|not authorized|access denied|token/i).first()
    ).toBeVisible({ timeout: 90000 });
    await expect(page.getByText("Interview Assessment Report")).toHaveCount(0);
  });

  test("recruiter denied on view-feedback deep link", async ({ page }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");
    test.skip(
      !fixtures.recruiterDeniedFeedbackReadOnPanelSchedule,
      "Expected recruiter 403 on GET /feedback for panel schedule"
    );

    await loginAs(page, fixtures.recruiterEmail, fixtures.password);
    await page.goto(`/view-feedback/${fixtures.panelScheduleId}`);

    await expect(
      page.getByText(/not authorized to access feedback/i)
    ).toBeVisible({ timeout: 90000 });
    await expect(page.getByText("Interview Assessment Report")).toHaveCount(0);
  });

  test("panel member view-feedback shows assessment report", async ({ page, request }) => {
    test.skip(!fixtures.panelViewFeedbackScheduleId, "No submitted feedback schedule for panel");

    await loginEmployeeViaApi(
      page,
      request,
      fixtures.interviewerEmail,
      fixtures.password
    );
    await page.goto(`/view-feedback/${fixtures.panelViewFeedbackScheduleId}`);

    await expect(page.getByText("Interview Assessment Report").first()).toBeVisible({
      timeout: 90000
    });
  });

  test("view-feedback deep link survives refresh", async ({ page, request }) => {
    test.skip(!fixtures.panelViewFeedbackScheduleId, "No submitted feedback schedule for panel");

    await loginEmployeeViaApi(
      page,
      request,
      fixtures.interviewerEmail,
      fixtures.password
    );
    const path = `/view-feedback/${fixtures.panelViewFeedbackScheduleId}`;
    await page.goto(path);
    await expect(page.getByText("Interview Assessment Report").first()).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")));
    await expect(page.getByText("Interview Assessment Report").first()).toBeVisible({
      timeout: 90000
    });
  });

  test("unauthenticated feedback deep link shows access error (API gate)", async ({ page }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");

    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(`/feedback/${fixtures.panelScheduleId}`);

    await expect(page.getByText("Unable to load interview feedback")).toBeVisible({
      timeout: 90000
    });
    await expect(page.getByRole("button", { name: "Submit Feedback" })).toHaveCount(0);
  });

  /**
   * Browser schedule happy path exercises UI → POST /schedule-interview → enterprise write.
   * Teams (createInterviewMeeting) and Graph email (sendInterviewEmail) are NOT asserted here:
   * production index.js always injects real helpers; the only safe deterministic seam is
   * handleScheduleInterview(pool, req, res, helpers) used in verifyPhase6c5InterviewScheduleNotification.js.
   * External Graph calls are non-deterministic and may emit real mail/meeting side effects.
   */
  test("recruiter completes interview schedule form (UI happy path)", async ({ page }) => {
    test.skip(!fixtures.scheduleFormFixture, "No recruiter schedule form fixture (req/map/panel)");

    const form = fixtures.scheduleFormFixture;

    await loginAs(page, fixtures.recruiterEmail, fixtures.password);
    await page.goto("/interview-schedule");
    await expect(page.getByText("Interview Schedule").first()).toBeVisible({
      timeout: 90000
    });

    const reqCombo = page.getByRole("combobox", { name: /requisition/i });
    await reqCombo.click();
    await page.getByRole("option", { name: new RegExp(form.reqCode, "i") }).first().click();

    const candidateCombo = page.getByRole("combobox", { name: /candidate/i });
    await candidateCombo.click();
    await page
      .getByRole("option", { name: new RegExp(form.candidateLabel.split(" - ")[0], "i") })
      .first()
      .click();

    await page.locator("#mui-component-select-interviewer_id").click();
    await page.getByRole("option", { name: form.panelName, exact: true }).click();

    await page.locator("#mui-component-select-round_type").click();
    await page
      .getByRole("listbox", { name: "Round" })
      .getByRole("option")
      .filter({ hasNotText: /^Select Round$/i })
      .first()
      .click();

    await page.getByLabel("Interview Date").fill(form.interviewDate);
    await page.getByLabel("Interview Time").fill(form.interviewTime);

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toMatch(/scheduled successfully/i);
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Schedule Interview" }).click();

    await expect(page.getByText("Scheduled Interviews").first()).toBeVisible({
      timeout: 90000
    });
  });

  test("schedule form rejects empty submit at API", async ({ page }) => {
    await loginAs(page, fixtures.recruiterEmail, fixtures.password);
    await page.goto("/interview-schedule");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toMatch(
        /failed|missing|required|schedule|interviewer not found/i
      );
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Schedule Interview" }).click();
  });

  test("interviewer refresh retains workspace", async ({ page }) => {
    test.skip(!fixtures.hasPanelInterviews, "No panel interviews");

    await loginAs(page, fixtures.interviewerEmail, fixtures.password);
    await page.goto("/interviewer");
    await expect(page.getByText("Interviewer Workspace").first()).toBeVisible();

    const url = page.url();
    await page.reload();
    await expect(page).toHaveURL(url);
    await expect(page.getByText("My Interview Schedule").first()).toBeVisible();
  });
});

test.describe("Wave 4 — Interview API security (HTTP)", () => {
  test("unauthenticated interview bundle returns 401", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/interviews`);
    expect(response.status()).toBe(401);
  });

  test("GET interview by id enforces caller scope", async ({ request }) => {
    test.skip(!fixtures.authorizedRecruiterInterviewId, "No recruiter-scoped interview id");

    const recruiterLogin = await request.post(`${API_BASE}/login`, {
      data: { email_id: fixtures.recruiterEmail, password: fixtures.password }
    });
    const recruiterBody = await recruiterLogin.json();

    const allowed = await request.get(
      `${API_BASE}/api/v1/interviews/${fixtures.authorizedRecruiterInterviewId}`,
      { headers: { Authorization: `Bearer ${recruiterBody.token}` } }
    );
    expect(allowed.status()).toBe(200);
    const allowedJson = await allowed.json();
    expect(allowedJson.success).toBe(true);
    expect(allowedJson.data?.interviewId).toBe(fixtures.authorizedRecruiterInterviewId);

    const unauth = await request.get(
      `${API_BASE}/api/v1/interviews/${fixtures.authorizedRecruiterInterviewId}`
    );
    expect(unauth.status()).toBe(401);

    test.skip(!fixtures.foreignInterviewId, "No cross-scope interview id (403 probe)");

    const denied = await request.get(
      `${API_BASE}/api/v1/interviews/${fixtures.foreignInterviewId}`,
      { headers: { Authorization: `Bearer ${recruiterBody.token}` } }
    );
    expect(denied.status()).toBe(403);
  });

  test("panel member can GET assigned enterprise interview by id", async ({ request }) => {
    test.skip(!fixtures.panelEnterpriseInterviewId, "No enterprise interview id for panel");

    const login = await request.post(`${API_BASE}/login`, {
      data: { email_id: fixtures.interviewerEmail, password: fixtures.password }
    });
    const { token } = await login.json();

    const response = await request.get(
      `${API_BASE}/api/v1/interviews/${fixtures.panelEnterpriseInterviewId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("unrelated recruiter cannot POST complete interview", async ({ request }) => {
    test.skip(!fixtures.foreignInterviewId, "No cross-scope interview id for mutation probe");
    test.skip(!fixtures.authorizedRecruiterInterviewId, "No recruiter-scoped interview id");

    const login = await request.post(`${API_BASE}/login`, {
      data: { email_id: fixtures.recruiterEmail, password: fixtures.password }
    });
    const { token } = await login.json();

    const denied = await request.post(
      `${API_BASE}/api/v1/interviews/${fixtures.foreignInterviewId}/complete`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { comment: "cross-wave audit probe" }
      }
    );

    expect(denied.status()).toBe(403);
  });

  test("TA Lead denied on panel GET /feedback (non-panel operator)", async ({ request }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");
    test.skip(
      !fixtures.taLeadVerificationToken,
      "Run node ats-backend/scripts/resolveWave1BrowserIdentities.js for TA Lead verification_token"
    );

    const response = await request.get(
      `${API_BASE}/feedback/${fixtures.panelScheduleId}`,
      {
        headers: { Authorization: `Bearer ${fixtures.taLeadVerificationToken}` }
      }
    );
    expect(response.status()).toBe(403);
  });

  test("recruiter cannot read panel feedback-details", async ({ request }) => {
    test.skip(!fixtures.panelScheduleId, "No panel schedule_id fixture");
    test.skip(
      !fixtures.recruiterDeniedFeedbackOnPanelSchedule,
      "Expected recruiter 403 on feedback-details"
    );

    const login = await request.post(`${API_BASE}/login`, {
      data: { email_id: fixtures.recruiterEmail, password: fixtures.password }
    });
    const { token } = await login.json();

    const response = await request.get(
      `${API_BASE}/feedback-details/${fixtures.panelScheduleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});

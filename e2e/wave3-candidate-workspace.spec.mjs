import { test, expect } from "@playwright/test";

import { loginAs } from "./helpers/session.mjs";
import { resolveCandidateWorkspaceFixtures } from "./helpers/candidate-workspace-fixtures.mjs";

test.describe.configure({ mode: "serial" });

let fixtures = null;

test.beforeAll(async ({ request }) => {
  fixtures = await resolveCandidateWorkspaceFixtures(request);
});

async function setWorkspaceView(page, view) {
  const label = view === "pipeline" ? "My Pipeline" : "Talent Pool";
  await page.getByRole("button", { name: label }).click();
}

async function openCandidate(page, candidateId, workspaceView = "pool") {
  await page.goto("/candidates");
  await setWorkspaceView(page, workspaceView);
  await page.goto(`/candidates/${candidateId}`);
  await expect(page.getByText("Candidate Workspace").first()).toBeVisible({
    timeout: 90000
  });
}

async function loginRecruiter(page) {
  await loginAs(page, fixtures.recruiterEmail, fixtures.password);
}

test.describe("Wave 3 — Candidate Workspace UI", () => {
  test("1 — authorized user opens /candidates/:id", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);
    await expect(page).toHaveURL(
      new RegExp(`/candidates/${fixtures.authorizedCandidateId}`)
    );
    await expect(page.getByText(/Candidate Workspace/).first()).toBeVisible();
  });

  test("2 — profile read (Overview + Personal)", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Personal Summary").first()).toBeVisible();

    await page.getByRole("tab", { name: "Personal" }).click();
    await expect(page.getByText("Personal Information").first()).toBeVisible();
    if (fixtures.authorizedDisplayName) {
      await expect(
        page.getByText(fixtures.authorizedDisplayName, { exact: false }).first()
      ).toBeVisible();
    }
  });

  test("3 — education read", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await page.getByRole("tab", { name: "Education" }).click();
    await expect(page.getByText("Education").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Education" }).first()
    ).toBeVisible();
  });

  test("4 — experience read", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await page.getByRole("tab", { name: "Experience" }).click();
    await expect(page.getByText("Experience").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Experience" }).first()
    ).toBeVisible();
  });

  test("5 — skills read", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await page.getByRole("tab", { name: "Skills" }).click();
    await expect(page.getByText("Skills Profile").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Skill" }).first()).toBeVisible();
  });

  test("6 — ownership view", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await expect(page.getByText("Ownership").first()).toBeVisible();
  });

  test("7 — resume / document access", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await page.getByRole("tab", { name: "Documents" }).click();
    await expect(page.getByText("Resume").first()).toBeVisible();

    const preview = page.getByRole("button", { name: "Preview" }).first();
    await expect(preview).toBeVisible();
    const disabled = await preview.isDisabled();
    if (!disabled) {
      const popupPromise = page.waitForEvent("popup", { timeout: 15000 }).catch(() => null);
      await preview.click();
      const popup = await popupPromise;
      if (popup) {
        await popup.close();
      }
    }
  });

  test("8 — requisition / pipeline context", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.mappedCandidateId, "pipeline");

    await expect(page.getByText("Assignment").first()).toBeVisible();
    await expect(page.getByText("Requisition").first()).toBeVisible();

    if (fixtures.hasMappedRequisition) {
      await expect(page.getByText("Assigned").first()).toBeVisible();
    }
  });

  test("9 — stage controls when mapping exposes map_id", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.mappedCandidateId, "pipeline");

    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();

    const stageLabel = page.getByLabel("Pipeline stage");
    if (fixtures.hasMappedRequisition) {
      await expect(stageLabel).toBeVisible({ timeout: 60000 });
      await expect(page.getByRole("button", { name: "Update Stage" })).toBeVisible();
    } else {
      await expect(stageLabel).toHaveCount(0);
    }
  });

  test("10 — Resume Match panel not on Candidate Workspace (requisition-scoped)", async ({
    page
  }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    await expect(page.getByText(/Suggested Matches/i)).toHaveCount(0);
    await expect(page.getByText(/Resume Matching/i)).toHaveCount(0);
  });

  test("11 — AI Review availability UI", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.mappedCandidateId, "pipeline");

    const expandAi = page.getByRole("button", { name: "Expand AI insights" });
    if (await expandAi.isVisible().catch(() => false)) {
      await expandAi.click();
    }
    await expect(page.getByText("AI Candidate Review").first()).toBeVisible();

    const disabledInfo = page.getByText(/AI Candidate Review is disabled/i);
    const mapWarning = page.getByText(/Map this candidate to a requisition/i);
    const generateBtn = page.getByRole("button", { name: "Generate AI Review" });

    await expect(
      disabledInfo.or(mapWarning).or(generateBtn)
    ).toBeVisible({ timeout: 60000 });
  });

  test("12 — unauthorized direct URL to foreign-owned pipeline candidate", async ({ page }) => {
    test.skip(!fixtures.foreignCandidateId, "No foreign-owned PIPELINE candidate in DB");

    await loginRecruiter(page);
    await page.goto("/candidates");
    await setWorkspaceView(page, "pipeline");
    await page.goto(`/candidates/${fixtures.foreignCandidateId}`);

    await expect(page.getByText("Unable to load candidate")).toBeVisible({
      timeout: 90000
    });
    await expect(
      page.getByText(
        /not authorized to (view|access) this candidate|Enterprise Access Denied|status code 403/i
      )
    ).toBeVisible();
  });

  test("13 — refresh and deep-link retain workspace", async ({ page }) => {
    await loginRecruiter(page);
    await openCandidate(page, fixtures.authorizedCandidateId);

    const url = page.url();
    await page.reload();
    await expect(page).toHaveURL(url);
    await expect(page.getByText("Candidate Workspace").first()).toBeVisible();

    await page.goto("/recruiter");
    await page.goto(`/candidates/${fixtures.authorizedCandidateId}`);
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
  });

  test("14 — empty education state when applicable", async ({ page }) => {
    test.skip(
      !fixtures.emptyEducationCandidateId,
      "No candidate with zero education rows found in probe set"
    );

    await loginRecruiter(page);
    await openCandidate(page, fixtures.emptyEducationCandidateId);

    await page.getByRole("tab", { name: "Education" }).click();
    await expect(page.getByText("No education records").first()).toBeVisible();
  });
});

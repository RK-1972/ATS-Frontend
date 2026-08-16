import { test, expect } from "@playwright/test";
import fs from "fs";

import {
  CANDIDATE_EMAIL,
  CANDIDATE_NAME,
  DEPARTMENT,
  DESIGNATION_TITLE,
  BUDGET_JUSTIFICATION,
  GRADE_CODE,
  MARKER,
  OFFER_CTC,
  POSITION_TITLE,
  RESUME_PATH,
  demoPassword,
  futureInterviewDate,
  futureInterviewTime,
  manifest,
  offerApproverCredentials,
  userEmail
} from "./helpers/demo-config.mjs";
import { captureFailure } from "./helpers/failure.mjs";
import {
  holdAfterAction,
  holdAfterLogin,
  holdApprovalAfter,
  holdApprovalBefore,
  holdBeforeAction,
  holdCompletedForm,
  holdDocumentPreview,
  holdDropdownOpen,
  holdDropdownSelected,
  holdOpeningDropdownSelected,
  holdMajorScreen,
  holdOpeningBeforeFirstAction,
  holdPageTransition,
  holdTalentManagementReady,
  loginWithOpeningPresentation,
  isRecordingPacingEnabled,
  waitForOwnershipMapButtonReady
} from "./helpers/demo-recording-pacing.mjs";
import {
  approveBudgetInWorkforceWorkspace,
  approveInMyApprovals,
  confirmDialog,
  loginAs,
  logout
} from "./helpers/session.mjs";

const OFFER_DOCUMENT_TYPE = "Offer";

async function openMyApprovals(page) {
  await page.goto("/my-approvals", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "My Approvals" })).toBeVisible({
    timeout: 120000
  });
}

function offerApprovalRow(page, ctx) {
  let row = page
    .locator(".MuiDataGrid-row")
    .filter({ hasText: OFFER_DOCUMENT_TYPE })
    .filter({ hasText: CANDIDATE_NAME });

  if (ctx.offerId) {
    row = row.filter({ hasText: ctx.offerId });
  }

  return row.first();
}

async function searchMyApprovals(page, term) {
  const search = page.getByPlaceholder(/search/i).first();
  if (await search.count()) {
    await search.fill(term);
  }
}

async function discoverOfferFromMyApprovals(page, ctx) {
  await searchMyApprovals(page, CANDIDATE_NAME);

  const row = offerApprovalRow(page, ctx);
  await expect(row).toBeVisible({ timeout: 90000 });

  const rowText = await row.innerText();
  const offerIdMatch = rowText.match(/OFF-[\d-]+/);
  if (offerIdMatch) {
    ctx.offerId = offerIdMatch[0];
  }

  expect(ctx.offerId).toBeTruthy();
  return ctx;
}

async function approveOfferRowInMyApprovals(page, ctx) {
  const row = offerApprovalRow(page, ctx);
  await expect(row).toBeVisible({ timeout: 90000 });
  await holdApprovalBefore(page);
  await row.getByRole("button", { name: "Approve" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Approve request/i)).toBeVisible();
  await holdBeforeAction(page);
  await dialog.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText(/Approved successfully/i)).toBeVisible({
    timeout: 90000
  });
  await holdApprovalAfter(page);
}

async function openAwaitingLettersPage(page) {
  await page.goto("/offers/awaiting-letters", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Awaiting Letters").first()).toBeVisible({
    timeout: 120000
  });
}

function scopedAwaitingLetterCard(page, ctx) {
  let card = page
    .locator(".MuiCard-root")
    .filter({ hasText: CANDIDATE_NAME })
    .filter({ has: page.getByRole("button", { name: "Open" }) });

  if (ctx.offerId) {
    card = card.filter({ hasText: ctx.offerId });
  }

  return card.first();
}

async function openAwaitingLetterOffer(page, ctx) {
  const card = scopedAwaitingLetterCard(page, ctx);
  await expect(card).toBeVisible({ timeout: 90000 });
  await card.getByRole("button", { name: "Open" }).click();

  const workspace = page.locator("main");
  await expect(workspace.getByRole("heading", { name: "Offer Summary" })).toBeVisible({
    timeout: 90000
  });
  await expect(workspace.getByText(CANDIDATE_NAME).first()).toBeVisible();

  if (ctx.offerId) {
    await expect(workspace.getByText(ctx.offerId).first()).toBeVisible();
  }

  await holdMajorScreen(page);
  return workspace;
}

async function generateOfferLetterFromWorkspace(page, ctx) {
  const workspace = page.locator("main");
  const generateButton = workspace.getByRole("button", { name: "Generate Offer Letter" });

  await expect(generateButton).toBeEnabled({ timeout: 90000 });

  const generateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/documents/generate") &&
      response.request().method() === "POST",
    { timeout: 180000 }
  );

  await holdBeforeAction(page);
  await generateButton.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Generate Offer Letter?")).toBeVisible();
  await holdBeforeAction(page);
  await dialog.getByRole("button", { name: "Generate Offer Letter" }).click();

  await expect(page.getByText("Generating offer letter...")).toBeVisible({
    timeout: 30000
  });
  await expect(page.getByText("Generating offer letter...")).toBeHidden({
    timeout: 180000
  });

  const generateResponse = await generateResponsePromise;
  expect(generateResponse.status()).toBe(201);
  const generateBody = await generateResponse.json();
  expect(generateBody.success).toBe(true);
  expect(generateBody.message || generateBody.data?.responseMessage || "").toMatch(
    /Offer letter generated successfully/i
  );

  await expect(page).toHaveURL(/\/offers\/generated-letters/, { timeout: 60000 });
  await expect(page.locator("main")).toContainText(/Letter Generated/i);
  await holdAfterAction(page);
}

async function verifyGeneratedOfferLetterPdf(page, ctx) {
  const generatedCard = scopedAwaitingLetterCard(page, ctx);
  await expect(generatedCard).toBeVisible({ timeout: 90000 });
  await expect(generatedCard).toContainText(/Letter Generated/i);

  await generatedCard.getByRole("button", { name: "Open" }).click();

  const workspace = page.locator("main");
  const previewButton = workspace.getByRole("button", { name: "Preview" });
  const downloadButton = workspace.getByRole("button", { name: "Download" });
  await expect(previewButton).toBeEnabled({ timeout: 90000 });
  await expect(downloadButton).toBeEnabled({ timeout: 90000 });
  await holdMajorScreen(page);

  const escapedOfferId = ctx.offerId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pdfUrlPattern = new RegExp(`/api/v1/offer-letters/${escapedOfferId}/pdf`);

  let method = "Preview";
  let status;
  let contentType;
  let size;
  let filename;

  const popupPromise = page.context().waitForEvent("page");
  await previewButton.click();

  const popup = await popupPromise;
  await popup.waitForURL(pdfUrlPattern, { timeout: 120000 });
  await popup
    .waitForLoadState("networkidle", { timeout: 120000 })
    .catch(() => popup.waitForLoadState("load", { timeout: 120000 }));

  const pdfMeta = await popup.evaluate(async () => {
    const response = await fetch(window.location.href);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    return {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      size: bytes.byteLength,
      magic: String.fromCharCode(bytes[0] || 0, bytes[1] || 0, bytes[2] || 0, bytes[3] || 0)
    };
  });

  status = pdfMeta.status;
  contentType = pdfMeta.contentType;
  size = pdfMeta.size;
  filename = `Offer_Letter_${ctx.offerId}.pdf`;
  method = "Preview";

  expect(pdfMeta.magic).toBe("%PDF");
  expect(popup.url()).toMatch(pdfUrlPattern);
  await holdDocumentPreview(popup);

  expect(status).toBe(200);
  expect(contentType).toContain("application/pdf");
  expect(size).toBeGreaterThan(1000);

  await popup.close();

  return {
    method,
    status,
    contentType,
    size,
    filename
  };
}

async function runOfferLetterGenerationStep(page, ctx, { skipLogin = false } = {}) {
  expect(ctx.offerId).toBeTruthy();

  if (!skipLogin) {
    await loginAs(page, userEmail("recruiter"), demoPassword());
    await holdAfterLogin(page);
    await openAwaitingLettersPage(page);
  }

  await openAwaitingLetterOffer(page, ctx);
  await generateOfferLetterFromWorkspace(page, ctx);
  return verifyGeneratedOfferLetterPdf(page, ctx);
}

/**
 * OPTALYNX DEMO_E2E — single coherent UI journey (Phase 3A dry run).
 * Uses real authentication, workflows, and browser interactions only.
 */
test.describe.configure({ mode: "serial" });

test("DEMO_E2E complete recruiting journey", async ({ page }, testInfo) => {
  test.setTimeout(process.env.PW_DEMO_VIDEO === "on" ? 1200000 : 900000);

  if (!fs.existsSync(RESUME_PATH)) {
    throw new Error(`Demo resume missing at ${RESUME_PATH}`);
  }

  const password = demoPassword();
  const ctx = {
    budgetRequestCode: null,
    budgetRequestId: null,
    positionId: null,
    requisitionCode: null,
    candidateId: null,
    candidateCode: null,
    mapId: null,
    scheduleId: null,
    offerId: null
  };

  const runStep = async (stepNo, stepName, fn) => {
    try {
      await test.step(`${String(stepNo).padStart(2, "0")} — ${stepName}`, fn);
    } catch (error) {
      await captureFailure(page, testInfo, stepNo, stepName, {
        message: error.message,
        stack: error.stack
      });
    }
  };

  // Dev-only: preload Offer routes before Step 17. Skipped during video recording so the
  // visible opening is Step 01 requestor login with presentation pacing (not a fast warmup).
  if (!isRecordingPacingEnabled()) {
    await loginAs(page, userEmail("recruiter"), password);
    await page.goto("/offers/raise", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("combobox", { name: "Candidate" })).toBeVisible({
      timeout: 60000
    });
    await logout(page);
  }

  await runStep(1, "Budget Request", async () => {
    await loginWithOpeningPresentation(page, userEmail("requestor"), password, {
      workspaceCard: "Requisitions / Request Workspace"
    });

    await page.goto("/workforce-planning/requests");
    await expect(page.getByRole("button", { name: "New request" })).toBeVisible();
    await holdOpeningBeforeFirstAction(page);

    await page.getByRole("button", { name: "New request" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("New budget request")).toBeVisible();
    await holdMajorScreen(page);

    await dialog.getByLabel("Department").click();
    await holdDropdownOpen(page);
    await page.getByRole("option", { name: DEPARTMENT }).click();
    await holdOpeningDropdownSelected(page);

    await dialog.getByLabel(/Position title/i).click();
    await dialog.getByLabel(/Position title/i).fill("Senior Test");
    await holdDropdownOpen(page);
    await page.getByRole("option", { name: DESIGNATION_TITLE }).click();
    await holdOpeningDropdownSelected(page);

    await dialog.getByLabel(/^Grade/i).click();
    await holdDropdownOpen(page);
    await page.getByRole("option", { name: new RegExp(GRADE_CODE) }).first().click();
    await holdOpeningDropdownSelected(page);

    await dialog.getByLabel(/Headcount/i).fill("1");
    await dialog.getByLabel(/Proposed budget/i).fill(
      String(manifest.scenario.proposedBudgetInr)
    );
    await dialog.getByLabel(/Business justification/i).fill(BUDGET_JUSTIFICATION);
    await holdCompletedForm(page);

    await holdBeforeAction(page);
    await dialog.getByRole("button", { name: "Save Draft" }).click();
    const codeEl = dialog.getByText(/BR-\d{4}-\d+/i).first();
    await expect(codeEl).toBeVisible({ timeout: 60000 });
    const budgetCodeMatch = (await codeEl.innerText()).match(/BR-\d{4}-\d+/i);
    ctx.budgetRequestCode = budgetCodeMatch?.[0] || null;
    expect(ctx.budgetRequestCode).toBeTruthy();

    await holdBeforeAction(page);
    await dialog.getByRole("button", { name: "Submit" }).click();
    await confirmDialog(page, "Submit");

    await expect(dialog).toBeHidden({ timeout: 60000 });

    const budgetCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: ctx.budgetRequestCode })
      .first();
    await expect(budgetCard).toBeVisible({ timeout: 60000 });
    await expect(budgetCard.getByText(/Pending Level-1/i)).toBeVisible({
      timeout: 60000
    });
    await holdAfterAction(page);

    await budgetCard.click();
    await expect(page.getByText(BUDGET_JUSTIFICATION)).toBeVisible({ timeout: 30000 });
    await holdMajorScreen(page);
  });

  await runStep(2, "Budget Approval L1", async () => {
    await loginAs(page, userEmail("approverL1"), password, {
      workspaceCard: "My Approvals"
    });
    await holdAfterLogin(page);
    await holdApprovalBefore(page);
    await approveInMyApprovals(page, ctx.budgetRequestCode, "Budget").catch(async () => {
      await approveBudgetInWorkforceWorkspace(page, ctx.budgetRequestCode);
    });
    await holdApprovalAfter(page);
  });

  await runStep(3, "Budget Approval L2", async () => {
    await loginAs(page, userEmail("approverL2"), password, {
      workspaceCard: "My Approvals"
    });
    await holdAfterLogin(page);
    await holdApprovalBefore(page);
    await approveInMyApprovals(page, ctx.budgetRequestCode, "Budget").catch(async () => {
      await approveBudgetInWorkforceWorkspace(page, ctx.budgetRequestCode);
    });
    await holdApprovalAfter(page);
  });

  await runStep(4, "Approved Position", async () => {
    await loginAs(page, userEmail("requestor"), password, {
      workspaceCard: "Requisitions / Request Workspace"
    });
    await holdAfterLogin(page);

    await page.goto("/workforce-planning/catalogue");
    await expect(page.getByText(DESIGNATION_TITLE)).toBeVisible({ timeout: 90000 });

    const card = page.locator(".MuiCard-root").filter({ hasText: DESIGNATION_TITLE }).first();
    await expect(card).toBeVisible();
    await holdMajorScreen(page);
    await card.getByRole("button", { name: /Create requisition/i }).click();

    await page.waitForURL(/\/requisitions/, { timeout: 90000 });
    await expect(
      page.getByRole("heading", { name: "Talent Demand Request" })
    ).toBeVisible();
    await holdMajorScreen(page);
  });

  await runStep(5, "Requisition Creation", async () => {
    await expect(async () => {
      const optionCount = await page.locator('select[name="client_id"] option').count();
      expect(optionCount).toBeGreaterThan(1);
    }).toPass({ timeout: 90000 }).catch(() => {
      throw new Error(
        "Client dropdown never populated for demo requestor on /requisitions — " +
          "loadRequisitionManagementPage likely failed because GET /api/v1/recruitment/requisitions " +
          "requires REQUISITION_ASSIGNER while form client options load in the same Promise.all batch."
      );
    });

    const firstClientOption = page.locator('select[name="client_id"] option').nth(1);
    const clientValue = await firstClientOption.getAttribute("value");
    await page.locator('select[name="client_id"]').selectOption(clientValue);
    await page.getByPlaceholder("Primary Skill *").fill(manifest.scenario.primarySkill);
    await page.getByPlaceholder("Secondary Skill").fill(manifest.scenario.secondarySkill);
    await page.getByPlaceholder("Work Location *").fill(manifest.scenario.location);
    await page.locator('select[name="employment_type"]').selectOption(manifest.scenario.employmentType);
    await page.locator('select[name="priority_level"]').selectOption(manifest.scenario.priority);
    await page.locator('input[name="target_date"]').fill(futureInterviewDate(30));

    const routeSelect = page.getByLabel("Approval Route");
    await routeSelect.click();
    await holdDropdownOpen(page);
    await page
      .getByRole("option", { name: manifest.approvalRoutes[1].routeName })
      .click();
    await holdDropdownSelected(page);
    await holdCompletedForm(page);

    const submitDraftButton = page.getByRole("button", { name: "Submit Draft" });
    await holdBeforeAction(page);
    if (await submitDraftButton.count()) {
      await submitDraftButton.click();
    } else {
      await page.getByRole("button", { name: "Submit", exact: true }).click();
    }

    await expect(
      page.getByText(/Talent Demand Submitted Successfully/i)
    ).toBeVisible({ timeout: 90000 });

    const codeMatch = await page.locator("body").innerText();
    const found = codeMatch.match(/REQ-[A-Z0-9-]+/i);
    if (found) {
      ctx.requisitionCode = found[0];
    }
    expect(ctx.requisitionCode).toBeTruthy();
    await holdAfterAction(page);
  });

  await runStep(6, "Requisition Approval L1", async () => {
    await loginAs(page, userEmail("approverL1"), password, {
      workspaceCard: "My Approvals"
    });
    await holdAfterLogin(page);
    await holdApprovalBefore(page);
    await approveInMyApprovals(page, ctx.requisitionCode, "Requisition");
    await holdApprovalAfter(page);
  });

  await runStep(7, "Requisition Approval L2", async () => {
    await loginAs(page, userEmail("approverL2"), password, {
      workspaceCard: "My Approvals"
    });
    await holdAfterLogin(page);
    await holdApprovalBefore(page);
    await approveInMyApprovals(page, ctx.requisitionCode, "Requisition");
    await holdApprovalAfter(page);
  });

  await runStep(8, "Recruiter Assignment", async () => {
    await loginAs(page, userEmail("admin"), password);
    await holdAfterLogin(page);

    await page.goto("/requisitions/assign-recruiters");
    await expect(page.getByText(/Recruiter Assignment|Assign Recruiter/i).first()).toBeVisible();

    const search = page.getByPlaceholder(/Search Talent Demand Requests/i).first();
    if (await search.count()) {
      await search.fill(ctx.requisitionCode || MARKER);
    }

    const row = page.locator("tr").filter({ hasText: ctx.requisitionCode || MARKER }).first();
    await expect(row).toBeVisible({ timeout: 90000 });
    await row.getByText("Manage", { exact: true }).click();

    const demoRecruiterCode =
      manifest.users.accounts.find((account) => account.key === "recruiter")
        ?.employeeCode || "DEMO_E2E_REC";
    const recruiterSelect = page.locator("select").filter({
      has: page.locator(`option[value="${demoRecruiterCode}"]`)
    });
    await expect(recruiterSelect).toBeVisible({ timeout: 30000 });
    await recruiterSelect.selectOption(demoRecruiterCode);
    await holdCompletedForm(page);

    page.once("dialog", (dialog) => dialog.accept());
    await holdBeforeAction(page);
    await page.getByRole("button", { name: "Assign Recruiter", exact: true }).click();
    await expect(
      page.getByText(new RegExp(`✓.*${demoRecruiterCode}`))
    ).toBeVisible({ timeout: 30000 });
    await holdAfterAction(page);
  });

  await runStep(9, "Candidate Intake", async () => {
    await loginAs(page, userEmail("recruiter"), password, {
      workspaceCard: "Recruitment Workspace"
    });
    await holdAfterLogin(page);

    await page.goto("/candidate-intake");
    await expect(
      page.getByRole("heading", { name: "Enterprise Candidate Registration" })
    ).toBeVisible();
    await holdPageTransition(page);

    await page.getByLabel("Source").click();
    await holdDropdownOpen(page);
    await page.getByRole("option", { name: manifest.candidate.sourceHint }).click();
    await holdDropdownSelected(page);

    await page.locator('input[type="file"]').setInputFiles(RESUME_PATH);
    await holdCompletedForm(page);
    await holdBeforeAction(page);
    await page.getByRole("button", { name: "Create Intake" }).click();
    await expect(page.getByRole("button", { name: "Intake Created" })).toBeVisible({
      timeout: 60000
    });
    await holdAfterAction(page);
  });

  await runStep(10, "Candidate Parsing", async () => {
    await page.getByRole("button", { name: "Process Resume" }).click();
    await expect(page.getByRole("button", { name: "Parse Resume" })).toBeEnabled({
      timeout: 120000
    });

    await page.getByRole("button", { name: "Parse Resume" }).click();
    await expect(page.getByText(CANDIDATE_EMAIL)).toBeVisible({ timeout: 120000 });
    await expect(page.getByRole("button", { name: "Register Candidate" })).toBeVisible();
    await holdMajorScreen(page);
  });

  await runStep(11, "Candidate Registration", async () => {
    await holdBeforeAction(page);
    await page.getByRole("button", { name: "Register Candidate" }).click();
    await page.getByText("My Pipeline").click();
    await page.getByRole("dialog").getByRole("button", { name: "Register Candidate" }).click();

    await expect(page.getByText("Candidate Registered Successfully")).toBeVisible({
      timeout: 120000
    });

    const successText = await page.locator("body").innerText();
    const codeMatch = successText.match(/CAND-[A-Z0-9-]+/i);
    if (codeMatch) {
      ctx.candidateCode = codeMatch[0];
    }

    await holdAfterAction(page);
    await page.getByRole("button", { name: "Done" }).click();
  });

  await runStep(12, "Candidate Verification", async () => {
    await page.goto("/candidates");
    await page.getByRole("button", { name: "My Pipeline" }).click();
    await expect(page.getByRole("button", { name: "My Pipeline" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(CANDIDATE_NAME)).toBeVisible({ timeout: 90000 });
    await expect(page.getByText(CANDIDATE_EMAIL)).toBeVisible();
    if (!isRecordingPacingEnabled()) {
      await holdMajorScreen(page);
    }
  });

  await runStep(13, "Candidate Mapping", async () => {
    expect(ctx.requisitionCode).toBeTruthy();

    const onCandidateDetailUrl = /\/candidates\/\d+/.test(page.url());
    let alreadyOnIntendedCandidate = false;

    if (onCandidateDetailUrl) {
      alreadyOnIntendedCandidate = await page
        .locator("main")
        .getByText(CANDIDATE_NAME)
        .first()
        .isVisible()
        .catch(() => false);
    }

    if (!alreadyOnIntendedCandidate) {
      await page.getByRole("link", { name: CANDIDATE_NAME }).click().catch(async () => {
        await page.getByText(CANDIDATE_NAME).first().click();
      });

      await page.waitForURL(/\/candidates\/\d+/, { timeout: 90000 });
    }

    ctx.candidateId = page.url().match(/\/candidates\/(\d+)/)?.[1] || null;

    const mapButton = await waitForOwnershipMapButtonReady(page);

    if (isRecordingPacingEnabled()) {
      await holdTalentManagementReady(page);
    }

    await mapButton.click();

    const assignDialog = page
      .getByRole("dialog")
      .filter({ has: page.getByRole("heading", { name: "Assign Candidate to Requisition" }) });
    await expect(assignDialog).toBeVisible();

    await assignDialog.getByPlaceholder("Search requisition...").fill(ctx.requisitionCode);

    const reqRow = assignDialog.getByRole("button").filter({ hasText: ctx.requisitionCode }).first();
    await expect(reqRow).toBeVisible({ timeout: 45000 });
    await reqRow.click();
    await expect(reqRow.getByRole("radio")).toBeChecked();

    await holdBeforeAction(page);
    await assignDialog.getByRole("button", { name: "Assign Candidate", exact: true }).click();

    const confirmDialog = page
      .getByRole("dialog")
      .filter({ has: page.getByRole("button", { name: "Confirm Candidate Assignment" }) });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText(ctx.requisitionCode)).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Confirm Candidate Assignment" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 30000 });
    await expect(page.getByText("Assigned").first()).toBeVisible({ timeout: 90000 });
    await expect(
      page.getByText("Requisition", { exact: true }).locator("..").getByText(ctx.requisitionCode)
    ).toBeVisible({ timeout: 90000 });
    await expect(page.getByRole("button", { name: "Release Candidate" })).toBeVisible({
      timeout: 30000
    });
    await holdAfterAction(page);
  });

  await runStep(14, "Interview Scheduling", async () => {
    expect(ctx.requisitionCode).toBeTruthy();

    await page.goto("/interview-schedule", { waitUntil: "networkidle" });

    const newInterviewSection = page
      .getByRole("heading", { name: "New Interview" })
      .locator("xpath=ancestor::*[.//*[@aria-labelledby='round-label']][1]");

    await expect(newInterviewSection).toBeVisible();

    await newInterviewSection.getByRole("combobox", { name: "Requisition" }).click();
    await holdDropdownOpen(page);
    await page.getByRole("option").filter({ hasText: ctx.requisitionCode }).click();
    await holdDropdownSelected(page);

    await newInterviewSection.getByRole("combobox", { name: "Candidate" }).click();
    await holdDropdownOpen(page);
    await page.getByRole("option").filter({ hasText: CANDIDATE_NAME }).click();
    await holdDropdownSelected(page);

    await newInterviewSection.getByRole("combobox", { name: "Round" }).click();
    await holdDropdownOpen(page);
    await page.getByRole("option", { name: manifest.interview.rounds[0].roundType }).click();
    await holdDropdownSelected(page);

    await newInterviewSection.getByLabel("Interview Date").fill(futureInterviewDate());
    await newInterviewSection.getByLabel("Interview Time").fill(futureInterviewTime());

    await newInterviewSection.getByRole("combobox", { name: "Interviewer" }).click();
    await holdDropdownOpen(page);
    await page.getByRole("option", { name: /\[DEMO_E2E\] Interviewer|DEMO_E2E_INT/i }).click();
    await holdDropdownSelected(page);
    await holdCompletedForm(page);

    const scheduleDialog = page.waitForEvent("dialog");
    await holdBeforeAction(page);
    await page.getByRole("button", { name: "Schedule Interview" }).click();
    const dialog = await scheduleDialog;
    expect(dialog.message()).toMatch(/Interview Scheduled Successfully/i);
    await dialog.accept();

    const scheduledInterviewsSection = page
      .getByRole("heading", { name: "Scheduled Interviews" })
      .locator('xpath=ancestor::*[.//*[@role="grid"]][1]');

    const scheduledRow = scheduledInterviewsSection
      .getByRole("row")
      .filter({ hasText: ctx.requisitionCode })
      .filter({ hasText: CANDIDATE_NAME })
      .filter({ hasText: manifest.interview.rounds[0].roundType })
      .first();

    await expect(scheduledRow).toBeVisible({ timeout: 90000 });
    await holdAfterAction(page);
  });

  await runStep(15, "Interview Progress Preview", async () => {
    await page.goto("/recruiter");
    const progressCell = page.locator('[data-field="interview_progress"], .MuiDataGrid-cell').filter({
      hasText: /L1|Interview/i
    }).first();

    if (await progressCell.count()) {
      await progressCell.hover();
      await expect(page.getByText(/Interview Progress|L1 Interview/i).first()).toBeVisible({
        timeout: 30000
      });
      await holdMajorScreen(page);
    }
  });

  await runStep(16, "Interview Feedback", async () => {
    await loginAs(page, userEmail("interviewer"), password, {
      workspaceCard: "Interview Workspace"
    });
    await holdAfterLogin(page);

    await page.goto("/interviewer");
    await expect(page.getByRole("heading", { name: "My Interview Schedule" })).toBeVisible();

    const interviewRow = page
      .getByRole("grid")
      .getByRole("row")
      .filter({ hasText: CANDIDATE_NAME })
      .filter({ hasText: manifest.interview.rounds[0].roundType })
      .first();

    await expect(interviewRow).toBeVisible({ timeout: 90000 });
    await expect(page.getByText("No interviews assigned")).not.toBeVisible();
    await interviewRow.getByRole("button", { name: "Submit" }).click();

    await page.waitForURL(/\/feedback\//, { timeout: 90000 });
    ctx.scheduleId = page.url().match(/\/feedback\/(\d+)/)?.[1] || null;

    await expect(page.getByText(CANDIDATE_NAME)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(manifest.interview.rounds[0].roundType)).toBeVisible();
    await holdMajorScreen(page);

    await page.locator("select").nth(0).selectOption({ label: "Technical" });
    await page.locator("select").nth(1).selectOption({ label: "Good" });
    await page.getByPlaceholder("Skill").fill(manifest.scenario.primarySkill);
    await page
      .getByPlaceholder("Skill")
      .locator("xpath=following-sibling::div[1]")
      .locator("span")
      .nth(3)
      .click();
    await page.locator("select").filter({ hasText: "Select Final Outcome" }).selectOption({
      label: manifest.interview.outcome
    });
    await holdCompletedForm(page);

    await Promise.all([
      page.waitForEvent("dialog").then(async (dialog) => {
        expect(dialog.message()).toMatch(/Are you sure you want to submit this interview feedback/i);
        await dialog.accept();
      }),
      (async () => {
        await holdBeforeAction(page);
        await page.getByRole("button", { name: "Submit Feedback" }).click();
      })()
    ]);

    const successDialog = await page.waitForEvent("dialog");
    expect(successDialog.message()).toMatch(/Feedback Submitted Successfully/i);
    await successDialog.accept();

    await page.waitForURL(/\/interviewer/, { timeout: 90000 });
    await expect(
      page
        .getByRole("grid")
        .getByRole("row")
        .filter({ hasText: CANDIDATE_NAME })
        .getByRole("button", { name: "Submitted" })
    ).toBeVisible({ timeout: 90000 });
    await holdAfterAction(page);
  });

  await runStep(17, "Offer Creation", async () => {
    expect(ctx.requisitionCode).toBeTruthy();

    await loginAs(page, userEmail("recruiter"), password);
    await holdAfterLogin(page);
    await page.goto("/offers/raise", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/offers\/raise/, { timeout: 90000 });

    const candidateField = page.getByRole("combobox", { name: "Candidate" });
    await expect(page.getByText("Loading candidates…")).toBeHidden({
      timeout: 120000
    });
    await expect(candidateField).toBeVisible({ timeout: 120000 });
    await candidateField.click();
    await candidateField.fill(CANDIDATE_NAME);
    await holdDropdownOpen(page);
    await page
      .getByRole("option")
      .filter({ hasText: CANDIDATE_NAME })
      .filter({ hasText: ctx.requisitionCode })
      .click();
    await holdDropdownSelected(page);

    await expect(page.getByRole("textbox", { name: "Requisition" })).toHaveValue(
      ctx.requisitionCode
    );
    await page.getByLabel("Annual CTC (INR)").fill(OFFER_CTC);
    await page.getByLabel("Expected Date of Joining").fill(futureInterviewDate(14));
    await holdCompletedForm(page);

    await holdBeforeAction(page);
    await page.getByRole("button", { name: "Submit for Approval" }).click();
    await confirmDialog(page, "Submit");

    await expect(page).toHaveURL(/\/offers\/pending-approvals/, { timeout: 120000 });
    await expect(page.getByText("Pending Offer Approvals").first()).toBeVisible({
      timeout: 90000
    });

    const offerCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: CANDIDATE_NAME })
      .filter({ hasText: ctx.requisitionCode })
      .first();

    await expect(offerCard).toBeVisible({ timeout: 90000 });
    await expect(offerCard).toContainText("Pending Approval");
    await expect(offerCard).toContainText("₹18.00 L");
    await holdMajorScreen(page);

    const offerCardText = await offerCard.innerText();
    const offerIdMatch = offerCardText.match(/OFF-\d+/);
    if (offerIdMatch) {
      ctx.offerId = offerIdMatch[0];
    }
    expect(ctx.offerId).toBeTruthy();
    await holdAfterAction(page);
  });

  await runStep(18, "Offer Approval L1", async () => {
    const creds = offerApproverCredentials(1);
    if (!creds.password) {
      throw new Error(
        "Missing E2E demo password — set E2E_DEMO_PASSWORD or use manifest default."
      );
    }

    await loginAs(page, creds.email, creds.password);
    await holdAfterLogin(page);
    await openMyApprovals(page);
    await discoverOfferFromMyApprovals(page, ctx);

    const l1Row = offerApprovalRow(page, ctx);
    await expect(l1Row).toContainText(/Approval Step 1/i);
    await expect(l1Row).toContainText(/Pending/i);
    await holdApprovalBefore(page);

    await approveOfferRowInMyApprovals(page, ctx);

    await openMyApprovals(page);
    await searchMyApprovals(page, ctx.offerId);
    await expect(offerApprovalRow(page, ctx)).toHaveCount(0, { timeout: 90000 });

    if (!isRecordingPacingEnabled()) {
      const l2Creds = offerApproverCredentials(2);
      if (!l2Creds.password) {
        throw new Error(
          "Missing E2E demo password — set E2E_DEMO_PASSWORD or use manifest default."
        );
      }

      await loginAs(page, l2Creds.email, l2Creds.password);
      await holdAfterLogin(page);
      await openMyApprovals(page);
      await searchMyApprovals(page, CANDIDATE_NAME);

      const l2PendingRow = offerApprovalRow(page, ctx);
      await expect(l2PendingRow).toBeVisible({ timeout: 90000 });
      await expect(l2PendingRow).toContainText(/Approval Step 2/i);
      await expect(l2PendingRow).toContainText(/Pending/i);
      await holdMajorScreen(page);
    }
  });

  await runStep(19, "Offer Approval L2", async () => {
    const creds = offerApproverCredentials(2);
    if (!creds.password) {
      throw new Error(
        "Missing E2E demo password — set E2E_DEMO_PASSWORD or use manifest default."
      );
    }

    if (isRecordingPacingEnabled()) {
      await loginAs(page, creds.email, creds.password);
      await holdAfterLogin(page);
      await openMyApprovals(page);
      await searchMyApprovals(page, CANDIDATE_NAME);

      const pendingRow = offerApprovalRow(page, ctx);
      await expect(pendingRow).toBeVisible({ timeout: 90000 });
      await expect(pendingRow).toContainText(/Approval Step 2/i);
      await expect(pendingRow).toContainText(/Pending/i);
      await holdApprovalBefore(page);

      await approveOfferRowInMyApprovals(page, ctx);

      await openMyApprovals(page);
      await searchMyApprovals(page, ctx.offerId);
      await expect(offerApprovalRow(page, ctx)).toHaveCount(0, { timeout: 90000 });
      await holdAfterAction(page);
      return;
    }

    const storedUser = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    });

    const alreadyAuthenticatedAsL2 = storedUser?.email_id === creds.email;

    if (!alreadyAuthenticatedAsL2) {
      await loginAs(page, creds.email, creds.password);
      await holdAfterLogin(page);
    }

    await openMyApprovals(page);
    await searchMyApprovals(page, CANDIDATE_NAME);

    const pendingRow = offerApprovalRow(page, ctx);
    await expect(pendingRow).toBeVisible({ timeout: 90000 });
    await expect(pendingRow).toContainText(/Approval Step 2/i);
    await holdApprovalBefore(page);

    await approveOfferRowInMyApprovals(page, ctx);

    await openMyApprovals(page);
    await searchMyApprovals(page, ctx.offerId);
    await expect(offerApprovalRow(page, ctx)).toHaveCount(0, { timeout: 90000 });
    await holdAfterAction(page);
  });

  await runStep(20, "Offer Letter PDF", async () => {
    expect(ctx.offerId).toBeTruthy();
    const pdfEvidence = await runOfferLetterGenerationStep(page, ctx);
    test.info().annotations.push({
      type: "offer-letter-pdf",
      description: JSON.stringify(pdfEvidence)
    });
  });

  test.info().attachments.push({
    name: "demo-run-context",
    contentType: "application/json",
    body: Buffer.from(JSON.stringify(ctx, null, 2), "utf8")
  });
});

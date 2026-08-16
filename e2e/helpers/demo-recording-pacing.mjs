/**
 * Executive presentation pacing for management demo recordings only.
 * Active when PW_DEMO_VIDEO=on — no effect on normal E2E runs.
 */

const PACING_MS = {
  afterLogin: 4500,
  pageTransition: 4500,
  majorScreen: 8500,
  completedForm: 8000,
  beforeAction: 2500,
  afterAction: 7000,
  approvalBefore: 6000,
  approvalAfter: 7000,
  dropdownOpen: 2500,
  dropdownSelected: 3000,
  openingDropdownSelected: 3500,
  talentManagementReady: 6000,
  document: 13500,
  openingLoginScreen: 5500,
  openingBeforeLoginClick: 3500,
  openingAfterWorkspace: 7500,
  openingBeforeFirstAction: 4500
};

export function isRecordingPacingEnabled() {
  return process.env.PW_DEMO_VIDEO === "on";
}

export async function holdForViewer(page, ms) {
  if (!isRecordingPacingEnabled() || !ms) {
    return;
  }
  await page.waitForTimeout(ms);
}

/** After login lands on an important workspace. */
export async function holdAfterLogin(page) {
  await holdForViewer(page, PACING_MS.afterLogin);
}

/** After major page navigation completes. */
export async function holdPageTransition(page) {
  await holdForViewer(page, PACING_MS.pageTransition);
}

/** Important completed business screen (7–10 seconds). */
export async function holdMajorScreen(page) {
  await holdForViewer(page, PACING_MS.majorScreen);
}

/** Completed form with populated fields (6–10 seconds). */
export async function holdCompletedForm(page) {
  await holdForViewer(page, PACING_MS.completedForm);
}

/** Before clicking a major business action button (2–3 seconds). */
export async function holdBeforeAction(page) {
  await holdForViewer(page, PACING_MS.beforeAction);
}

/** After a workflow action succeeds (6–8 seconds). */
export async function holdAfterAction(page) {
  await holdForViewer(page, PACING_MS.afterAction);
}

/** Before an approval action (5–7 seconds). */
export async function holdApprovalBefore(page) {
  await holdForViewer(page, PACING_MS.approvalBefore);
}

/** After an approval outcome is visible (6–8 seconds). */
export async function holdApprovalAfter(page) {
  await holdForViewer(page, PACING_MS.approvalAfter);
}

/** Dropdown list is open — viewer sees choices (2–3 seconds). */
export async function holdDropdownOpen(page) {
  await holdForViewer(page, PACING_MS.dropdownOpen);
}

/** Dropdown value selected — viewer sees selection (3 seconds). */
export async function holdDropdownSelected(page) {
  await holdForViewer(page, PACING_MS.dropdownSelected);
}

/** Dropdown value selected during opening sequence (3–4 seconds). */
export async function holdOpeningDropdownSelected(page) {
  await holdForViewer(page, PACING_MS.openingDropdownSelected);
}

/** Talent Management / candidate workspace ready after real processing (5–7 seconds). */
export async function holdTalentManagementReady(page) {
  await holdForViewer(page, PACING_MS.talentManagementReady);
}

/** Final branded PDF preview (12–15 seconds). */
export async function holdDocumentPreview(page) {
  await holdForViewer(page, PACING_MS.document);
}

/** Opening presentation — login screen visible before credentials. */
export async function holdOpeningLoginScreen(page) {
  await holdForViewer(page, PACING_MS.openingLoginScreen);
}

/** Opening presentation — populated credentials before Login click. */
export async function holdOpeningBeforeLoginClick(page) {
  await holdForViewer(page, PACING_MS.openingBeforeLoginClick);
}

/** Opening presentation — workspace loaded after successful login. */
export async function holdOpeningAfterWorkspace(page) {
  await holdForViewer(page, PACING_MS.openingAfterWorkspace);
}

/** Opening presentation — before the first Step 01 business action. */
export async function holdOpeningBeforeFirstAction(page) {
  await holdForViewer(page, PACING_MS.openingBeforeFirstAction);
}

/** Ownership card — scoped Map to Requisition control (avoids ambiguous .first()). */
export function ownershipMapToRequisitionButton(page) {
  return page
    .locator(".MuiCard-root")
    .filter({ has: page.getByText("Ownership", { exact: true }) })
    .getByRole("button", { name: "Map to Requisition" });
}

async function isFreshBrowserSession(page) {
  return page.evaluate(() => {
    const href = window.location.href;
    const isBlank = href === "about:blank" || href === "";
    let hasSession = false;

    try {
      hasSession = Boolean(localStorage.getItem("token") || localStorage.getItem("user"));
    } catch {
      hasSession = false;
    }

    return isBlank || !hasSession;
  });
}

/**
 * Real readiness wait — profile loaded and Ownership Map button actionable.
 * Used before the recording-only workspace hold in Step 13.
 */
export async function waitForOwnershipMapButtonReady(page) {
  const { expect } = await import("@playwright/test");
  const mapButton = ownershipMapToRequisitionButton(page);

  await expect(page.getByText("Loading candidate workspace...")).toBeHidden({
    timeout: 90000
  });
  await expect(mapButton).toBeVisible({ timeout: 90000 });
  await expect(mapButton).toBeEnabled({ timeout: 90000 });

  return mapButton;
}

/**
 * Step 01 opening login only — management presentation pacing on the login flow.
 * Recording-only; used once at the start of the demo journey.
 */
export async function loginWithOpeningPresentation(page, email, password, options = {}) {
  const { logout } = await import("./session.mjs");
  const { expect } = await import("@playwright/test");
  const { workspaceCard } = options;

  const freshPage = await isFreshBrowserSession(page);

  if (isRecordingPacingEnabled() && freshPage) {
    await page.goto("/login");
    await expect(page.locator('input[name="email_id"]')).toBeVisible();
  } else {
    await logout(page);
  }

  await holdOpeningLoginScreen(page);

  await page.fill('input[name="email_id"]', email);
  await page.fill('input[name="password"]', password);
  await holdOpeningBeforeLoginClick(page);

  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL(
    /\/(workspace|recruiter|interviewer|my-approvals|workforce-planning|offers|\/?$)/,
    { timeout: 90000 }
  );

  if (page.url().includes("/workspace")) {
    if (workspaceCard) {
      await page.getByText(workspaceCard, { exact: false }).click();
      await page.waitForLoadState("networkidle");
    }
  }

  const storedUser = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  expect(storedUser?.email_id).toBe(email);
  await holdOpeningAfterWorkspace(page);
}

/** @deprecated use holdMajorScreen */
export async function holdBusinessScreen(page) {
  await holdMajorScreen(page);
}

/** @deprecated use holdAfterAction */
export async function holdAfterOutcome(page) {
  await holdAfterAction(page);
}

/** @deprecated use holdPageTransition */
export async function holdTransition(page) {
  await holdPageTransition(page);
}

import { test, expect } from "@playwright/test";

import { CANDIDATE_NAME, offerApproverCredentials } from "./helpers/demo-config.mjs";
import { loginAs } from "./helpers/session.mjs";

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
  await row.getByRole("button", { name: "Approve" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Approve request/i)).toBeVisible();
  await dialog.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText(/Approved successfully/i)).toBeVisible({
    timeout: 90000
  });
}

/**
 * Isolated Steps 18–19 against the pending demo offer from a prior Step 17 run.
 * Uses the real My Approvals workflow (not Offer Workspace).
 */
test.describe.configure({ mode: "serial" });

test("DEMO_E2E offer approval L1 and L2 (Steps 18–19 only)", async ({ page }) => {
  test.setTimeout(600000);

  const ctx = { offerId: null };

  await test.step("18 — Offer Approval L1", async () => {
    const creds = offerApproverCredentials(1);
    if (!creds.password) {
      throw new Error(
        "Missing E2E demo password — set E2E_DEMO_PASSWORD or use manifest default."
      );
    }

    await loginAs(page, creds.email, creds.password);
    await openMyApprovals(page);
    await discoverOfferFromMyApprovals(page, ctx);

    const l1Row = offerApprovalRow(page, ctx);
    await expect(l1Row).toContainText(/Approval Step 1/i);
    await expect(l1Row).toContainText(/Pending/i);

    await approveOfferRowInMyApprovals(page, ctx);

    await openMyApprovals(page);
    await searchMyApprovals(page, ctx.offerId);
    await expect(offerApprovalRow(page, ctx)).toHaveCount(0, { timeout: 90000 });

    const l2Creds = offerApproverCredentials(2);
    if (!l2Creds.password) {
      throw new Error(
        "Missing E2E demo password — set E2E_DEMO_PASSWORD or use manifest default."
      );
    }

    await loginAs(page, l2Creds.email, l2Creds.password);
    await openMyApprovals(page);
    await searchMyApprovals(page, CANDIDATE_NAME);

    const l2PendingRow = offerApprovalRow(page, ctx);
    await expect(l2PendingRow).toBeVisible({ timeout: 90000 });
    await expect(l2PendingRow).toContainText(/Approval Step 2/i);
    await expect(l2PendingRow).toContainText(/Pending/i);
  });

  await test.step("19 — Offer Approval L2", async () => {
    const creds = offerApproverCredentials(2);
    if (!creds.password) {
      throw new Error(
        "Missing E2E demo password — set E2E_DEMO_PASSWORD or use manifest default."
      );
    }

    await loginAs(page, creds.email, creds.password);
    await openMyApprovals(page);
    await searchMyApprovals(page, CANDIDATE_NAME);

    const pendingRow = offerApprovalRow(page, ctx);
    await expect(pendingRow).toBeVisible({ timeout: 90000 });
    await expect(pendingRow).toContainText(/Approval Step 2/i);

    await approveOfferRowInMyApprovals(page, ctx);

    await openMyApprovals(page);
    await searchMyApprovals(page, ctx.offerId);
    await expect(offerApprovalRow(page, ctx)).toHaveCount(0, { timeout: 90000 });
  });
});

import { expect } from "@playwright/test";

export async function logout(page) {
  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto("/login");
  await expect(page.locator('input[name="email_id"]')).toBeVisible();
}

export async function loginAs(page, email, password, options = {}) {
  const { workspaceCard } = options;

  await logout(page);
  await page.fill('input[name="email_id"]', email);
  await page.fill('input[name="password"]', password);
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
}

export async function approveInMyApprovals(page, searchTerm, documentTypeLabel) {
  await page.goto("/my-approvals");
  await expect(page.getByRole("heading", { name: "My Approvals" })).toBeVisible();

  const search = page.getByPlaceholder(/search/i).first();
  if (await search.count()) {
    await search.fill(searchTerm);
  }

  const gridRow = page
    .locator(".MuiDataGrid-row")
    .filter({ hasText: searchTerm })
    .filter({ hasText: documentTypeLabel })
    .first();

  await expect(gridRow).toBeVisible({ timeout: 90000 });
  await gridRow.getByRole("button", { name: "Approve" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Approve request/i)).toBeVisible();
  await dialog.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText(/Approved successfully/i)).toBeVisible({
    timeout: 90000
  });
}

export async function approveBudgetInWorkforceWorkspace(page, budgetCode) {
  await page.goto("/workforce-planning/approvals");
  await expect(page.getByText(/Approval Workspace|Budget Management/i).first()).toBeVisible({
    timeout: 90000
  });

  const card = page.locator(".MuiCard-root").filter({ hasText: budgetCode }).first();
  await expect(card).toBeVisible({ timeout: 90000 });
  await card.click();

  await page.getByRole("button", { name: "Approve" }).click();
  await confirmDialog(page, "Approve");

  await expect(page.getByText(/Approved|Level-1 Approved|Pending Level-2/i).first()).toBeVisible({
    timeout: 90000
  });
}

export async function confirmDialog(page, confirmLabel) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: confirmLabel }).click();
}

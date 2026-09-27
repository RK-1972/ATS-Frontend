import { test, expect } from "@playwright/test";

import { loginAs } from "./helpers/session.mjs";
import { demoPassword, userEmail } from "./helpers/demo-config.mjs";

const recruiterEmail = userEmail("recruiter");
const password = demoPassword();

test.describe("Wave 2 — requisition & workforce (browser smoke)", () => {
  test("recruiter reaches approved requisitions queue", async ({ page }) => {
    await loginAs(page, recruiterEmail, password);
    await page.goto("/workforce-planning/requisitions/approved");

    await expect(page.getByText("Approved Requisitions").first()).toBeVisible({
      timeout: 90000
    });
  });

  test("workforce planning workspace entry", async ({ page }) => {
    await loginAs(page, recruiterEmail, password);
    await page.goto("/workforce-planning");
    await expect(page.getByText(/Workforce Planning|Budget Management/i).first()).toBeVisible({
      timeout: 90000
    });
  });
});

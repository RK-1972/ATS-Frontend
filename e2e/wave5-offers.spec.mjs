import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CANDIDATE_NAME,
  demoPassword,
  offerApproverCredentials,
  userEmail
} from "./helpers/demo-config.mjs";
import { provisionDemoOfferApproval } from "./helpers/provision-demo-offer.mjs";
import { loginAs } from "./helpers/session.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../../ats-backend");

function provisionDemoDraftOffer() {
  const output = execSync("node scripts/provisionDemoOfferDraftE2e.js", {
    cwd: backendRoot,
    encoding: "utf8",
    env: process.env
  });
  const jsonLine = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{"))
    .pop();
  return JSON.parse(jsonLine);
}

test.describe("Wave 5 — Offers", () => {
  test("withdraw offer from My Offer Requests", async ({ page }) => {
    test.setTimeout(300000);
    const draft = provisionDemoDraftOffer();
    const password = demoPassword();

    await loginAs(page, userEmail("recruiter"), password, {
      workspaceCard: "Offer Workspace"
    });

    await page.goto("/offers/my-requests", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("My Offer Requests").first()).toBeVisible({
      timeout: 120000
    });

    const offerCard = page.locator(".MuiCard-root").filter({ hasText: draft.offerId }).first();
    await expect(offerCard).toBeVisible({ timeout: 90000 });
    await offerCard.click();

    await page.getByRole("button", { name: "Withdraw Offer" }).click();
    await page.getByLabel("Reason for withdrawal").fill("Wave 5 E2E withdraw verification");
    await page.getByRole("button", { name: "Withdraw" }).click();

    await expect(page.getByText(/Offer withdrawn/i)).toBeVisible({ timeout: 60000 });
    await page.goto("/offers/withdrawn", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".MuiCard-root").filter({ hasText: draft.offerId })).toBeVisible({
      timeout: 90000
    });
  });

  test("offer approval bell notification for approver", async ({ page }) => {
    test.setTimeout(300000);
    provisionDemoOfferApproval();

    const creds = offerApproverCredentials(1);
    await loginAs(page, creds.email, creds.password);

    await page.getByRole("button", { name: /notifications/i }).click();
    await expect(page.getByText("Offer Approval Required").first()).toBeVisible({
      timeout: 90000
    });
    await expect(page.getByText(CANDIDATE_NAME).first()).toBeVisible();
  });
});

/**
 * Read-only readiness gate for req-create-basics help video recording.
 */
import { chromium } from "playwright";
import { loginAs } from "../e2e/helpers/session.mjs";
import { demoPassword, userEmail } from "../e2e/helpers/demo-config.mjs";

const BASE_URL = process.env.HELP_VIDEO_BASE_URL || "http://localhost:5173";
const USER_KEY = process.env.HELP_VIDEO_USER || "admin";

async function check(page, name, fn) {
  try {
    const detail = await fn();
    return { name, pass: true, detail };
  } catch (error) {
    return { name, pass: false, detail: error.message };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  await loginAs(page, userEmail(USER_KEY), demoPassword());

  const results = [];

  results.push(
    await check(page, "1. /requisitions loads", async () => {
      await page.goto("/requisitions", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const title = await page.getByText("Talent Demand Request").count();
      if (!title) throw new Error("Missing Talent Demand Request header");
      return "Talent Demand Request visible";
    })
  );

  results.push(
    await check(page, "2. Form sections visible", async () => {
      const sections = [
        "General Information",
        "Position Details",
        "Skills",
        "Hiring Information",
        "Approval"
      ];
      for (const label of sections) {
        if (!(await page.getByText(label).count())) {
          throw new Error(`Missing section: ${label}`);
        }
      }
      return sections.join(", ");
    })
  );

  results.push(
    await check(page, "3. Action buttons present (not clicked)", async () => {
      await page.getByText("Actions").first().scrollIntoViewIfNeeded();
      const save = await page.getByRole("button", { name: /Save Draft/i }).count();
      const submit = await page.getByRole("button", { name: /Submit Draft/i }).count();
      const create = await page.getByRole("button", { name: /Create Requisition/i }).count();
      if (!save) throw new Error("Save Draft not found");
      if (!submit && !create) {
        throw new Error("Neither Submit Draft nor Create Requisition found");
      }
      return `save=${save}, submit=${submit}, create=${create}`;
    })
  );

  results.push(
    await check(page, "4. Approved Position control", async () => {
      await page.getByLabel("Approved Position").scrollIntoViewIfNeeded();
      await page.getByLabel("Approved Position").click();
      const options = await page.getByRole("option").count();
      await page.keyboard.press("Escape");
      return `${options} option(s) in Approved Position list`;
    })
  );

  results.push(
    await check(page, "5. Approval Route control", async () => {
      await page.getByLabel("Approval Route").scrollIntoViewIfNeeded();
      await page.getByLabel("Approval Route").click();
      const options = await page.getByRole("option").count();
      await page.keyboard.press("Escape");
      return `${options} option(s) in Approval Route list`;
    })
  );

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.info(JSON.stringify({ results, allPass: failed.length === 0 }, null, 2));
  if (failed.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

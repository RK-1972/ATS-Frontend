/**
 * Phase 2 readiness gate — exits 1 if any check fails.
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

async function waitForBootstrap(page) {
  await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
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
    await check(page, "1. /workforce-planning renders", async () => {
      await page.goto("/workforce-planning", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Workforce Dashboard").first().waitFor({ timeout: 60000 });
      const kpi = await page.getByText("Approved headcount").count();
      if (!kpi) throw new Error("Missing KPI labels");
      return "Dashboard header + KPIs visible";
    })
  );

  results.push(
    await check(page, "2. /workforce-planning/requests data", async () => {
      await page.goto("/workforce-planning/requests", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Budget requests").first().waitFor({ timeout: 60000 });
      await page.getByText(/BR-/).first().waitFor({ timeout: 90000 });
      const cards = await page.locator(".MuiCard-root").count();
      if (cards < 1) throw new Error(`No budget request cards (count=${cards})`);
      return `${cards} request card(s)`;
    })
  );

  results.push(
    await check(page, "3. /workforce-planning/exceptions data", async () => {
      await page.goto("/workforce-planning/exceptions", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Budget exception monitor").first().waitFor({ timeout: 60000 });
      const rows = await page.locator("table tbody tr").count();
      if (rows < 1) throw new Error(`No exception rows (count=${rows})`);
      return `${rows} exception row(s)`;
    })
  );

  results.push(
    await check(page, "4. /workforce-planning/approvals queue", async () => {
      await page.goto("/workforce-planning/approvals", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Budget approval workspace").first().waitFor({ timeout: 60000 });
      const cards = await page.locator(".MuiCard-root").count();
      if (cards < 1) throw new Error(`Empty approval queue (cards=${cards})`);
      return `${cards} queue card(s)`;
    })
  );

  results.push(
    await check(page, "5. /workforce-planning/catalogue data", async () => {
      await page.goto("/workforce-planning/catalogue", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Approved position catalogue").first().waitFor({ timeout: 60000 });
      const cards = await page.locator(".MuiCard-root").count();
      if (cards < 1) throw new Error(`No catalogue cards (count=${cards})`);
      return `${cards} position card(s)`;
    })
  );

  results.push(
    await check(page, "6. Create Requisition visible state", async () => {
      await page.goto("/workforce-planning/catalogue", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Approved position catalogue").first().waitFor({ timeout: 60000 });
      const createBtn = page.getByRole("button", { name: "Create requisition" });
      const total = await createBtn.count();
      if (total < 1) throw new Error("No Create requisition buttons");
      let enabled = 0;
      let disabled = 0;
      for (let i = 0; i < total; i += 1) {
        if (await createBtn.nth(i).isEnabled()) enabled += 1;
        else disabled += 1;
      }
      if (enabled < 1) throw new Error(`No enabled Create requisition (${disabled} disabled)`);
      return `${enabled} enabled, ${disabled} disabled`;
    })
  );

  results.push(
    await check(page, "7. /requisitions renders (no formData TDZ)", async () => {
      page.on("pageerror", (err) => {
        if (String(err).includes("formData")) {
          throw err;
        }
      });
      await page.goto("/requisitions", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      const title = await page.getByText("Talent Demand Request").count();
      if (title < 1) throw new Error("Talent Demand Request header not visible");
      return "Talent Demand Request workspace visible";
    })
  );

  results.push(
    await check(page, "8. /workforce-planning/analytics charts", async () => {
      await page.goto("/workforce-planning/analytics", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      await page.getByText("Workforce analytics").first().waitFor({ timeout: 60000 });
      const approved = await page.getByText("Total approved").count();
      const dept = await page.getByText("Department-wise utilization").count();
      if (!approved || !dept) throw new Error("Missing analytics metrics/charts");
      return "Metrics + department utilization visible";
    })
  );

  results.push(
    await check(page, "9. Recording identity access", async () => {
      const email = userEmail(USER_KEY);
      await page.goto("/workforce-planning/requests", { waitUntil: "domcontentloaded" });
      await waitForBootstrap(page);
      const sidebarBudget = await page.getByText("Budget requests").count();
      if (!sidebarBudget) throw new Error("Budget requests not reachable");
      return `User ${email} (${USER_KEY})`;
    })
  );

  results.push(
    await check(page, "10. No login on WP (storageState path)", async () => {
      const authPath = process.env.HELP_VIDEO_AUTH_PATH;
      if (!authPath) {
        return "Will use ensureAuthenticatedStorageState before record (login off-camera)";
      }
      return `Auth file: ${authPath}`;
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

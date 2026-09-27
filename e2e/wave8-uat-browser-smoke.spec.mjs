import { test, expect } from "@playwright/test";
import { demoPassword, userEmail } from "./helpers/demo-config.mjs";
import { loginAs, logout } from "./helpers/session.mjs";

const apiBase =
  process.env.E2E_API_BASE_URL ||
  (process.env.E2E_BASE_URL?.includes("localhost")
    ? "http://localhost:5000"
    : "https://optalynx-api.onrender.com");

test.describe("Wave 8 deployed browser smoke", () => {
  test("admin login, recruiter login, logout, refresh, deep-link, unauth protected", async ({
    page
  }) => {
    const password = demoPassword();
    test.skip(!password, "E2E_DEMO_PASSWORD or manifest default required");

    let apiHostSeen = false;
    page.on("request", (req) => {
      if (req.url().startsWith(apiBase)) apiHostSeen = true;
    });

    await loginAs(page, userEmail("admin"), password);
    await logout(page);

    await loginAs(page, userEmail("recruiter"), password);
    await page.goto("/recruiter-dashboard");

    await logout(page);

    await loginAs(page, userEmail("recruiter"), password);
    await page.goto("/recruiter-dashboard");

    const deepPath = "/recruiter-dashboard";
    await page.goto(deepPath);
    await page.reload();
    await expect(page).not.toHaveURL(/\/login$/i, { timeout: 120000 });

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(deepPath);
    await expect(page).toHaveURL(/\/login/i, { timeout: 60000 });

    expect(apiHostSeen, `expected API calls to ${apiBase}`).toBeTruthy();
  });
});

import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../docs/screenshots/workforce-planning");

const pages = [
  { name: "workforce-dashboard.png", url: "http://localhost:5173/workforce-planning" },
  { name: "budget-requests.png", url: "http://localhost:5173/workforce-planning/requests" },
  { name: "approval-workspace.png", url: "http://localhost:5173/workforce-planning/approvals" },
  { name: "approved-positions.png", url: "http://localhost:5173/workforce-planning/catalogue" },
  { name: "budget-exceptions.png", url: "http://localhost:5173/workforce-planning/exceptions" },
  { name: "workforce-analytics.png", url: "http://localhost:5173/workforce-planning/analytics" }
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:5173/login");
await page.evaluate(() => {
  localStorage.setItem("token", "mock-token");
  localStorage.setItem(
    "user",
    JSON.stringify({
      full_name: "Raghavendra Karanik",
      role_name: "Admin",
      employee_code: "E001"
    })
  );
});

await mkdir(outDir, { recursive: true });

for (const target of pages) {
  await page.goto(target.url);
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(outDir, target.name),
    fullPage: false
  });
}

await browser.close();
console.log("Screenshots saved to docs/screenshots/workforce-planning/");

import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../docs/screenshots");

const pages = [
  {
    name: "platform-config-overview.png",
    url: "http://localhost:5173/platform-configuration"
  },
  {
    name: "platform-config-modules.png",
    url: "http://localhost:5173/platform-configuration/modules"
  },
  {
    name: "platform-config-workflows.png",
    url: "http://localhost:5173/platform-configuration/workflows"
  },
  {
    name: "platform-config-roles.png",
    url: "http://localhost:5173/platform-configuration/roles"
  }
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 }
});

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

console.log("Screenshots saved to docs/screenshots/");

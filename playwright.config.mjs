import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 900000,
  expect: { timeout: 45000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.PW_DEMO_VIDEO === "on" ? "on" : "off",
    channel: process.env.PW_CHANNEL || "msedge",
    actionTimeout: 45000,
    navigationTimeout: 90000,
    reducedMotion: "reduce"
  },
  outputDir: "./e2e/artifacts/test-results",
  reporter: [
    ["list"],
    ["json", { outputFile: "./e2e/artifacts/report.json" }]
  ]
});

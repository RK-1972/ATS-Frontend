import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function assertOnPremBuildEnv(mode) {
  if (mode !== "onprem") {
    return;
  }

  const fileEnv = loadEnv(mode, rootDir, "");
  const apiBaseUrl = (
    process.env.VITE_API_BASE_URL ??
    fileEnv.VITE_API_BASE_URL ??
    ""
  ).trim();
  const apiMode = (
    process.env.VITE_API_MODE ??
    fileEnv.VITE_API_MODE ??
    ""
  ).trim();

  if (apiBaseUrl.length > 0) {
    throw new Error(
      [
        "On-prem build rejected (vite --mode onprem).",
        "VITE_API_BASE_URL must be empty so the SPA uses same-origin requests through IIS.",
        "Clear VITE_API_BASE_URL in .env.onprem, .env.onprem.local, and the process environment, then rebuild."
      ].join(" ")
    );
  }

  if (apiMode !== "live") {
    throw new Error(
      [
        "On-prem build rejected (vite --mode onprem).",
        "VITE_API_MODE must be exactly live.",
        "Set VITE_API_MODE=live in .env.onprem and remove mock or other overrides from .env.onprem.local or the process environment."
      ].join(" ")
    );
  }
}

export default defineConfig(({ mode }) => {
  assertOnPremBuildEnv(mode);

  return {
    base: mode === "onprem" ? "./" : "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src")
      }
    },
    build: {
      sourcemap: false
    },
    server: {
      strictPort: true,
      warmup: {
        clientFiles: [
          "./index.html",
          "./src/main.jsx",
          "./src/App.jsx",
          "./src/pages/LoginPage.jsx",
          "./src/pages/workspaces/recruiter/RecruiterWorkspacePage.jsx"
        ]
      }
    }
  };
});

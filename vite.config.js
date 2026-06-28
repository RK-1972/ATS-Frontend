import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src")
    }
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
});

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cacheDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../node_modules/.vite"
);

if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.info("[clean-vite-cache] Removed stale node_modules/.vite");
}

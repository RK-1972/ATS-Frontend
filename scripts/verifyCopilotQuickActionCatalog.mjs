import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogSource = readFileSync(
  join(root, "src/components/copilot/copilotQuickActionCatalog.js"),
  "utf8"
);

const BACKEND_ACTION_IDS = [
  "requisitions",
  "candidates",
  "interview",
  "todays-interviews",
  "assign-recruiter",
  "map-candidate",
  "conduct-interview"
];

const BACKEND_INPUT_PHRASES = {
  requisitions: "Show My Requisitions",
  candidates: "Show Java Candidates",
  interview: "Schedule Interview",
  "todays-interviews": "Show Today's Interviews",
  "assign-recruiter": "Assign Recruiter",
  "map-candidate": "Map Candidate",
  "conduct-interview": "Conduct Interview"
};

for (const id of BACKEND_ACTION_IDS) {
  const keyPattern = id.includes("-") ? `"${id}":` : `${id}:`;
  assert.match(
    catalogSource,
    new RegExp(`${keyPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`),
    `missing catalog entry for ${id}`
  );
  assert.ok(
    catalogSource.includes(`inputText: "${BACKEND_INPUT_PHRASES[id]}"`),
    `inputText mismatch for ${id}`
  );
}

const catalogIdMatches = [
  ...catalogSource.matchAll(/^\s{2}(?:"([\w-]+)"|([\w-]+)):\s*\{/gm)
].map((match) => match[1] || match[2]);

assert.deepEqual(
  [...new Set(catalogIdMatches)].sort(),
  [...BACKEND_ACTION_IDS].sort(),
  "frontend catalog keys must match backend COPILOT_ACTION_IDS"
);

console.log("verifyCopilotQuickActionCatalog: OK");

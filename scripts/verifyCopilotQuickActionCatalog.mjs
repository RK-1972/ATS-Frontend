import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  DIRECT_NAVIGATION_ACTION_IDS,
  DIRECT_NAVIGATION_ROUTES
} from "./copilotNavigationContract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogSource = readFileSync(
  join(root, "src/components/copilot/copilotQuickActionCatalog.js"),
  "utf8"
);

const BACKEND_ACTION_IDS = [
  "my-interviews-today",
  "my-pending-interview-feedback",
  "my-upcoming-interviews",
  "ta-lead-team-requisitions",
  "ta-lead-recruiter-workload",
  "ta-lead-recruitment-bottlenecks",
  "admin-employee-responsibility-clearance",
  "admin-manage-compensation-structures",
  "admin-operational-exceptions",
  "requisitions",
  "candidates",
  "interview",
  "todays-interviews",
  "assign-recruiter",
  "map-candidate",
  "conduct-interview"
];

const BACKEND_INPUT_PHRASES = {
  "my-interviews-today": "Open My Interviews Today",
  "my-pending-interview-feedback": "Open My Pending Interview Feedback",
  "my-upcoming-interviews": "Open My Upcoming Interviews",
  "ta-lead-team-requisitions": "Open My Team Requisitions",
  "ta-lead-recruiter-workload": "Open Recruiter Workload",
  "ta-lead-recruitment-bottlenecks": "Open Recruitment Bottlenecks",
  "admin-employee-responsibility-clearance": "Open Employee Responsibility Clearance",
  "admin-manage-compensation-structures": "Open Manage Compensation Structures",
  "admin-operational-exceptions": "Open Operational Exceptions",
  requisitions: "Show My Requisitions",
  candidates: "Show Java Candidates",
  interview: "Schedule Interview",
  "todays-interviews": "Show Today's Interviews",
  "assign-recruiter": "Assign Recruiter",
  "map-candidate": "Map Candidate",
  "conduct-interview": "Conduct Interview"
};

const LEGACY_BASELINE_IDS = [
  "requisitions",
  "candidates",
  "interview",
  "todays-interviews",
  "assign-recruiter",
  "map-candidate",
  "conduct-interview"
];

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

for (const legacyId of LEGACY_BASELINE_IDS) {
  assert.ok(
    BACKEND_ACTION_IDS.includes(legacyId),
    `legacy action id missing from catalog contract: ${legacyId}`
  );
}

const navigationSource = readFileSync(
  join(root, "src/components/copilot/copilotQuickActionNavigation.js"),
  "utf8"
);

for (const id of DIRECT_NAVIGATION_ACTION_IDS) {
  const contract = DIRECT_NAVIGATION_ROUTES[id];

  assert.ok(
    navigationSource.includes(`"${id}"`),
    `navigation map missing action id: ${id}`
  );
  assert.ok(
    navigationSource.includes(`path: "${contract.path}"`),
    `navigation path mismatch for ${id}`
  );

  assert.match(
    catalogSource,
    new RegExp(`"${id}"[\\s\\S]*?navigatesDirectly:\\s*true`),
    `catalog must mark ${id} as navigatesDirectly`
  );

  if (contract.filters) {
    for (const [filterKey, filterValue] of Object.entries(contract.filters)) {
      assert.ok(
        navigationSource.includes(`${filterKey}: "${filterValue}"`),
        `navigation filter ${filterKey}=${filterValue} missing for ${id}`
      );
    }
  }
}

for (const legacyId of LEGACY_BASELINE_IDS) {
  assert.doesNotMatch(
    catalogSource,
    new RegExp(`"${legacyId}"[\\s\\S]*?navigatesDirectly:\\s*true`),
    `legacy action ${legacyId} must not use direct navigation`
  );
}

console.log("verifyCopilotQuickActionCatalog: OK");

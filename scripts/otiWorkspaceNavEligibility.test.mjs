import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceAvailabilityPath = path.join(
  __dirname,
  "../src/enterprise/workspaceAvailability.js"
);
const recruiterNavRailPath = path.join(
  __dirname,
  "../src/components/layout/RecruiterNavRail.jsx"
);

function canShowTalentIntelligenceNav({
  user,
  workspaceFlags = {},
  serverNavEligible = null
}) {
  if (user?.role_name === "Admin") {
    return true;
  }

  if (Boolean(workspaceFlags?.showTalentIntelligenceWorkspace)) {
    return true;
  }

  if (String(user?.role_name || "").trim() === "Recruiter" && serverNavEligible === true) {
    return true;
  }

  return false;
}

describe("OTI workspace nav eligibility cache regression", () => {
  it("does not default nav visibility from sessionStorage read helper", () => {
    const source = fs.readFileSync(workspaceAvailabilityPath, "utf8");
    assert.doesNotMatch(
      source,
      /serverNavEligible\s*=\s*readOtiWorkspaceNavEligible\(\)/
    );
    assert.match(
      source,
      /readOtiWorkspaceNavEligible\(\)[\s\S]*return null;/
    );
  });

  it("refreshOtiWorkspaceNavEligibility persists server false over stale cache write", async () => {
    const writes = [];
    const source = fs.readFileSync(workspaceAvailabilityPath, "utf8");
    assert.match(source, /writeOtiWorkspaceNavEligible\(eligible\)/);

    const refreshSnippet = `
      async function refreshOtiWorkspaceNavEligibility(fetchNavEligibility, writeFn) {
        try {
          const response = await fetchNavEligibility();
          const eligible = Boolean(response?.data?.eligible);
          writeFn(eligible);
          return eligible;
        } catch {
          writeFn(false);
          return false;
        }
      }
    `;

    const refresh = new Function(
      "fetchNavEligibility",
      "writeFn",
      `${refreshSnippet}; return refreshOtiWorkspaceNavEligibility(fetchNavEligibility, writeFn);`
    );

    const eligible = await refresh(
      async () => ({ data: { eligible: false } }),
      (value) => writes.push(value)
    );

    assert.equal(eligible, false);
    assert.deepEqual(writes, [false]);
  });

  it("stale-positive cache cannot show nav before server confirms eligible recruiter", () => {
    const recruiter = { role_name: "Recruiter", employee_code: "REC-1" };

    assert.equal(
      canShowTalentIntelligenceNav({
        user: recruiter,
        workspaceFlags: {},
        serverNavEligible: null
      }),
      false
    );

    assert.equal(
      canShowTalentIntelligenceNav({
        user: recruiter,
        workspaceFlags: {},
        serverNavEligible: true
      }),
      true
    );

    assert.equal(
      canShowTalentIntelligenceNav({
        user: recruiter,
        workspaceFlags: {},
        serverNavEligible: false
      }),
      false
    );
  });

  it("eligible recruiter navigation remains supported after live server true", () => {
    const recruiter = { role_name: "Recruiter", employee_code: "REC-2" };
    assert.equal(
      canShowTalentIntelligenceNav({
        user: recruiter,
        serverNavEligible: true
      }),
      true
    );
  });

  it("RecruiterNavRail initializes OTI eligibility from null until server refresh", () => {
    const source = fs.readFileSync(recruiterNavRailPath, "utf8");
    assert.match(source, /useState\(null\)/);
    assert.doesNotMatch(source, /readOtiWorkspaceNavEligible/);
    assert.match(source, /refreshOtiWorkspaceNavEligibility/);
  });
});

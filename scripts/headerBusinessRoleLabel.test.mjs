import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveHeaderBusinessRoleLabel } from "../src/utils/headerBusinessRoleLabel.js";

describe("resolveHeaderBusinessRoleLabel", () => {
  it("uses role_name as authoritative primary label", () => {
    assert.equal(
      resolveHeaderBusinessRoleLabel({
        role_name: "Interviewer",
        secondary_role: null
      }),
      "Interviewer"
    );
  });

  it("does not substitute work-assignment-style labels", () => {
    assert.equal(
      resolveHeaderBusinessRoleLabel({
        role_name: "Interviewer",
        assignment_name: "Application Audit Observer"
      }),
      "Interviewer"
    );
  });

  it("shows dual business roles deterministically", () => {
    assert.equal(
      resolveHeaderBusinessRoleLabel({
        role_name: "Recruiter",
        secondary_role: "Interviewer"
      }),
      "Recruiter / Interviewer"
    );
  });

  it("omits duplicate secondary role", () => {
    assert.equal(
      resolveHeaderBusinessRoleLabel({
        role_name: "Admin",
        secondary_role: "Admin"
      }),
      "Admin"
    );
  });
});

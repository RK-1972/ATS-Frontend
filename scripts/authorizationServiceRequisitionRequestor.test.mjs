import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authServicePath = path.join(__dirname, "../src/services/authorizationService.js");
const requisitionPagePath = path.join(__dirname, "../src/pages/RequisitionPage.jsx");
const myDraftsPagePath = path.join(__dirname, "../src/pages/talent-demand/MyDraftsPage.jsx");

describe("canRaiseRequisition aligns with backend requestor gate", () => {
  it("does not grant Admin role an automatic bypass", () => {
    const source = fs.readFileSync(authServicePath, "utf8");
    const fnStart = source.indexOf("async function canRaiseRequisition()");
    const fnEnd = source.indexOf("async function canRaiseBudgetRequest()");
    assert.ok(fnStart >= 0 && fnEnd > fnStart);

    const fnBody = source.slice(fnStart, fnEnd);
    assert.doesNotMatch(
      fnBody,
      /if\s*\(\s*user\.role_name\s*===\s*"Admin"\s*\)\s*\{\s*return true;\s*\}/
    );
    assert.match(fnBody, /REQUISITION_REQUESTOR_CODE/);
  });
});

describe("Draft Requisitions UI respects canRaiseRequisition", () => {
  it("gates the talent demand header link", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /canRaiseRequisition \? \(/);
    assert.match(source, /Draft Requisitions/);
  });

  it("blocks the draft list page when access is denied", () => {
    const source = fs.readFileSync(myDraftsPagePath, "utf8");
    assert.match(source, /canAccessDrafts === false/);
    assert.match(source, /AuthorizationService\.canRaiseRequisition/);
  });
});

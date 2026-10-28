import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(__dirname, "../src/pages/RequisitionPage.jsx");
const pageSource = fs.readFileSync(pagePath, "utf8");

describe("RequisitionPage approved position catalogue gating", () => {
  it("checks canRaiseRequisition before loading the approved-position catalogue", () => {
    const loadBlock = pageSource.slice(
      pageSource.indexOf("const loadApprovedPositions = async () =>"),
      pageSource.indexOf("loadApprovedPositions();")
    );

    assert.match(loadBlock, /AuthorizationService\.canRaiseRequisition\(\)/);
    assert.ok(
      loadBlock.indexOf("canRaiseRequisition") <
        loadBlock.indexOf("listApprovedPositions")
    );
  });

  it("clears catalogue state when the user is not authorized", () => {
    assert.match(pageSource, /if \(!allowed\) \{\s*setApprovedPositions\(\[\]\)/s);
    assert.match(pageSource, /clearUnlockedApprovedPositionSelection/);
  });

  it("does not expose position picker options without catalogue rows", () => {
    assert.match(pageSource, /approvedPositions\.map\(\(position\) =>/);
    assert.match(
      pageSource,
      /positionSelectionRequired && !positionLocked/
    );
  });
});

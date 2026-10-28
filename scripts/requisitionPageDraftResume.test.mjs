import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requisitionPagePath = path.join(__dirname, "../src/pages/RequisitionPage.jsx");
const myDraftsPagePath = path.join(__dirname, "../src/pages/talent-demand/MyDraftsPage.jsx");

describe("requisition draft resume discoverability", () => {
  it("persists draftId in the browser URL after saving a new draft", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /syncDraftResumeUrl/);
    assert.match(source, /params\.set\("draftId"/);
    assert.match(source, /syncDraftResumeUrl\(savedDraft\)/);
  });

  it("exposes Draft Requisitions navigation from the talent demand form", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /navigate\("\/requisitions\/my-drafts"\)/);
    assert.match(source, /Draft Requisitions/);
  });

  it("lists drafts at /requisitions/my-drafts and continues editing via draftId", () => {
    const source = fs.readFileSync(myDraftsPagePath, "utf8");
    assert.match(source, /Draft Requisitions/);
    assert.match(source, /\/requisitions\?draftId=/);
    assert.match(source, /TalentDemandDraftService\.listMyDrafts/);
  });
});

describe("draft requisitions navigation entry points", () => {
  it("lists Draft Requisitions under the Requisitions module sidebar", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../src/components/requisitions/RequisitionsSidebar.jsx"),
      "utf8"
    );
    assert.match(source, /Draft Requisitions/);
    assert.match(source, /\/requisitions\/my-drafts/);
  });
});

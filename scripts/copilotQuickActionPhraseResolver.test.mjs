import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DIRECT_NAVIGATION_ACTION_IDS,
  DIRECT_NAVIGATION_PHRASES,
  LEGACY_ORCHESTRATOR_PHRASES
} from "./copilotNavigationContract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function normalizePhrase(message) {
  return String(message ?? "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "");
}

function buildDirectPhraseMap() {
  const map = new Map();

  for (const id of DIRECT_NAVIGATION_ACTION_IDS) {
    map.set(normalizePhrase(DIRECT_NAVIGATION_PHRASES[id]), id);
  }

  return map;
}

function resolveDirectNavigationActionIdFromMessage(message, phraseMap) {
  const normalized = normalizePhrase(message);

  if (!normalized) {
    return null;
  }

  return phraseMap.get(normalized) ?? null;
}

describe("copilot quick-action phrase resolver", () => {
  const catalogSource = readFileSync(
    join(root, "src/components/copilot/copilotQuickActionCatalog.js"),
    "utf8"
  );
  const phraseMap = buildDirectPhraseMap();

  it("keeps catalog inputText aligned with the navigation phrase contract", () => {
    for (const id of DIRECT_NAVIGATION_ACTION_IDS) {
      assert.ok(
        catalogSource.includes(`inputText: "${DIRECT_NAVIGATION_PHRASES[id]}"`),
        `catalog inputText drift for ${id}`
      );
    }
  });

  it("resolves each direct-navigation phrase to its action id", () => {
    for (const id of DIRECT_NAVIGATION_ACTION_IDS) {
      const phrase = DIRECT_NAVIGATION_PHRASES[id];
      assert.equal(resolveDirectNavigationActionIdFromMessage(phrase, phraseMap), id);
    }
  });

  it("does not treat legacy orchestrator phrases as direct navigation", () => {
    for (const phrase of LEGACY_ORCHESTRATOR_PHRASES) {
      assert.equal(resolveDirectNavigationActionIdFromMessage(phrase, phraseMap), null);
    }
  });

  it("ignores partial or unknown free text", () => {
    assert.equal(
      resolveDirectNavigationActionIdFromMessage("Schedule Interview please", phraseMap),
      null
    );
    assert.equal(resolveDirectNavigationActionIdFromMessage("", phraseMap), null);
  });
});

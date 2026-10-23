import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DIRECT_NAVIGATION_ACTION_IDS,
  DIRECT_NAVIGATION_ROUTES
} from "./copilotNavigationContract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function toLocationState(payload) {
  if (!payload.filters || Object.keys(payload.filters).length === 0) {
    return undefined;
  }

  return { filters: { ...payload.filters } };
}

function navigateCopilotQuickAction(navigate, actionId, navigationById) {
  const target = navigationById[actionId];

  if (!target?.path || !navigate) {
    return false;
  }

  const state = toLocationState({
    path: target.path,
    filters: target.filters
  });

  if (state) {
    navigate(target.path, { state });
  } else {
    navigate(target.path);
  }

  return true;
}

function parseNavigationMapFromSource(source) {
  const ids = [...source.matchAll(/"([\w-]+)":\s*\{\s*\n\s*path:/g)].map(
    (match) => match[1]
  );

  return [...new Set(ids)];
}

describe("copilotQuickActionNavigation", () => {
  const navigationSource = readFileSync(
    join(root, "src/components/copilot/copilotQuickActionNavigation.js"),
    "utf8"
  );

  it("defines navigation entries for all nine direct actions", () => {
    const idsInFile = parseNavigationMapFromSource(navigationSource);

    assert.deepEqual(
      [...idsInFile].sort(),
      [...DIRECT_NAVIGATION_ACTION_IDS].sort()
    );
  });

  it("navigates interviewer views with interviewer_view filters", () => {
    const calls = [];
    const navigate = (path, options) => {
      calls.push({ path, options });
    };

    const ok = navigateCopilotQuickAction(
      navigate,
      "my-upcoming-interviews",
      DIRECT_NAVIGATION_ROUTES
    );

    assert.equal(ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, "/interviewer");
    assert.deepEqual(calls[0].options, {
      state: { filters: { interviewer_view: "upcoming" } }
    });
  });

  it("navigates TA Lead actions without filter state", () => {
    const calls = [];
    const navigate = (path, options) => {
      calls.push({ path, options });
    };

    const ok = navigateCopilotQuickAction(
      navigate,
      "ta-lead-team-requisitions",
      DIRECT_NAVIGATION_ROUTES
    );

    assert.equal(ok, true);
    assert.equal(calls[0].path, "/ta-lead");
    assert.equal(calls[0].options, undefined);
  });

  it("returns false for unknown action ids", () => {
    const ok = navigateCopilotQuickAction(() => {}, "requisitions", DIRECT_NAVIGATION_ROUTES);
    assert.equal(ok, false);
  });
});

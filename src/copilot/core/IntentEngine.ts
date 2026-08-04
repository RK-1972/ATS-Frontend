/**
 * Phase 1 Copilot Intent Engine.
 * Responsibility: resolve a user message into a typed Intent (+ optional filters).
 * Does not navigate, dispatch, or call APIs.
 */

import type { NavigationFilters } from "./navigationPayload";

export type CopilotIntentName =
  | "SHOW_TODAYS_INTERVIEWS"
  | "SHOW_MY_REQUISITIONS"
  | "SHOW_CANDIDATES_BY_FILTER"
  | "SCHEDULE_INTERVIEW"
  | "ASSIGN_RECRUITER";

export type CopilotIntent = {
  intent: CopilotIntentName;
  /** Generic filter payload consumed by pages via location.state.filters */
  filters?: NavigationFilters;
};

/** Exact phrase → intent (no dynamic filters). */
const EXACT_INTENTS: Record<string, CopilotIntentName> = {
  "show todays interviews": "SHOW_TODAYS_INTERVIEWS",
  "show my requisitions": "SHOW_MY_REQUISITIONS",
  "schedule interview": "SCHEDULE_INTERVIEW",
  "schedule an interview": "SCHEDULE_INTERVIEW",
  "create interview": "SCHEDULE_INTERVIEW",
  "assign recruiter": "ASSIGN_RECRUITER"
};

function normalizeMessage(message: string): string {
  return String(message ?? "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "");
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * "Show Java candidates" / "Show React candidates" → skill filter payload.
 * Captures the skill token from the original message (preserves casing).
 */
function resolveCandidatesByFilterIntent(message: string): CopilotIntent | null {
  const match = String(message ?? "")
    .trim()
    .match(/^show\s+(.+?)\s+candidates$/i);

  if (!match?.[1]) {
    return null;
  }

  const skill = match[1].trim();

  if (!skill) {
    return null;
  }

  return {
    intent: "SHOW_CANDIDATES_BY_FILTER",
    filters: { search: skill }
  };
}

/**
 * Resolve a user message to a Phase 1 Intent, or null if unrecognized.
 */
export function resolveIntent(message: string): CopilotIntent | null {
  const normalized = normalizeMessage(message);

  if (!normalized) {
    return null;
  }

  const exact = EXACT_INTENTS[normalized];

  if (exact === "SHOW_TODAYS_INTERVIEWS") {
    return {
      intent: exact,
      filters: { search: todayIsoDate() }
    };
  }

  if (exact) {
    return { intent: exact };
  }

  return resolveCandidatesByFilterIntent(message);
}

const IntentEngine = {
  resolveIntent
};

export default IntentEngine;

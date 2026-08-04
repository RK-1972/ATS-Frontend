import type { NavigateFunction } from "react-router-dom";
import type { CopilotIntent, CopilotIntentName } from "./IntentEngine";
import {
  type NavigationPayload,
  toLocationState
} from "./navigationPayload";

export type ActionDispatcherDeps = {
  navigate: NavigateFunction;
};

const INTENT_ROUTES: Record<CopilotIntentName, string> = {
  SHOW_TODAYS_INTERVIEWS: "/interview-schedule",
  SHOW_MY_REQUISITIONS: "/recruiter/my-requisitions",
  SHOW_CANDIDATES_BY_FILTER: "/candidates",
  SCHEDULE_INTERVIEW: "/interview-schedule",
  ASSIGN_RECRUITER: "/requisitions/assign-recruiters"
};

/**
 * Map a Phase 1 Intent to a generic NavigationPayload.
 * Uses filters from the Intent when present — no skill/date hardcoding here.
 */
function intentToPayload(intent: CopilotIntent): NavigationPayload {
  return {
    path: INTENT_ROUTES[intent.intent],
    filters: intent.filters
  };
}

/**
 * Phase 1 Copilot Action Dispatcher.
 * Responsibility: execute navigation/workflow actions from Intents only.
 */
export function createActionDispatcher({ navigate }: ActionDispatcherDeps) {
  function dispatch(intent: CopilotIntent): void {
    const payload = intentToPayload(intent);
    const state = toLocationState(payload);

    if (state) {
      navigate(payload.path, { state });
      return;
    }

    navigate(payload.path);
  }

  return { dispatch, intentToPayload };
}

export type ActionDispatcher = ReturnType<typeof createActionDispatcher>;

const ActionDispatcherApi = {
  createActionDispatcher
};

export default ActionDispatcherApi;

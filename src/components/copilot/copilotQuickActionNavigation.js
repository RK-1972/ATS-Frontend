import { toLocationState } from "@/copilot/core/navigationPayload";

/**
 * Direct navigation for Copilot quick actions (additive — orchestrator phrases unchanged).
 */
export const COPILOT_NAVIGATION_BY_ACTION_ID = {
  "my-interviews-today": {
    path: "/interviewer",
    filters: { interviewer_view: "today" }
  },
  "my-pending-interview-feedback": {
    path: "/interviewer",
    filters: { interviewer_view: "pending_feedback" }
  },
  "my-upcoming-interviews": {
    path: "/interviewer",
    filters: { interviewer_view: "upcoming" }
  },
  "ta-lead-team-requisitions": {
    path: "/ta-lead"
  },
  "ta-lead-recruiter-workload": {
    path: "/ta-lead"
  },
  "ta-lead-recruitment-bottlenecks": {
    path: "/ta-lead"
  },
  "admin-employee-responsibility-clearance": {
    path: "/responsibility-clearance"
  },
  "admin-manage-compensation-structures": {
    path: "/platform-configuration/compensation-structures"
  },
  "admin-operational-exceptions": {
    path: "/hiring-control-tower"
  }
};

export function navigateCopilotQuickAction(navigate, actionId) {
  const target = COPILOT_NAVIGATION_BY_ACTION_ID[actionId];

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

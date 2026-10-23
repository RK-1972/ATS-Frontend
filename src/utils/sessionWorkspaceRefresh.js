import API from "../api/axios";

/** Fired after localStorage workspace snapshot is updated (e.g. work assignment changes). */
export const WORKSPACE_SESSION_REFRESHED_EVENT =
  "optalynx:workspace-session-refreshed";

/**
 * Refresh workspace / work-assignment snapshot in localStorage for the current session.
 */
export async function refreshWorkspaceSession() {
  const response = await API.get("/session/workspace");
  const data = response.data?.data || {};

  if (data.workspace) {
    localStorage.setItem("workspace", JSON.stringify(data.workspace));
  }

  if (data.work_assignments) {
    localStorage.setItem(
      "work_assignments",
      JSON.stringify(data.work_assignments)
    );
  }

  if (data.work_assignment_status) {
    localStorage.setItem("work_assignment_status", data.work_assignment_status);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(WORKSPACE_SESSION_REFRESHED_EVENT, { detail: data })
    );
  }

  return data;
}

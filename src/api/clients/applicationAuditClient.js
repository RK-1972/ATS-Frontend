import API from "../axios";

export async function postScreenActivityBatch(events) {
  const response = await API.post("/api/v1/application-audit/screen-activity/batch", {
    events
  });
  return response.data;
}

export async function postSessionHeartbeat() {
  const response = await API.post("/api/v1/application-audit/sessions/heartbeat");
  return response.data;
}

export async function postLogout() {
  const response = await API.post("/api/v1/auth/logout");
  return response.data;
}

export async function listSessions(params = {}) {
  const response = await API.get("/api/v1/application-audit/sessions", { params });
  return response.data;
}

export async function listScreenActivity(params = {}) {
  const response = await API.get("/api/v1/application-audit/screen-activity", { params });
  return response.data;
}

export async function listBusinessAuditEvents(params = {}) {
  const response = await API.get("/api/v1/application-audit/business-events", { params });
  return response.data;
}

const applicationAuditClient = {
  postScreenActivityBatch,
  postSessionHeartbeat,
  postLogout,
  listSessions,
  listScreenActivity,
  listBusinessAuditEvents
};

export default applicationAuditClient;

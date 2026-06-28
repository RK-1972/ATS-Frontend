import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut } from "../httpClient";

function emptyTaskBundle() {
  return {
    tasks: [],
    summary: { pending: 0, escalated: 0, overdue: 0 }
  };
}

const taskClient = {
  getAll() {
    return httpGet(ENDPOINTS.tasks, () => emptyTaskBundle());
  },

  getInbox(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const url = query ? `${ENDPOINTS.tasks}/inbox?${query}` : `${ENDPOINTS.tasks}/inbox`;
    return httpGet(url, () => ({ success: true, data: [] }));
  },

  getMyTasks() {
    return httpGet(`${ENDPOINTS.tasks}/my`, () => ({ success: true, data: [] }));
  },

  getTask(taskId) {
    return httpGet(`${ENDPOINTS.tasks}/${taskId}`, () => ({ success: true, data: null }));
  },

  completeTask(taskId, comment = "") {
    return httpPost(
      `${ENDPOINTS.tasks}/${taskId}/complete`,
      { comment },
      () => ({ success: true, data: { taskId, status: "Completed" } })
    );
  },

  reassignTask(taskId, assignee, assigneeRole = null) {
    return httpPost(
      `${ENDPOINTS.tasks}/${taskId}/reassign`,
      { assignee, assignee_role: assigneeRole },
      () => ({ success: true, data: { taskId, assignee } })
    );
  },

  escalateTask(taskId, escalateTo, reason = "") {
    return httpPost(
      `${ENDPOINTS.tasks}/${taskId}/escalate`,
      { escalate_to: escalateTo, reason },
      () => ({ success: true, data: { taskId, status: "Escalated" } })
    );
  }
};

export default taskClient;

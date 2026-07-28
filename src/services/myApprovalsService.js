import API from "../api/axios";

/**
 * List active workflow approvals assigned to the logged-in user.
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function listMyActiveApprovals() {
  const response = await API.get("/api/v1/workflows/my-approvals");
  return response.data;
}

/**
 * Approve an active assignment (completes task / advances chain).
 * @param {string|number} taskId
 * @returns {Promise<object>}
 */
async function approveApproval(taskId) {
  const response = await API.post(
    `/api/v1/workflows/my-approvals/${encodeURIComponent(taskId)}/approve`
  );
  return response.data;
}

/**
 * Reject an active assignment.
 * @param {string|number} taskId
 * @param {string} [comments]
 * @returns {Promise<object>}
 */
async function rejectApproval(taskId, comments = "") {
  const response = await API.post(
    `/api/v1/workflows/my-approvals/${encodeURIComponent(taskId)}/reject`,
    { comments }
  );
  return response.data;
}

/**
 * Request clarification on an active assignment.
 * @param {string|number} taskId
 * @param {string} [comments]
 * @returns {Promise<object>}
 */
async function requestClarification(taskId, comments = "") {
  const response = await API.post(
    `/api/v1/workflows/my-approvals/${encodeURIComponent(taskId)}/request-clarification`,
    { comments }
  );
  return response.data;
}

/**
 * Resubmit clarification and resume the same paused workflow instance.
 * @param {string} instanceId
 * @param {string} [comments]
 * @returns {Promise<object>}
 */
async function submitClarification(instanceId, comments = "") {
  const response = await API.post(
    `/api/v1/workflows/my-approvals/instances/${encodeURIComponent(instanceId)}/submit-clarification`,
    { comments }
  );
  return response.data;
}

const MyApprovalsService = {
  listMyActiveApprovals,
  approveApproval,
  rejectApproval,
  requestClarification,
  submitClarification
};

export default MyApprovalsService;

import API from "../api/axios";

/**
 * List active workflow approvals assigned to the logged-in user.
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function listMyActiveApprovals() {
  const response = await API.get("/api/v1/workflows/my-approvals");
  return response.data;
}

function resolveDocumentTypeKey(row) {
  return String(row?.document_type || row?.workflow_type || "")
    .trim()
    .toUpperCase();
}

/**
 * Active requisition approvals for the logged-in user (bell notifications).
 * Reuses GET /api/v1/workflows/my-approvals — same source as My Approvals.
 */
async function listMyRequisitionApprovalNotifications() {
  const response = await listMyActiveApprovals();
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.filter((row) => resolveDocumentTypeKey(row) === "REQUISITION");
}

/**
 * Active budget approvals for the logged-in user (bell notifications).
 * Reuses GET /api/v1/workflows/my-approvals — same source as My Approvals.
 */
async function listMyBudgetApprovalNotifications() {
  const response = await listMyActiveApprovals();
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.filter((row) => resolveDocumentTypeKey(row) === "BUDGET");
}

function resolveApprovalSortTimestamp(row) {
  return row?.assigned_on || row?.submitted_date || null;
}

function mapRequisitionApprovalNotification(row) {
  const requisitionNumber =
    row?.document_number || row?.requisition_code || "—";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    requisitionNumber,
    title: "Requisition Approval Required",
    message: `Requisition ${requisitionNumber} requires your approval.`,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function mapBudgetApprovalNotification(row) {
  const budgetNumber = row?.document_number || "—";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    budgetNumber,
    title: "Budget Approval Required",
    message: `Budget Request ${budgetNumber} requires your approval.`,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function mapOwnershipNotification(request) {
  const candidateName = [request?.first_name, request?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    requestId: request?.request_id,
    title: "Candidate Ownership Request",
    message: `${candidateName || request?.candidate_code || "Candidate"} — requested by ${
      request?.requester_name || "Recruiter"
    }`,
    requested_on: request?.requested_on || null,
    sortTimestamp: request?.requested_on || null
  };
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
  listMyRequisitionApprovalNotifications,
  listMyBudgetApprovalNotifications,
  mapRequisitionApprovalNotification,
  mapBudgetApprovalNotification,
  mapOwnershipNotification,
  approveApproval,
  rejectApproval,
  requestClarification,
  submitClarification
};

export default MyApprovalsService;

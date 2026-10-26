import API from "../api/axios";
import {
  budgetApprovalNotificationCopy,
  requisitionApprovalNotificationCopy
} from "../utils/enterpriseNotificationSections";

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

/**
 * Active offer approvals for the logged-in user (bell notifications).
 * Reuses GET /api/v1/workflows/my-approvals — same source as My Approvals.
 */
async function listMyOfferApprovalNotifications() {
  const response = await listMyActiveApprovals();
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.filter((row) => resolveDocumentTypeKey(row) === "OFFER");
}

function resolveApprovalSortTimestamp(row) {
  return row?.assigned_on || row?.submitted_date || null;
}

function mapRequisitionApprovalNotification(row) {
  const copy = requisitionApprovalNotificationCopy(row);
  const requisitionNumber =
    row?.document_number || row?.requisition_code || "—";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    requisitionNumber,
    isClarificationRequest: copy.isClarificationRequest,
    title: copy.title,
    message: copy.message,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function mapBudgetApprovalNotification(row) {
  const copy = budgetApprovalNotificationCopy(row);
  const budgetNumber = row?.document_number || "—";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    budgetNumber,
    isClarificationRequest: copy.isClarificationRequest,
    title: copy.title,
    message: copy.message,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function mapOfferApprovalNotification(row) {
  const offerNumber = row?.document_number || row?.offer_id || "—";
  const candidateName = String(row?.candidateName || row?.candidate_name || "").trim();
  const candidateLabel = candidateName ? ` for ${candidateName}` : "";
  const isClarificationRequest =
    String(row?.task_type || "").trim().toLowerCase() === "clarification";

  const title = isClarificationRequest
    ? "Offer Clarification Required"
    : "Offer Approval Required";

  const message = isClarificationRequest
    ? `Offer ${offerNumber}${candidateLabel} requires your clarification response.`
    : `Offer ${offerNumber}${candidateLabel} requires your approval.`;

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    instanceId: row?.instance_id || null,
    taskType: row?.task_type || null,
    isClarificationRequest,
    offerNumber,
    document_number: offerNumber,
    offerId: offerNumber,
    title,
    message,
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

async function listMyBellNotifications() {
  const response = await API.get("/api/v1/workflows/my-bell-notifications");
  return Array.isArray(response?.data?.data) ? response.data.data : [];
}

function emptyBellGroups() {
  return {
    budget: [],
    resourceRequisition: [],
    offer: [],
    candidateOwnership: [],
    interviewScheduled: [],
    assignedRequisition: [],
    feedback: []
  };
}

function mapBellNotification(row) {
  return {
    deliveryId: row?.delivery_id,
    event: row?.event_key,
    title: row?.title,
    message: row?.message,
    categoryKey: row?.category,
    route: row?.route || null,
    routeState: row?.route_state || null,
    taskId: row?.task_id || row?.route_state?.taskId || null,
    documentNumber: row?.document_number || null,
    offerId: row?.route_state?.offerId || row?.document_number || null,
    document_number: row?.document_number || row?.route_state?.offerId || null,
    sortTimestamp: row?.attempted_on || null,
    assigned_on: row?.attempted_on || null
  };
}

function groupBellNotifications(rows) {
  const grouped = emptyBellGroups();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const item = mapBellNotification(row);
    if (!item.title || !grouped[item.categoryKey]) {
      return;
    }
    grouped[item.categoryKey].push(item);
  });

  return grouped;
}

const MyApprovalsService = {
  listMyActiveApprovals,
  listMyRequisitionApprovalNotifications,
  listMyBudgetApprovalNotifications,
  listMyOfferApprovalNotifications,
  listMyBellNotifications,
  groupBellNotifications,
  mapRequisitionApprovalNotification,
  mapBudgetApprovalNotification,
  mapOfferApprovalNotification,
  mapOwnershipNotification,
  approveApproval,
  rejectApproval,
  requestClarification,
  submitClarification
};

export default MyApprovalsService;

import API from "../api/axios";

async function getApprovalRoutePolicies() {
  const response = await API.get("/approval-route-policies");
  return response.data;
}

async function getApprovalRoutePolicy(policyId) {
  const response = await API.get(
    `/approval-route-policies/${encodeURIComponent(policyId)}`
  );
  return response.data;
}

async function createApprovalRoutePolicy(policy) {
  const response = await API.post("/approval-route-policies", { policy });
  return response.data;
}

async function updateApprovalRoutePolicy(policyId, policy) {
  const response = await API.put(
    `/approval-route-policies/${encodeURIComponent(policyId)}`,
    { policy }
  );
  return response.data;
}

async function activateApprovalRoutePolicy(policyId) {
  const response = await API.post(
    `/approval-route-policies/${encodeURIComponent(policyId)}/activate`
  );
  return response.data;
}

async function deactivateApprovalRoutePolicy(policyId) {
  const response = await API.post(
    `/approval-route-policies/${encodeURIComponent(policyId)}/deactivate`
  );
  return response.data;
}

const ApprovalRoutePolicyService = {
  getApprovalRoutePolicies,
  getApprovalRoutePolicy,
  createApprovalRoutePolicy,
  updateApprovalRoutePolicy,
  activateApprovalRoutePolicy,
  deactivateApprovalRoutePolicy
};

export {
  getApprovalRoutePolicies,
  getApprovalRoutePolicy,
  createApprovalRoutePolicy,
  updateApprovalRoutePolicy,
  activateApprovalRoutePolicy,
  deactivateApprovalRoutePolicy
};

export default ApprovalRoutePolicyService;

import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import workforcePlanningMock from "@/data/mock/workforcePlanning.mock";
import { cloneData } from "@/utils/cloneData";

function mockBundle(config = workforcePlanningMock) {
  return {
    config: cloneData(config),
    baseline: cloneData(config),
    isDirty: false,
    version: "1.0"
  };
}

const workforcePlanningClient = {

  getAll() {
    return httpGet(ENDPOINTS.workforce, () => mockBundle());
  },

  getById(id, currentData) {
    return httpGet(
      `${ENDPOINTS.workforce}/${id}`,
      () => {
        const queue = currentData?.approval_queue || workforcePlanningMock.approval_queue;
        return cloneData(queue.find((item) => item.id === id) || null);
      }
    );
  },

  approveBudgetRequest(id, comment = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/budget-requests/${id}/approve`,
      { comment },
      () => ({
        workforce: cloneData(workforcePlanningMock),
        toastMessage: "Budget request approved."
      })
    );
  },

  rejectBudgetRequest(id, comment = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/budget-requests/${id}/reject`,
      { comment },
      () => ({
        workforce: cloneData(workforcePlanningMock),
        toastMessage: "Budget request rejected."
      })
    );
  },

  sendBackBudgetRequest(id, comment = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/budget-requests/${id}/send-back`,
      { comment },
      () => ({
        workforce: cloneData(workforcePlanningMock),
        toastMessage: "Budget request sent back to hiring manager."
      })
    );
  },

  requestClarification(id, comments = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/budget-requests/${id}/request-clarification`,
      { comments },
      () => ({
        workforce: cloneData(workforcePlanningMock),
        toastMessage: "Clarification request sent."
      })
    );
  },

  submitClarification(id, comments = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/budget-requests/${id}/submit-clarification`,
      { comments },
      () => ({
        workforce: cloneData(workforcePlanningMock),
        toastMessage: "Clarification submitted."
      })
    );
  },

  createRequisition(positionId) {
    return httpPost(
      `${ENDPOINTS.workforce}/approved-positions/${positionId}/requisitions`,
      {},
      () => ({
        workforce: cloneData(workforcePlanningMock),
        requisitionId: "REQ-2026-1188",
        toastMessage: "Requisition created."
      })
    );
  },

  publish(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/publish`,
      { payload, reason },
      () => mockBundle(payload || workforcePlanningMock)
    );
  },

  discard() {
    return httpPost(`${ENDPOINTS.workforce}/discard`, {}, () => mockBundle());
  },

  exportWorkforce() {
    return httpGet(`${ENDPOINTS.workforce}/export`, () => ({
      exportedAt: new Date().toISOString(),
      version: "1.0",
      payload: cloneData(workforcePlanningMock)
    }));
  },

  previewImport(payload) {
    return httpPost(
      `${ENDPOINTS.workforce}/import/preview`,
      { payload },
      () => ({ valid: true, errors: [], summary: {} })
    );
  },

  commitImport(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.workforce}/import`,
      { payload, reason },
      () => mockBundle(payload)
    );
  },

  create(payload) {
    return httpPost(ENDPOINTS.workforce, payload, () => cloneData(payload));
  },

  update(id, payload) {
    return httpPut(`${ENDPOINTS.workforce}/${id}`, payload, () => cloneData(payload));
  },

  archive(id) {
    return httpPost(`${ENDPOINTS.workforce}/${id}/archive`, {}, () => ({ id, archived: true }));
  },

  delete(id) {
    return httpDelete(`${ENDPOINTS.workforce}/${id}`, () => ({ id, deleted: true }));
  }

};

export default workforcePlanningClient;

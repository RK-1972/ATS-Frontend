import API from "../api/axios";

async function listQueue(queueKey) {
  const response = await API.get(
    `/api/v1/workforce/requisitions/${encodeURIComponent(queueKey)}`
  );
  return response.data;
}

async function getInspectorDetail(requisitionCode) {
  const response = await API.get(
    `/api/v1/workforce/requisitions/detail/${encodeURIComponent(requisitionCode)}`
  );
  return response.data;
}

async function getActionContext(requisitionCode) {
  const response = await API.get(
    `/api/v1/workforce/requisitions/${encodeURIComponent(requisitionCode)}/action-context`
  );
  return response.data;
}

async function submitClarification(requisitionCode, comments) {
  const response = await API.post(
    `/api/v1/workforce/requisitions/${encodeURIComponent(requisitionCode)}/submit-clarification`,
    { comments }
  );
  return response.data;
}

const WorkforceRequisitionQueueService = {
  listQueue,
  getInspectorDetail,
  getActionContext,
  submitClarification
};

export default WorkforceRequisitionQueueService;

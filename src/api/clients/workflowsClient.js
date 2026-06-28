import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import hiringControlTowerMock from "@/data/mock/hiringControlTower.mock";
import { cloneData } from "@/utils/cloneData";

function mockBundle() {
  const definitions = cloneData(platformConfigMock.workflows).map((workflow) => ({
    workflow_code: workflow.key.toUpperCase(),
    workflow_key: workflow.key,
    ...workflow,
    stages: (workflow.stages || []).map((name, index) => ({
      stage_key: name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      stage_name: name,
      sequence_order: index + 1,
      is_approval_stage: (workflow.approval_stages || []).includes(name)
    }))
  }));

  return {
    config: {
      meta: { org_name: "IGS Engineering Quality", environment: "Production" },
      definitions,
      workflows: cloneData(platformConfigMock.workflows),
      primary_instance_id: hiringControlTowerMock.meta.process_id
    },
    baseline: {
      definitions,
      workflows: cloneData(platformConfigMock.workflows)
    },
    workflows: cloneData(platformConfigMock.workflows),
    definitions,
    instances: [{
      instanceId: hiringControlTowerMock.meta.process_id,
      workflowCode: "ENTERPRISE_HIRING_LIFECYCLE",
      status: "Running"
    }],
    primaryInstance: {
      ...cloneData(hiringControlTowerMock),
      linkedPositionId: "AP-ENG-042",
      linkedRequisitionId: hiringControlTowerMock.meta.requisition_id
    },
    isDirty: false,
    version: "1.0"
  };
}

const workflowsClient = {

  getAll() {
    return httpGet(ENDPOINTS.workflows, () => mockBundle());
  },

  getByCode(workflowCode) {
    return httpGet(
      `${ENDPOINTS.workflows}/${workflowCode}`,
      () => mockBundle().workflows.find((item) => item.key === workflowCode) || null
    );
  },

  publish(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.workflows}/publish`,
      { payload, reason },
      () => mockBundle()
    );
  },

  discard() {
    return httpPost(`${ENDPOINTS.workflows}/discard`, {}, () => mockBundle());
  },

  archive(workflowCode, reason = "") {
    return httpPost(
      `${ENDPOINTS.workflows}/${workflowCode}/archive`,
      { reason },
      () => mockBundle()
    );
  },

  exportWorkflows() {
    return httpGet(`${ENDPOINTS.workflows}/export`, () => ({
      exportedAt: new Date().toISOString(),
      version: "1.0",
      payload: mockBundle().baseline
    }));
  },

  previewImport(payload) {
    return httpPost(
      `${ENDPOINTS.workflows}/import/preview`,
      { payload },
      () => ({ valid: true, errors: [], warnings: [] })
    );
  },

  commitImport(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.workflows}/import`,
      { payload, reason },
      () => mockBundle()
    );
  },

  restore(snapshotId, reason = "") {
    return httpPost(
      `${ENDPOINTS.workflows}/restore/${snapshotId}`,
      { reason },
      () => mockBundle()
    );
  },

  start(workflowCode, executionContext) {
    return httpPost(
      `${ENDPOINTS.workflows}/start`,
      { workflowCode, executionContext },
      () => ({ instanceId: `WF-${Date.now()}`, status: "Running" })
    );
  },

  getInstance(instanceId) {
    return httpGet(
      `${ENDPOINTS.workflows}/instances/${instanceId}`,
      () => ({ instanceId, payload: cloneData(hiringControlTowerMock) })
    );
  },

  getTasks(instanceId) {
    return httpGet(
      `${ENDPOINTS.workflows}/instances/${instanceId}/tasks`,
      () => []
    );
  },

  advance(instanceId, action, executionContext) {
    return httpPost(
      `${ENDPOINTS.workflows}/instances/${instanceId}/advance`,
      { action, executionContext },
      () => ({
        hiringProcess: cloneData(hiringControlTowerMock),
        toastMessage: "Stage updated."
      })
    );
  },

  requestClarification(instanceId, comments) {
    return httpPost(
      `${ENDPOINTS.workflows}/instances/${instanceId}/request-clarification`,
      { comments },
      () => ({
        hiringProcess: cloneData(hiringControlTowerMock),
        toastMessage: "Clarification request sent. Workflow paused."
      })
    );
  },

  submitClarification(instanceId, comments) {
    return httpPost(
      `${ENDPOINTS.workflows}/instances/${instanceId}/submit-clarification`,
      { comments },
      () => ({ hiringProcess: cloneData(hiringControlTowerMock) })
    );
  },

  completeTask(taskId) {
    return httpPost(
      `${ENDPOINTS.workflows}/tasks/${taskId}/complete`,
      {},
      () => ({ taskId, status: "Completed" })
    );
  },

  reassignTask(taskId, assignee, assigneeRole) {
    return httpPost(
      `${ENDPOINTS.workflows}/tasks/${taskId}/reassign`,
      { assignee, assigneeRole },
      () => ({ taskId, assignee, status: "Pending" })
    );
  },

  create(workflow) {
    return httpPost(ENDPOINTS.workflows, workflow, () => cloneData(workflow));
  },

  update(workflowCode, workflow) {
    return httpPut(
      `${ENDPOINTS.workflows}/${workflowCode}`,
      workflow,
      () => cloneData(workflow)
    );
  },

  delete(workflowCode) {
    return httpDelete(
      `${ENDPOINTS.workflows}/${workflowCode}`,
      () => ({ workflowCode, deleted: true })
    );
  }

};

export default workflowsClient;

import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import { cloneData } from "@/utils/cloneData";

const workflowConfigurationClient = {

  getAll(currentData) {
    return httpGet(
      ENDPOINTS.workflows,
      () => cloneData(currentData?.workflows || platformConfigMock.workflows)
    );
  },

  getById(key, currentData) {
    return httpGet(
      `${ENDPOINTS.workflows}/${key}`,
      () => {
        const workflows = currentData?.workflows || platformConfigMock.workflows;
        return cloneData(workflows.find((item) => item.key === key) || null);
      }
    );
  },

  create(workflow) {
    return httpPost(ENDPOINTS.workflows, workflow, () => cloneData(workflow));
  },

  update(key, workflow) {
    return httpPut(
      `${ENDPOINTS.workflows}/${key}`,
      workflow,
      () => cloneData(workflow)
    );
  },

  publish(workflows) {
    return httpPost(
      `${ENDPOINTS.workflows}/publish`,
      workflows,
      () => cloneData(workflows)
    );
  },

  archive(key) {
    return httpPost(
      `${ENDPOINTS.workflows}/${key}/archive`,
      {},
      () => ({ key, archived: true })
    );
  },

  delete(key) {
    return httpDelete(
      `${ENDPOINTS.workflows}/${key}`,
      () => ({ key, deleted: true })
    );
  }

};

export default workflowConfigurationClient;

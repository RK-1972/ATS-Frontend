import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import businessRulesMock from "@/data/mock/businessRules.mock";
import { cloneData } from "@/utils/cloneData";

function mockBundle(config = businessRulesMock) {
  const baseline = cloneData(config);
  return {
    config: cloneData(config),
    baseline,
    isDirty: false,
    version: "2.1",
    versionStatus: "Published"
  };
}

const businessRulesClient = {

  getAll() {
    return httpGet(ENDPOINTS.businessRules, () => mockBundle());
  },

  getById(id, currentData) {
    return httpGet(
      `${ENDPOINTS.businessRules}/${id}`,
      () => {
        const rules = currentData?.rules || businessRulesMock.rules;
        return cloneData(rules.find((item) => item.id === id) || null);
      }
    );
  },

  create(rule) {
    return httpPost(
      ENDPOINTS.businessRules,
      rule,
      () => mockBundle()
    );
  },

  update(id, rule) {
    return httpPut(
      `${ENDPOINTS.businessRules}/${id}`,
      rule,
      () => mockBundle()
    );
  },

  publish(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.businessRules}/publish`,
      { payload, reason },
      () => {
        const bundle = mockBundle(payload || businessRulesMock);
        bundle.config.meta.last_published = new Date().toISOString();
        bundle.baseline = cloneData(bundle.config);
        bundle.isDirty = false;
        return bundle;
      }
    );
  },

  publishRule(id, reason = "") {
    return httpPost(
      `${ENDPOINTS.businessRules}/${id}/publish`,
      { reason },
      () => mockBundle()
    );
  },

  archive(id, reason = "") {
    return httpPost(
      `${ENDPOINTS.businessRules}/${id}/archive`,
      { reason },
      () => mockBundle()
    );
  },

  delete(id) {
    return httpDelete(
      `${ENDPOINTS.businessRules}/${id}`,
      () => mockBundle()
    );
  },

  discard() {
    return httpPost(
      `${ENDPOINTS.businessRules}/discard`,
      {},
      () => mockBundle()
    );
  },

  validate(payload) {
    return httpPost(
      `${ENDPOINTS.businessRules}/validate`,
      { payload },
      () => ({ valid: true, errors: [], warnings: [] })
    );
  },

  execute(ruleCode, executionContext) {
    return httpPost(
      `${ENDPOINTS.businessRules}/execute`,
      { ruleCode, executionContext },
      () => ({
        ruleMatched: false,
        ruleCode,
        actions: [],
        requiredApprovals: [],
        notifications: [],
        escalations: []
      })
    );
  },

  simulate(executionContext) {
    return httpPost(
      `${ENDPOINTS.businessRules}/simulate`,
      { executionContext },
      () => ({
        triggered_rules: ["Standard Offer Approval"],
        approvers: ["Hiring Manager"],
        notifications: [],
        escalations: [],
        actions: [],
        estimated_sla: "24 hours",
        budget_threshold_pct: 10
      })
    );
  },

  exportRules() {
    return httpGet(
      `${ENDPOINTS.businessRules}/export`,
      () => ({
        exportedAt: new Date().toISOString(),
        version: "2.1",
        payload: cloneData(businessRulesMock)
      })
    );
  },

  previewImport(payload) {
    return httpPost(
      `${ENDPOINTS.businessRules}/import/preview`,
      { payload },
      () => ({ valid: true, errors: [], warnings: [], summary: {} })
    );
  },

  commitImport(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.businessRules}/import`,
      { payload, reason },
      () => mockBundle(payload)
    );
  },

  restore(snapshotId, reason = "") {
    return httpPost(
      `${ENDPOINTS.businessRules}/restore/${snapshotId}`,
      { reason },
      () => mockBundle()
    );
  },

  listSnapshots() {
    return httpGet(
      `${ENDPOINTS.businessRules}/snapshots`,
      () => []
    );
  }

};

export default businessRulesClient;

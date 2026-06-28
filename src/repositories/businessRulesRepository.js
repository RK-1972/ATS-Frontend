import { isLiveMode } from "@/api/config";
import businessRulesClient from "@/api/clients/businessRulesClient";
import businessRulesMock from "@/data/mock/businessRules.mock";
import { cloneData } from "@/utils/cloneData";

function buildEmptyShell() {
  return {
    meta: {
      org_name: "",
      last_published: null,
      environment: "Production"
    },
    kpis: {
      total_rules: 0,
      active_rules: 0,
      draft_rules: 0,
      pending_approval_rules: 0
    },
    categories: cloneData(businessRulesMock.categories).map((category) => ({
      ...category,
      rule_count: 0
    })),
    rules: [],
    approval_matrix: [],
    version_history: []
  };
}

function getInitialState() {
  if (isLiveMode()) {
    return buildEmptyShell();
  }

  return cloneData(businessRulesMock);
}

function getSimulatorDefaults() {
  return cloneData(businessRulesMock.simulator_defaults);
}

function getDesignerDefaults() {
  return cloneData(businessRulesMock.designer_defaults);
}

function normalizeBundle(response) {
  if (response?.config) {
    return {
      config: cloneData(response.config),
      baseline: cloneData(response.baseline || response.config),
      isDirty: Boolean(response.isDirty)
    };
  }

  const config = cloneData(response);
  return {
    config,
    baseline: cloneData(config),
    isDirty: false
  };
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const response = await businessRulesClient.getAll();
    return normalizeBundle(response);
  }

  return {
    config: cloneData(currentData),
    baseline: cloneData(currentData),
    isDirty: false
  };
}

async function getById(id, currentData) {
  if (isLiveMode()) {
    return businessRulesClient.getById(id, currentData);
  }

  return businessRulesClient.getById(id, currentData);
}

function publishLocal(businessRules) {
  const snapshot = cloneData(businessRules);

  return {
    ...snapshot,
    meta: {
      ...snapshot.meta,
      last_published: new Date().toISOString()
    }
  };
}

async function publish(businessRules) {
  if (!isLiveMode()) {
    return publishLocal(businessRules);
  }

  const response = await businessRulesClient.publish(businessRules);
  return normalizeBundle(response);
}

function discardLocal(baseline) {
  return cloneData(baseline);
}

async function discard(baseline) {
  if (!isLiveMode()) {
    return discardLocal(baseline);
  }

  const response = await businessRulesClient.discard();
  return normalizeBundle(response);
}

function updateState(businessRules, updater) {
  return typeof updater === "function"
    ? updater(businessRules)
    : updater;
}

const businessRulesRepository = {
  getInitialState,
  getSimulatorDefaults,
  getDesignerDefaults,
  getAll,
  getById,
  create: updateState,
  update: updateState,
  publish,
  archive: discard,
  delete: discard,
  discard,
  updateState
};

export default businessRulesRepository;

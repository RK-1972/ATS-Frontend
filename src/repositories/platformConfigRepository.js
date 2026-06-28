import { isLiveMode } from "@/api/config";
import platformConfigClient from "@/api/clients/platformConfigClient";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import { syncOfferAboveBudgetRule } from "@/enterprise/selectors";
import { cloneData } from "@/utils/cloneData";

function buildEmptyShell() {
  const shell = cloneData(platformConfigMock);
  shell.meta = {
    org_name: "",
    last_published: null,
    draft_changes: 0,
    environment: "Production"
  };
  shell.modules = [];
  shell.workflows = [];
  shell.notification_channels = [];
  shell.ai_features = [];
  shell.role_visibility = {
    roles: [],
    modules: [],
    matrix: {}
  };
  return shell;
}

function getInitialState() {
  if (isLiveMode()) {
    return buildEmptyShell();
  }

  return cloneData(platformConfigMock);
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
    const response = await platformConfigClient.getAll();
    return normalizeBundle(response);
  }

  return {
    config: cloneData(currentData),
    baseline: cloneData(currentData),
    isDirty: false
  };
}

async function getById(id, currentData) {
  return platformConfigClient.getById(id, currentData);
}

function toggleModuleLocal(config, key) {
  const previous = config.modules.find((item) => item.key === key);

  const nextConfig = {
    ...config,
    modules: config.modules.map((item) =>
      item.key === key && !item.required
        ? { ...item, enabled: !item.enabled }
        : item
    )
  };

  const updated = nextConfig.modules.find((item) => item.key === key);

  return { config: nextConfig, previous, updated };
}

async function toggleModule(config, key) {
  if (!isLiveMode()) {
    return toggleModuleLocal(config, key);
  }

  const previous = config.modules.find((item) => item.key === key);
  const response = await platformConfigClient.applyDraft({ action: "toggleModule", key });
  const bundle = normalizeBundle(response);
  const updated = bundle.config.modules.find((item) => item.key === key);

  return { ...bundle, previous, updated };
}

function toggleWorkflowLocal(config, key) {
  return {
    config: {
      ...config,
      workflows: config.workflows.map((item) =>
        item.key === key
          ? { ...item, enabled: !item.enabled }
          : item
      )
    }
  };
}

async function toggleWorkflow(config, key) {
  if (!isLiveMode()) {
    return toggleWorkflowLocal(config, key);
  }

  const response = await platformConfigClient.applyDraft({ action: "toggleWorkflow", key });
  return normalizeBundle(response);
}

function updateBudgetLocal(config, field, value) {
  const previous = config.budget[field];

  return {
    config: {
      ...config,
      budget: {
        ...config.budget,
        [field]: value
      }
    },
    previous,
    field,
    value
  };
}

async function updateBudget(config, field, value) {
  if (!isLiveMode()) {
    return updateBudgetLocal(config, field, value);
  }

  const previous = config.budget[field];
  const response = await platformConfigClient.applyDraft({
    action: "updateBudget",
    field,
    value
  });
  const bundle = normalizeBundle(response);

  return { ...bundle, previous, field, value };
}

function syncBusinessRulesOnBudgetChange(businessRules, value) {
  return {
    ...businessRules,
    rules: syncOfferAboveBudgetRule(businessRules.rules, value)
  };
}

function updateNotificationSettingsLocal(config, field, value) {
  return {
    config: {
      ...config,
      notification_settings: {
        ...config.notification_settings,
        [field]: value
      }
    }
  };
}

async function updateNotificationSettings(config, field, value) {
  if (!isLiveMode()) {
    return updateNotificationSettingsLocal(config, field, value);
  }

  const response = await platformConfigClient.applyDraft({
    action: "updateNotificationSettings",
    field,
    value
  });
  return normalizeBundle(response);
}

function updateAiGovernanceLocal(config, field, value) {
  return {
    config: {
      ...config,
      ai_governance: {
        ...config.ai_governance,
        [field]: value
      }
    }
  };
}

async function updateAiGovernance(config, field, value) {
  if (!isLiveMode()) {
    return updateAiGovernanceLocal(config, field, value);
  }

  const response = await platformConfigClient.applyDraft({
    action: "updateAiGovernance",
    field,
    value
  });
  return normalizeBundle(response);
}

function toggleNotificationChannelLocal(config, key) {
  const previous = config.notification_channels.find((item) => item.key === key);

  const nextConfig = {
    ...config,
    notification_channels: config.notification_channels.map((item) =>
      item.key === key
        ? { ...item, enabled: !item.enabled }
        : item
    )
  };

  const updated = nextConfig.notification_channels.find((item) => item.key === key);

  return { config: nextConfig, previous, updated };
}

async function toggleNotificationChannel(config, key) {
  if (!isLiveMode()) {
    return toggleNotificationChannelLocal(config, key);
  }

  const previous = config.notification_channels.find((item) => item.key === key);
  const response = await platformConfigClient.applyDraft({
    action: "toggleNotificationChannel",
    key
  });
  const bundle = normalizeBundle(response);
  const updated = bundle.config.notification_channels.find((item) => item.key === key);

  return { ...bundle, previous, updated };
}

function toggleAiFeatureLocal(config, key) {
  return {
    config: {
      ...config,
      ai_features: config.ai_features.map((item) =>
        item.key === key
          ? { ...item, enabled: !item.enabled }
          : item
      )
    }
  };
}

async function toggleAiFeature(config, key) {
  if (!isLiveMode()) {
    return toggleAiFeatureLocal(config, key);
  }

  const response = await platformConfigClient.applyDraft({ action: "toggleAiFeature", key });
  return normalizeBundle(response);
}

function toggleRoleVisibilityLocal(config, role, moduleKey) {
  const previous = config.role_visibility.matrix[role]?.[moduleKey];

  return {
    config: {
      ...config,
      role_visibility: {
        ...config.role_visibility,
        matrix: {
          ...config.role_visibility.matrix,
          [role]: {
            ...config.role_visibility.matrix[role],
            [moduleKey]: !config.role_visibility.matrix[role][moduleKey]
          }
        }
      }
    },
    previous,
    role,
    moduleKey,
    nextValue: !previous
  };
}

async function toggleRoleVisibility(config, role, moduleKey) {
  if (!isLiveMode()) {
    return toggleRoleVisibilityLocal(config, role, moduleKey);
  }

  const previous = config.role_visibility.matrix[role]?.[moduleKey];
  const response = await platformConfigClient.applyDraft({
    action: "toggleRoleVisibility",
    role,
    moduleKey
  });
  const bundle = normalizeBundle(response);

  return {
    ...bundle,
    previous,
    role,
    moduleKey,
    nextValue: bundle.config.role_visibility.matrix[role][moduleKey]
  };
}

function insertWorkflowStageLocal(config, workflowKey, stageName, afterStageName) {
  const workflow = config.workflows.find((item) => item.key === workflowKey);

  if (!workflow || workflow.stages.includes(stageName)) {
    return null;
  }

  const afterIndex = workflow.stages.indexOf(afterStageName);

  if (afterIndex === -1) {
    return null;
  }

  const nextStages = [...workflow.stages];
  nextStages.splice(afterIndex + 1, 0, stageName);

  const nextConfig = {
    ...config,
    workflows: config.workflows.map((item) =>
      item.key === workflowKey
        ? {
            ...item,
            stages: nextStages,
            steps: nextStages.length
          }
        : item
    )
  };

  return {
    config: nextConfig,
    workflow,
    nextStages,
    workflowKey,
    stageName,
    afterStageName
  };
}

async function insertWorkflowStage(config, workflowKey, stageName, afterStageName) {
  if (!isLiveMode()) {
    return insertWorkflowStageLocal(config, workflowKey, stageName, afterStageName);
  }

  const workflow = config.workflows.find((item) => item.key === workflowKey);
  const response = await platformConfigClient.applyDraft({
    action: "insertWorkflowStage",
    workflowKey,
    stageName,
    afterStageName
  });
  const bundle = normalizeBundle(response);
  const updatedWorkflow = bundle.config.workflows.find((item) => item.key === workflowKey);

  return {
    ...bundle,
    workflow,
    nextStages: updatedWorkflow?.stages || [],
    workflowKey,
    stageName,
    afterStageName
  };
}

function publishLocal(config) {
  return cloneData(config);
}

async function publish(config) {
  if (!isLiveMode()) {
    return publishLocal(config);
  }

  const response = await platformConfigClient.publish();
  return normalizeBundle(response);
}

async function discardFromApi() {
  const response = await platformConfigClient.discard();
  return normalizeBundle(response);
}

function discardLocal(baseline) {
  return cloneData(baseline);
}

async function discard(baseline) {
  if (!isLiveMode()) {
    return discardLocal(baseline);
  }

  return discardFromApi();
}

const platformConfigRepository = {
  getInitialState,
  getAll,
  getById,
  create: publish,
  update: publish,
  publish,
  archive: discard,
  delete: discard,
  toggleModule,
  toggleWorkflow,
  updateBudget,
  syncBusinessRulesOnBudgetChange,
  updateNotificationSettings,
  updateAiGovernance,
  toggleNotificationChannel,
  toggleAiFeature,
  toggleRoleVisibility,
  insertWorkflowStage,
  discard
};

export default platformConfigRepository;

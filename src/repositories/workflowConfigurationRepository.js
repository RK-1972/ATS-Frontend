import { isLiveMode } from "@/api/config";
import workflowConfigurationClient from "@/api/clients/workflowConfigurationClient";
import workflowsRepository from "@/repositories/workflowsRepository";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import { cloneData } from "@/utils/cloneData";

async function getAll(platformConfig) {
  if (isLiveMode()) {
    return workflowsRepository.getWorkflows(platformConfig);
  }

  return workflowConfigurationClient.getAll(platformConfig);
}

async function getById(key, platformConfig) {
  if (isLiveMode()) {
    return workflowsRepository.getByCode(key, platformConfig);
  }

  return workflowConfigurationClient.getById(key, platformConfig);
}

function toggleWorkflow(platformConfig, key) {

  if (isLiveMode()) {
    return platformConfigRepositoryToggle(platformConfig, key);
  }

  return {
    config: {
      ...platformConfig,
      workflows: platformConfig.workflows.map((item) =>
        item.key === key
          ? { ...item, enabled: !item.enabled }
          : item
      )
    }
  };

}

function platformConfigRepositoryToggle(platformConfig, key) {
  return {
    config: {
      ...platformConfig,
      workflows: platformConfig.workflows.map((item) =>
        item.key === key
          ? { ...item, enabled: !item.enabled }
          : item
      )
    }
  };
}

function insertStage(platformConfig, workflowKey, stageName, afterStageName) {

  if (isLiveMode()) {
    return insertStageLocal(platformConfig, workflowKey, stageName, afterStageName);
  }

  return insertStageLocal(platformConfig, workflowKey, stageName, afterStageName);
}

function insertStageLocal(platformConfig, workflowKey, stageName, afterStageName) {

  const workflow = platformConfig.workflows.find((item) => item.key === workflowKey);

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
    ...platformConfig,
    workflows: platformConfig.workflows.map((item) =>
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

function publish(workflows) {
  return cloneData(workflows || platformConfigMock.workflows);
}

const workflowConfigurationRepository = {
  getAll,
  getById,
  create: insertStage,
  update: toggleWorkflow,
  publish,
  archive: publish,
  delete: publish,
  toggleWorkflow,
  insertStage
};

export default workflowConfigurationRepository;

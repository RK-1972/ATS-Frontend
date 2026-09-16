import { normalizeStage } from "@/enterprise/recruiterSelectors";

const FALLBACK_CATALOG = [
  { stage_id: 1, stage_code: "APPLIED", display_name: "Applied", sort_order: 10, is_terminal: false, is_active: true },
  { stage_id: 2, stage_code: "SCREENING", display_name: "Screening", sort_order: 20, is_terminal: false, is_active: true },
  { stage_id: 3, stage_code: "L1_INTERVIEW", display_name: "L1 Interview", sort_order: 30, is_terminal: false, is_active: true },
  { stage_id: 4, stage_code: "L2_INTERVIEW", display_name: "L2 Interview", sort_order: 40, is_terminal: false, is_active: true },
  { stage_id: 5, stage_code: "CLIENT_INTERVIEW", display_name: "Client Interview", sort_order: 50, is_terminal: false, is_active: true },
  { stage_id: 6, stage_code: "OFFER", display_name: "Offer", sort_order: 60, is_terminal: false, is_active: true },
  { stage_id: 7, stage_code: "JOINED", display_name: "Joined", sort_order: 70, is_terminal: true, is_active: true }
];

function getPipelineStageLabels(catalogStages = []) {
  return catalogStages.map((stage) => stage.display_name);
}

function buildEmptyStageCounts(pipelineStages = []) {
  return pipelineStages.reduce((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {});
}

function buildPipelineMetrics(catalogStages = [], pipeline = []) {
  const pipelineStages = getPipelineStageLabels(catalogStages);
  const stageCounts = buildEmptyStageCounts(pipelineStages);

  pipeline.forEach((row) => {
    const stage = normalizeStage(row.stage_name);
    if (stageCounts[stage] !== undefined) {
      stageCounts[stage] += 1;
    }
  });

  return pipelineStages.map((stage) => ({
    key: stage,
    label: stage,
    value: stageCounts[stage]
  }));
}

function buildStageSelectOptions(catalogStages = [], currentStageName = "") {
  const displayNames = catalogStages.map((stage) => stage.display_name);
  const options = catalogStages.map((stage) => ({
    value: stage.display_name,
    label: stage.display_name,
    disabled: false
  }));

  const current = String(currentStageName || "").trim();
  if (current && !displayNames.includes(current)) {
    options.unshift({
      value: current,
      label: `${current} (current, not in catalog)`,
      disabled: true
    });
  }

  return options;
}

function resolveNextStageDisplayName(currentStageName = "", catalogStages = []) {
  const orderedLabels = getPipelineStageLabels(catalogStages);
  const normalized = normalizeStage(currentStageName);
  const currentIndex = orderedLabels.findIndex(
    (label) => label === currentStageName || label === normalized
  );

  if (currentIndex >= 0 && currentIndex < orderedLabels.length - 1) {
    return orderedLabels[currentIndex + 1];
  }

  return null;
}

export {
  FALLBACK_CATALOG,
  getPipelineStageLabels,
  buildEmptyStageCounts,
  buildPipelineMetrics,
  buildStageSelectOptions,
  resolveNextStageDisplayName
};

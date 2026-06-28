import { auditRecordToTimelineEvent } from "./auditService";

const CHANNEL_KEY_MAP = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  teams: "Teams",
  in_app: "In-app"
};

const CANDIDATE_STAGE_KEY_MAP = {
  Applied: "applied",
  Screening: "screening",
  L1: "l1",
  L2: "l2",
  Client: "client",
  Offer: "offer",
  Joined: "joined"
};

function slugifyStageName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export function getEnabledChannelTypes(notificationChannels = []) {

  return notificationChannels
    .filter((channel) => channel.enabled)
    .map((channel) => CHANNEL_KEY_MAP[channel.key] || channel.title);

}

export function filterNotificationPreview(notification, enabledChannelTypes) {

  if (!notification) {
    return null;
  }

  const enabledSet = new Set(enabledChannelTypes);

  return {
    ...notification,
    channels: (notification.channels || []).filter(
      (channel) => enabledSet.has(channel.type)
    ),
    deliveries: (notification.deliveries || []).filter(
      (delivery) => enabledSet.has(delivery.channel)
    )
  };

}

export function filterStageNotifications(stageNotifications, enabledChannelTypes) {

  const filtered = {};

  Object.entries(stageNotifications || {}).forEach(([key, notification]) => {
    filtered[key] = filterNotificationPreview(notification, enabledChannelTypes);
  });

  return filtered;

}

export function buildIntegrationChain(platformConfig, businessRules, workforce) {

  const enabledModules = (platformConfig.modules || [])
    .filter((module) => module.enabled)
    .map((module) => module.title);

  const enabledChannels = getEnabledChannelTypes(platformConfig.notification_channels)
    .join(" · ");

  const activeRules = (businessRules.rules || [])
    .filter((rule) => rule.status === "Active")
    .slice(0, 2)
    .map((rule) => rule.name)
    .join(" · ");

  const publishedWorkflows = (platformConfig.workflows || [])
    .filter((workflow) => workflow.enabled)
    .map((workflow) => `${workflow.title.replace(" Workflow", "")} v${workflow.version}`)
    .join(" · ");

  const chain = [
    {
      module: "Platform Configuration",
      config: `${enabledModules.slice(0, 3).join(" · ")} modules active`
    },
    {
      module: "Business Rules Engine",
      config: activeRules || "No active rules"
    },
    {
      module: "Workflow Configuration",
      config: publishedWorkflows || "No workflows enabled"
    },
    {
      module: "Budget Governance",
      config: `${platformConfig.budget.max_budget_variance_pct}% variance · Finance escalation`
    },
    {
      module: "Notifications",
      config: enabledChannels || "No channels enabled"
    },
    {
      module: "AI Governance",
      config: platformConfig.modules.find((module) => module.key === "ai")?.enabled
        ? `Advisory · ${Math.round(platformConfig.ai_governance.confidence_threshold * 100)}% confidence threshold`
        : "AI module disabled"
    }
  ];

  if (platformConfig.modules.find((module) => module.key === "recruitment")?.enabled) {
    chain.push({
      module: "Recruitment",
      config: `${platformConfig.workflows.find((workflow) => workflow.key === "candidate")?.stages.length || 7}-stage pipeline active`
    });
  }

  if (platformConfig.modules.find((module) => module.key === "offer_management")?.enabled) {
    chain.push({
      module: "Offer Management",
      config: `${platformConfig.budget.approval_chain.length}-step approval chain`
    });
  }

  if (workforce?.approved_positions?.length) {
    chain.push({
      module: "Workforce Planning",
      config: `${workforce.approved_positions.length} approved positions in catalogue`
    });
  }

  return chain;

}

export function buildBusinessRuleDetails(rules, budgetThreshold) {

  const details = {};

  rules.forEach((rule) => {

    let condition = rule.conditions?.[0] || "";

    if (rule.name === "Offer Above Budget") {
      condition = `Offered CTC > Approved Budget by ${budgetThreshold}%`;
    }

    details[rule.name] = {
      category: rule.category,
      trigger: rule.trigger_event,
      condition,
      action: rule.actions?.join(" · ") || ""
    };

  });

  return details;

}

export function syncOfferAboveBudgetRule(rules, threshold) {

  return rules.map((rule) =>
    rule.id === "rule-001"
      ? {
          ...rule,
          conditions: [`Offered CTC > Approved Budget by ${threshold}%`]
        }
      : rule
  );

}

function createDynamicCandidateStage(stageName) {

  const key = `candidate_${slugifyStageName(stageName)}`;

  return {
    key,
    name: stageName,
    status: "Pending",
    owner: "Recruitment Team",
    responsible_role: "Recruiter",
    sla_hours: 48,
    sla_remaining_hours: 48,
    completion_pct: 0,
    is_approval_stage: false,
    business_rules: [],
    workflow: "Candidate Workflow",
    notifications: [`${stageName} — stage notification`],
    budget_validation: null,
    ai_recommendations: [],
    audit_summary: `${stageName} stage added from workflow configuration`
  };

}

export function mergeCandidateWorkflowStages(baseStages, candidateWorkflowStages) {

  if (!candidateWorkflowStages?.length) {
    return baseStages;
  }

  const pipelineStart = baseStages.findIndex((stage) => stage.key === "applied");
  const pipelineEnd = baseStages.findIndex((stage) => stage.key === "client");

  if (pipelineStart === -1 || pipelineEnd === -1) {
    return baseStages;
  }

  const prefix = baseStages.slice(0, pipelineStart);
  const suffix = baseStages.slice(pipelineEnd + 1);
  const existingPipeline = baseStages.slice(pipelineStart, pipelineEnd + 1);

  const existingByKey = Object.fromEntries(
    existingPipeline.map((stage) => [stage.key, stage])
  );

  const dynamicStages = candidateWorkflowStages.map((stageName) => {
    const mappedKey = CANDIDATE_STAGE_KEY_MAP[stageName];

    if (mappedKey && existingByKey[mappedKey]) {
      return existingByKey[mappedKey];
    }

    return createDynamicCandidateStage(stageName);
  });

  return [...prefix, ...dynamicStages, ...suffix];

}

export function buildHiringControlTowerData(state) {

  const {
    platformConfig,
    businessRules,
    workforce,
    hiringProcess,
    auditEvents
  } = state;

  const threshold = platformConfig.budget.max_budget_variance_pct;
  const enabledChannels = getEnabledChannelTypes(platformConfig.notification_channels);

  const variancePct = hiringProcess.budget.offered_ctc_lpa > 0
    ? Math.round(
        ((hiringProcess.budget.offered_ctc_lpa - hiringProcess.budget.approved_budget_lpa)
          / hiringProcess.budget.approved_budget_lpa) * 1000
      ) / 10
    : 0;

  const budgetStatus = variancePct > threshold
    ? "Exception Required"
    : "Within Budget";

  const primaryPosition = workforce.approved_positions.find(
    (position) => position.id === hiringProcess.linkedPositionId
  ) || workforce.approved_positions[0];

  const candidateWorkflow = platformConfig.workflows.find(
    (workflow) => workflow.key === "candidate"
  );

  const mergedStages = mergeCandidateWorkflowStages(
    hiringProcess.stages,
    candidateWorkflow?.enabled ? candidateWorkflow.stages : null
  );

  const stages = mergedStages.map((stage) => {

    if (stage.key === "approved_position" && primaryPosition) {
      return {
        ...stage,
        audit_summary: `Position ${primaryPosition.id} — ${primaryPosition.position} in approved catalogue`
      };
    }

    if (stage.key === "budget_validation") {
      return {
        ...stage,
        business_rules: ["Offer Above Budget"],
        budget_validation: {
          approved_budget_lpa: hiringProcess.budget.approved_budget_lpa,
          offered_ctc_lpa: hiringProcess.budget.offered_ctc_lpa,
          variance_pct: variancePct,
          threshold_pct: threshold,
          status: budgetStatus
        }
      };
    }

    return stage;

  });

  const processTimeline = [...hiringProcess.timeline];
  const auditTimeline = auditEvents.map(auditRecordToTimelineEvent);

  const timelineMap = new Map();

  [...processTimeline, ...auditTimeline].forEach((event) => {
    timelineMap.set(event.id, event);
  });

  const timeline = [...timelineMap.values()].sort(
    (a, b) => new Date(a.time) - new Date(b.time)
  );

  return {
    ...hiringProcess,
    meta: {
      ...hiringProcess.meta,
      linked_position_id: primaryPosition?.id || null,
      linked_position_title: primaryPosition?.position || hiringProcess.meta.position_title
    },
    integration_chain: buildIntegrationChain(platformConfig, businessRules, workforce),
    budget: {
      ...hiringProcess.budget,
      variance_pct: variancePct,
      variance_threshold_pct: threshold,
      status: budgetStatus,
      exception_workflow_triggered: variancePct > threshold
    },
    stages,
    timeline,
    business_rule_details: buildBusinessRuleDetails(
      businessRules.rules,
      threshold
    ),
    process_business_rules: businessRules.rules
      .filter((rule) => rule.status === "Active")
      .map((rule) => rule.name),
    stage_notifications: filterStageNotifications(
      hiringProcess.stage_notifications,
      enabledChannels
    ),
    kpis: {
      ...hiringProcess.kpis,
      budget_exceptions: workforce.budget_exceptions.filter(
        (item) => item.workflow_status.includes("Pending")
      ).length
    }
  };

}

export { CHANNEL_KEY_MAP, CANDIDATE_STAGE_KEY_MAP };

import {
  Box,
  Grid,
  Chip,
  Typography,
  Stack
} from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigMetricSlab from "../../components/platform-config/ConfigMetricSlab";
import IntegrationTraceBar from "../../components/hiring-control-tower/IntegrationTraceBar";
import EnterpriseProcessTimeline from "../../components/hiring-control-tower/EnterpriseProcessTimeline";
import StageInspectorPanel from "../../components/hiring-control-tower/StageInspectorPanel";
import ApprovalTimelinePanel from "../../components/hiring-control-tower/ApprovalTimelinePanel";
import NotificationPreviewPanel from "../../components/hiring-control-tower/NotificationPreviewPanel";
import BudgetValidationPanel from "../../components/hiring-control-tower/BudgetValidationPanel";

function SectionLabel({ children }) {

  return (
    <Typography
      variant="overline"
      color="text.secondary"
      fontWeight={700}
      sx={{ letterSpacing: 0.8, mb: 0.75, display: "block" }}
    >
      {children}
    </Typography>
  );

}

function HiringControlTowerPage({ towerState }) {

  const {
    data,
    selectedStageKey,
    selectedStage,
    showClarificationForm,
    clarificationDraft,
    stageNotifications,
    sortedTimeline,
    stageTimeline,
    setSelectedStageKey,
    setShowClarificationForm,
    approveStage,
    rejectStage,
    requestClarification,
    sendClarification,
    submitClarification,
    updateClarificationDraft
  } = towerState;

  const { meta, kpis, budget } = data;

  return (

    <>

      <ConfigPageHeader
        title="Hiring Control Tower"
        subtitle="Executive operations console — end-to-end hiring lifecycle with integrated governance."
        breadcrumbs={[{ label: "Hiring Control Tower" }]}
        statusChip={
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip
              label={meta.process_id}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${meta.position_title} · ${meta.grade}`}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        }
      />

      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
        {meta.department} · {meta.requisition_id} · {meta.candidate_name}
      </Typography>

      <Box mb={2.5}>
        <SectionLabel>Executive KPIs</SectionLabel>
        <ConfigMetricSlab
          metrics={[
            { key: "active", value: String(kpis.active_hiring_processes), label: "Active Processes" },
            { key: "pending", value: String(kpis.pending_approvals), label: "Pending Approvals" },
            { key: "clarification", value: String(kpis.clarification_requests), label: "Clarifications" },
            { key: "exceptions", value: String(kpis.budget_exceptions), label: "Budget Exceptions" },
            { key: "sla", value: `${kpis.avg_approval_sla_hours}h`, label: "Avg Approval SLA" },
            { key: "tth", value: `${kpis.avg_time_to_hire_days}d`, label: "Avg Time To Hire" },
            { key: "workload", value: String(kpis.recruiter_workload), label: "Recruiter Workload" }
          ]}
          highlightKey="pending"
        />
      </Box>

      <Box mb={2.5}>
        <IntegrationTraceBar chain={data.integration_chain} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          mb: 2.5,
          alignItems: "stretch"
        }}
      >

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionLabel>Hiring Lifecycle</SectionLabel>
          <EnterpriseProcessTimeline
            stages={data.stages}
            selectedKey={selectedStageKey}
            onSelect={setSelectedStageKey}
          />
        </Box>

        <Box
          sx={{
            width: { xs: "100%", lg: 350 },
            flexShrink: 0
          }}
        >
          <SectionLabel>Inspector</SectionLabel>
          <StageInspectorPanel
            stage={selectedStage}
            stageNotifications={stageNotifications}
            stageTimeline={stageTimeline}
            businessRuleDetails={data.business_rule_details}
            processBusinessRules={data.process_business_rules}
            budget={budget}
            showClarificationForm={showClarificationForm}
            clarificationDraft={clarificationDraft}
            onApprove={approveStage}
            onReject={rejectStage}
            onRequestClarification={requestClarification}
            onSendClarification={sendClarification}
            onSubmitClarification={submitClarification}
            onUpdateClarification={updateClarificationDraft}
            onCancelClarification={() => setShowClarificationForm(false)}
          />
        </Box>

      </Box>

      <Grid container spacing={2} mb={2.5}>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionLabel>Activity</SectionLabel>
          <ApprovalTimelinePanel events={sortedTimeline} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionLabel>Notifications</SectionLabel>
          <NotificationPreviewPanel notification={stageNotifications} />
        </Grid>

      </Grid>

      <Box>
        <SectionLabel>Budget</SectionLabel>
        <BudgetValidationPanel
          budget={budget}
          approvalPath={data.budget_approval_path}
        />
      </Box>

    </>

  );

}

export default HiringControlTowerPage;

import {
  Box,
  Grid,
  Chip,
  Typography,
  Stack,
  Alert
} from "@mui/material";import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import IntegrationTraceBar from "../../components/hiring-control-tower/IntegrationTraceBar";
import ExecutiveKpiSlab from "../../components/hiring-control-tower/ExecutiveKpiSlab";
import EnterpriseProcessTimeline, {
  HCT_LIFECYCLE_PANEL_FALLBACK_HEIGHT
} from "../../components/hiring-control-tower/EnterpriseProcessTimeline";
import StageInspectorPanel from "../../components/hiring-control-tower/StageInspectorPanel";
import ApprovalTimelinePanel from "../../components/hiring-control-tower/ApprovalTimelinePanel";
import NotificationPreviewPanel from "../../components/hiring-control-tower/NotificationPreviewPanel";
import BudgetValidationPanel from "../../components/hiring-control-tower/BudgetValidationPanel";
import RequisitionSelector from "../../components/hiring-control-tower/RequisitionSelector";

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

function formatHeaderValue(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "—";
  }

  return String(value);
}

function HiringControlTowerPage({ towerState }) {

  const {
    data,
    selectedStage,
    showClarificationForm,
    clarificationDraft,
    stageNotifications,
    sortedTimeline,
    stageTimeline,
    setShowClarificationForm,
    approveStage,
    rejectStage,
    requestClarification,
    sendClarification,
    submitClarification,
    updateClarificationDraft,
    liveModeEnabled,
    selectedRequisition,
    requisitionSearchOptions,
    searchLoading,
    headerLoading,
    searchError,
    headerError,
    displayHeader,
    lifecycleStages,
    lifecycleSummary,
    lifecycleMetadata,
    lifecycleLoading,
    lifecycleError,
    lifecycleSelectedKey,
    setLifecycleSelectedKey,
    stageInspectorData,
    stageInspectorLoading,
    stageInspectorError,
    kpiData,
    kpiLoading,
    kpiError,
    handleRequisitionSearch,
    handleRequisitionSelect
  } = towerState;

  const { budget } = data;
  const headerReady = !displayHeader.isEmpty;

  const lifecycleEmptyMessage = liveModeEnabled
    ? "Search and select a requisition to view the real hiring lifecycle."
    : "Live API required to load the hiring lifecycle.";

  const primaryChipLabel = headerReady
    ? formatHeaderValue(displayHeader.requisition_code)
    : "Select a requisition";

  const secondaryChipLabel = headerReady
    ? `${formatHeaderValue(displayHeader.position_title)} · ${formatHeaderValue(displayHeader.grade)}`
    : liveModeEnabled
      ? "Choose a requisition to view details"
      : "Live API required";

  const captionLabel = headerReady
    ? [
      formatHeaderValue(displayHeader.department),
      formatHeaderValue(displayHeader.req_status),
      formatHeaderValue(displayHeader.hiring_manager)
    ].join(" · ")
    : liveModeEnabled
      ? "Search and select a requisition to populate the executive header."
      : "Connect to the live API to search real requisitions.";

  const workspaceHeight = HCT_LIFECYCLE_PANEL_FALLBACK_HEIGHT;

  return (

    <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>

      <ConfigPageHeader
        title="Hiring Control Tower"
        subtitle="Executive operations console — end-to-end hiring lifecycle with integrated governance."
      />

      <Box mb={2} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <SectionLabel>Executive KPIs</SectionLabel>
        <ExecutiveKpiSlab
          kpiData={kpiData}
          loading={kpiLoading}
          error={kpiError}
          liveModeEnabled={liveModeEnabled}
        />
      </Box>

      <Box mb={2} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <SectionLabel>Requisition</SectionLabel>

        <RequisitionSelector
          options={requisitionSearchOptions}
          selected={selectedRequisition}
          loading={searchLoading || headerLoading}
          searchError={searchError}
          disabled={!liveModeEnabled}
          disabledMessage="Live API required for requisition lookup."
          hideFieldLabel
          onSearch={handleRequisitionSearch}
          onSelect={handleRequisitionSelect}
        />

        {headerError ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            {headerError}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
          <Chip
            label={primaryChipLabel}
            color={headerReady ? "primary" : "default"}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={secondaryChipLabel}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block">
          {captionLabel}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "minmax(0, 1fr) minmax(0, 350px)"
          },
          gap: 2,
          mb: 2,
          alignItems: { lg: "start" },
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "hidden"
        }}
      >

        <Box sx={{ minWidth: 0, maxWidth: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SectionLabel>Hiring Lifecycle</SectionLabel>
          <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
            <EnterpriseProcessTimeline
              stages={lifecycleStages}
              selectedKey={lifecycleSelectedKey}
              onSelect={setLifecycleSelectedKey}
              loading={Boolean(selectedRequisition?.requisition_code) && lifecycleLoading}
              error={lifecycleError && !lifecycleLoading ? lifecycleError : ""}
              emptyMessage={lifecycleEmptyMessage}
              lifecycleSummary={lifecycleSummary}
              lifecycleMetadata={lifecycleMetadata}
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0
          }}
        >
          <SectionLabel>Inspector</SectionLabel>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: workspaceHeight,
              maxHeight: workspaceHeight,
              width: "100%"
            }}
          >
            <StageInspectorPanel
            liveModeEnabled={liveModeEnabled}
            lifecycleSelectedKey={lifecycleSelectedKey}
            stageInspectorData={stageInspectorData}
            stageInspectorLoading={stageInspectorLoading}
            stageInspectorError={stageInspectorError}
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

      </Box>

      <Box mb={2.5} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <IntegrationTraceBar chain={data.integration_chain} />
      </Box>

      <Grid container spacing={2} mb={2.5} sx={{ minWidth: 0, maxWidth: "100%" }}>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionLabel>Activity</SectionLabel>
          <ApprovalTimelinePanel events={sortedTimeline} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionLabel>Notifications</SectionLabel>
          <NotificationPreviewPanel notification={stageNotifications} />
        </Grid>

      </Grid>

      <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
        <SectionLabel>Budget</SectionLabel>
        <BudgetValidationPanel
          budget={budget}
          approvalPath={data.budget_approval_path}
        />
      </Box>

    </Box>

  );

}

export default HiringControlTowerPage;

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { MdSwapHoriz } from "react-icons/md";
import { LoadingState, EnterpriseModuleIcon } from "@/components/enterprise";
import RecruiterCockpitHeader from "@/components/recruiter-home/RecruiterCockpitHeader";
import CockpitSummaryCards from "@/components/recruiter-home/CockpitSummaryCards";
import CockpitActionsNeededPanel from "@/components/recruiter-home/CockpitActionsNeededPanel";
import CockpitQuickActionsPanel from "@/components/recruiter-home/CockpitQuickActionsPanel";
import CockpitInspectorPanel from "@/components/recruiter-home/CockpitInspectorPanel";
import CockpitRequisitionsTable from "@/components/recruiter-home/CockpitRequisitionsTable";
import CockpitRequisitionSidebar from "@/components/recruiter-home/CockpitRequisitionSidebar";
import { DESIGN, PANEL_SHELL, ROW_INTERACTIVE, WORKBENCH_GAP } from "@/components/recruiter-home/recruiterHomeTokens";
import { buildRecruiterHomeModel, enrichCandidateForInspector } from "./recruiterHomeViewModel";
import { fetchRecruiterCockpitDashboard } from "./recruiterHomeApi";
import {
  DATE_PRESETS,
  defaultCockpitRange,
  presetToRange
} from "./recruiterHomeDateFilter";
import { useCopilotContext } from "@/components/copilot/CopilotContext";

function RecruiterHomePage() {
  const navigate = useNavigate();
  const { setCurrentPage } = useCopilotContext();
  const initialRange = defaultCockpitRange();

  useEffect(() => {
    setCurrentPage("Dashboard");
  }, [setCurrentPage]);

  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(initialRange.preset);
  const [fromDate, setFromDate] = useState(initialRange.fromDate);
  const [toDate, setToDate] = useState(initialRange.toDate);
  const [draftFromDate, setDraftFromDate] = useState(initialRange.fromDate);
  const [draftToDate, setDraftToDate] = useState(initialRange.toDate);
  const [cockpitData, setCockpitData] = useState(null);

  const [selectedReqId, setSelectedReqId] = useState(null);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [interviewsTodayOnly, setInterviewsTodayOnly] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);

  const loadDashboard = useCallback(async ({ fromDate: from, toDate: to }) => {
    setLoading(true);
    try {
      const data = await fetchRecruiterCockpitDashboard({ fromDate: from, toDate: to });
      setCockpitData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard({ fromDate, toDate });
  }, [fromDate, toDate, loadDashboard]);

  const handlePresetChange = (preset) => {
    const range = presetToRange(preset);
    setActivePreset(range.preset);
    setFromDate(range.fromDate);
    setToDate(range.toDate);
    setDraftFromDate(range.fromDate);
    setDraftToDate(range.toDate);
  };

  const handleDraftFromChange = (value) => {
    setDraftFromDate(value);
    setActivePreset(null);
  };

  const handleDraftToChange = (value) => {
    setDraftToDate(value);
    setActivePreset(null);
  };

  const handleApply = () => {
    if (!draftFromDate || !draftToDate) return;
    setFromDate(draftFromDate);
    setToDate(draftToDate);
  };

  const handleReset = () => {
    handlePresetChange(DATE_PRESETS.last30);
  };

  const recruitment = cockpitData?.recruitment || {};
  const taskInbox = cockpitData?.taskInbox || {};
  const interviews = cockpitData?.interviews || {};

  const model = useMemo(
    () => buildRecruiterHomeModel({
      recruitment,
      taskInbox,
      interviews,
      fromDate,
      toDate,
      interviewsTodayOnly
    }),
    [recruitment, taskInbox, interviews, fromDate, toDate, interviewsTodayOnly]
  );

  const selectedRequisition = model.requisitionRows.find((r) => r.id === selectedReqId) || null;
  const selectedAction = model.actionItems.find((a) => a.id === selectedActionId) || null;

  const selectedCandidate = useMemo(() => {
    if (selectedCandidateId) {
      return model.filteredCandidates.find((c) => c.id === selectedCandidateId)
        || selectedRequisition?.topCandidates?.find((c) => c.id === selectedCandidateId)
        || null;
    }
    return null;
  }, [selectedCandidateId, model.filteredCandidates, selectedRequisition]);

  const enrichedCandidateForInspector = useMemo(
    () => enrichCandidateForInspector(selectedCandidate, recruitment, interviews, taskInbox),
    [selectedCandidate, recruitment, interviews, taskInbox]
  );

  const actionItemsDisplay = showAllActions ? model.actionItems : model.actionItems;

  const handleReqSelect = (row) => {
    setSelectedReqId(row.id);
    setSelectedActionId(null);
    setSelectedCandidateId(null);
  };

  const handleActionSelect = (item) => {
    setSelectedActionId(item.id);
    setSelectedReqId(null);
    setSelectedCandidateId(null);
    const pipelineRow = (recruitment.activePipeline || recruitment.pipeline || []).find((p) =>
      p.candidate_name === item.title || p.requisition_code === item.detail
    );
    if (pipelineRow) {
      setSelectedCandidateId(pipelineRow.mapping_id || pipelineRow.map_id);
    }
  };

  const handleSidebarCandidateSelect = (candidate) => {
    setSelectedCandidateId(candidate.id);
    setSelectedActionId(null);
  };

  const handleShowInterviewsToday = () => {
    setInterviewsTodayOnly((prev) => !prev);
    setSelectedActionId(null);
    setSelectedReqId(null);
    setSelectedCandidateId(null);
  };

  useEffect(() => {
    if (!selectedReqId && model.requisitionRows.length > 0) {
      setSelectedReqId(model.requisitionRows[0].id);
    }
  }, [model.requisitionRows, selectedReqId]);

  useEffect(() => {
    if (!selectedCandidateId) return;

    const inFilteredPool = model.filteredCandidates.some((c) => c.id === selectedCandidateId);
    const inTopCandidates = model.requisitionRows.some((req) =>
      req.topCandidates?.some((c) => c.id === selectedCandidateId)
    );

    if (inFilteredPool || inTopCandidates) return;

    const fallback = model.priorityCandidate
      || model.filteredCandidates[0]
      || model.requisitionRows.find((r) => r.id === selectedReqId)?.topCandidates?.[0]
      || null;

    setSelectedCandidateId(fallback?.id || null);
    if (!fallback) {
      setSelectedActionId(null);
    }
  }, [
    model.filteredCandidates,
    model.priorityCandidate,
    model.requisitionRows,
    selectedCandidateId,
    selectedReqId
  ]);

  if (loading && !cockpitData) {
    return <LoadingState message="Loading recruiter cockpit…" variant="gridSkeleton" rows={4} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        maxHeight: "calc(100vh - 64px)",
        overflow: "hidden"
      }}
    >
      <RecruiterCockpitHeader
        activePreset={activePreset}
        draftFromDate={draftFromDate}
        draftToDate={draftToDate}
        onPresetChange={handlePresetChange}
        onDraftFromChange={handleDraftFromChange}
        onDraftToChange={handleDraftToChange}
        onApply={handleApply}
        onReset={handleReset}
      />

      {/* TEMP: SPA navigation probe — remove after verification */}
      <Button
        size="small"
        variant="outlined"
        onClick={() => navigate("/candidate-intake")}
        sx={{ alignSelf: "flex-start", mb: 1, textTransform: "none" }}
      >
        Open Candidate Intake
      </Button>

      <CockpitSummaryCards
        totalCandidates={model.totalCandidates}
        openRequisitions={model.openRequisitions}
        interviewsTodayCount={model.interviewsTodayCount}
        pendingFeedbackCount={model.pendingFeedbackCount}
        offersInPipeline={model.offersInPipeline}
      />

      <Box
        onClick={() => navigate("/recruiter/ownership-requests")}
        sx={{
          ...PANEL_SHELL,
          ...ROW_INTERACTIVE,
          px: 1.5,
          py: 1.25,
          mb: 1,
          flexShrink: 0,
          cursor: "pointer"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <EnterpriseModuleIcon
            icon={MdSwapHoriz}
            module="approvals"
            density="sm"
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: DESIGN.textPrimary, lineHeight: 1.2 }}>
              Ownership Requests
            </Typography>
            <Typography sx={{ fontSize: 11, color: DESIGN.textMuted, mt: 0.35 }}>
              Review pending ownership transfer requests.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: WORKBENCH_GAP, flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: WORKBENCH_GAP, overflow: "hidden" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.85fr 1fr" },
              gap: WORKBENCH_GAP,
              flexShrink: 0,
              minHeight: 280,
              maxHeight: 340
            }}
          >
            <CockpitActionsNeededPanel
              items={actionItemsDisplay}
              selectedId={selectedActionId}
              onSelect={handleActionSelect}
              criticalCount={model.criticalCount}
              onViewAll={() => setShowAllActions(true)}
              expanded={showAllActions}
            />
            <CockpitQuickActionsPanel
              onNavigate={navigate}
              onShowInterviewsToday={handleShowInterviewsToday}
              interviewsTodayActive={interviewsTodayOnly}
            />
            <CockpitInspectorPanel
              requisition={selectedRequisition && !selectedCandidate && !selectedAction ? selectedRequisition : null}
              actionItem={selectedAction}
              selectedCandidate={enrichedCandidateForInspector}
              priorityCandidate={model.priorityCandidate}
              enrichedPriority={model.enrichedPriorityCandidate}
              onNavigate={navigate}
            />
          </Box>

          <CockpitRequisitionsTable
            rows={model.requisitionRows}
            selectedId={selectedReqId}
            onSelect={handleReqSelect}
            onViewAll={() => navigate("/requisitions")}
          />
        </Box>

        <CockpitRequisitionSidebar
          requisition={selectedRequisition}
          onNavigate={navigate}
          onSelectCandidate={handleSidebarCandidateSelect}
        />
      </Box>
    </Box>
  );
}

export default RecruiterHomePage;

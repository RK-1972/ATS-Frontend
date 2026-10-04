import CandidateAssignmentDialog
from "@/components/candidate-workspace/CandidateAssignmentDialog";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useOutletContext } from "react-router-dom";

import { Box, Stack, Tab, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  ErrorState,
  LoadingState,
  StatusChip,
  WorkspaceHeader,
  EnterpriseTabs
} from "@/components/enterprise";
import { WORKSPACE_TABS } from "@/enterprise/candidateWorkspaceUtils";
import PersonIdentityText from "@/components/candidate-workspace/PersonIdentityText";
import { useCopilotContext } from "@/components/copilot/CopilotContext";

import CandidateHeroCard from "@/components/candidate-workspace/CandidateHeroCard";
import CandidateAiInsightsPanel from "@/components/candidate-workspace/CandidateAiInsightsPanel";
import CandidateWorkspaceFab from "@/components/candidate-workspace/CandidateWorkspaceFab";
import CandidateWorkspaceToolbar from "@/components/candidate-workspace/CandidateWorkspaceToolbar";

import CandidateOverviewPanel from "@/components/candidate-workspace/panels/CandidateOverviewPanel";
import CandidatePersonalPanel from "@/components/candidate-workspace/panels/CandidatePersonalPanel";
import CandidateEmploymentPanel from "@/components/candidate-workspace/panels/CandidateEmploymentPanel";
import CandidateSkillsPanel from "@/components/candidate-workspace/panels/CandidateSkillsPanel";
import CandidateEducationPanel from "@/components/candidate-workspace/panels/CandidateEducationPanel";
import CandidateExperiencePanel from "@/components/candidate-workspace/panels/CandidateExperiencePanel";
import CandidateDocumentsPanel from "@/components/candidate-workspace/panels/CandidateDocumentsPanel";
import CandidateNotesPanel from "@/components/candidate-workspace/panels/CandidateNotesPanel";
import CandidateTimelinePanel from "@/components/candidate-workspace/panels/CandidateTimelinePanel";
import CandidateRecentActivitySection from "@/components/candidate-workspace/CandidateRecentActivitySection";
import CandidateAssignmentCard from "@/components/candidate-workspace/CandidateAssignmentCard";
import CandidateOwnershipCard from "@/components/candidate-workspace/CandidateOwnershipCard";
import CandidateOwnershipDialog from "@/components/candidate-workspace/CandidateOwnershipDialog";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import CandidateDraftRegisterPanel from "@/components/candidate-workspace/CandidateDraftRegisterPanel";
import candidateRepository from "@/repositories/candidateRepository";
import useEnterpriseStore from "@/store/enterpriseStore";
import { buildEntityAuditEvents } from "@/enterprise/recruiterSelectors.wave2";

function CandidateWorkspacePage() {
  const navigate = useNavigate();
  const workspace = useOutletContext();
  const theme = useTheme();
  const isDesktopSidebar = useMediaQuery(theme.breakpoints.up("md"));
  const { setCurrentCandidate } = useCopilotContext();
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openExperienceDialog, setOpenExperienceDialog] = useState(false);
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [returnPoolDialogOpen, setReturnPoolDialogOpen] = useState(false);
  const [returnPoolLoading, setReturnPoolLoading] = useState(false);
  const [timelineView, setTimelineView] = useState("activity");
  const auditEvents = useEnterpriseStore((state) => state.auditEvents);
  const {
    candidate,
    mapping,
    candidates,
    profile,
    displayName,
    profileCompletion,
    profileCompletionBreakdown,
    skillChips,
    skills,
    addSkillsBatch,
    updateSkill,
    deleteSkill,
    timelineEvents,
    masterLabels,
    masterData,
    activeTab,
    setActiveTab,
    aiPanelOpen,
    setAiPanelOpen,
    assignmentDialogOpen,
    setAssignmentDialogOpen,
    isLoadingProfile,
    isSaving,
    error,
    showToast,
    saveCandidate,
    mapCandidateToRequisition,
    localNotes,
    setLocalNotes,
    triggerResumeUpload,
    ownerDisplayName,
    isOwner,
    pendingRequest,
    requestOwnership,
    loadCandidates,
    loadProfile,
    candidateId,
    sidebarOperationalMount
  } = workspace;

  useEffect(() => {
    if (!candidate?.candidate_id) {
      return undefined;
    }

    const mappingRow = mapping || profile?.mapping || {};

    setCurrentCandidate({
      id: candidate.candidate_id,
      candidateCode: candidate.candidate_code || "",
      candidateName: displayName || "",
      mapId: mappingRow.map_id ?? null,
      reqId: mappingRow.req_id ?? null
    });

    return () => {
      setCurrentCandidate(null);
    };
  }, [
    candidate?.candidate_id,
    candidate?.candidate_code,
    displayName,
    mapping,
    profile?.mapping,
    setCurrentCandidate
  ]);

  const activeAssignmentMapping = useMemo(() => {
    const profileMapping = profile?.mapping || mapping || {};

    if (profileMapping.req_id) {
      return profileMapping;
    }

    const pipelineCandidate = (candidates || []).find(
      (row) => String(row.candidate_id) === String(candidate?.candidate_id)
    );

    if (pipelineCandidate?.req_code) {
      return {
        ...profileMapping,
        req_id: profileMapping.req_id || pipelineCandidate.req_code,
        req_code: profileMapping.req_code || pipelineCandidate.req_code,
        stage_name: profileMapping.stage_name || pipelineCandidate.stage_name,
        source_type: profileMapping.source_type || pipelineCandidate.source_type,
        applied_date: profileMapping.applied_date || pipelineCandidate.applied_date,
        recruiter_id: profileMapping.recruiter_id || pipelineCandidate.recruiter_id
      };
    }

    return profileMapping;
  }, [profile?.mapping, mapping, candidates, candidate?.candidate_id]);

  const candidateAuditEvents = useMemo(() => {
    const scoped = buildEntityAuditEvents(auditEvents, {
      requisitionCode:
        activeAssignmentMapping?.req_code || String(activeAssignmentMapping?.req_id || ""),
      candidateMapId: mapping?.map_id
    });

    const candidateId = String(candidate?.candidate_id || "");
    const candidateCode = String(candidate?.candidate_code || "");
    const seen = new Set(scoped.map((event) => event.id));

    const extra = (Array.isArray(auditEvents) ? auditEvents : [])
      .filter((event) => {
        const entityId = String(event.entityId || "");
        if (candidateId && entityId === candidateId) {
          return true;
        }
        if (candidateCode && entityId === candidateCode) {
          return true;
        }
        const meta = event.metadata || {};
        return String(meta.candidateId || meta.candidate_id || "") === candidateId;
      })
      .map((event) => ({
        id: event.id || event.correlationId,
        title: event.action || event.eventType,
        subtitle: [event.entity, event.entityId].filter(Boolean).join(" · "),
        timestamp: event.timestamp
          ? new Date(event.timestamp).toLocaleString()
          : event.created_on
            ? new Date(event.created_on).toLocaleString()
            : null
      }))
      .filter((event) => event.id && !seen.has(event.id));

    return [...scoped, ...extra];
  }, [
    auditEvents,
    activeAssignmentMapping?.req_code,
    activeAssignmentMapping?.req_id,
    mapping?.map_id,
    candidate?.candidate_id,
    candidate?.candidate_code
  ]);

  const handleWorkspaceAction = useCallback(
    (actionKey, payload) => {
      if (actionKey === "download-resume" || (actionKey === "download" && payload?.filePath)) {
        const url = payload?.filePath || candidate.resume_path;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
        return;
      }

      if (actionKey === "preview" && payload?.filePath) {
        window.open(payload.filePath, "_blank", "noopener,noreferrer");
        return;
      }

      if (actionKey === "upload-resume" || actionKey === "replace") {
        triggerResumeUpload();
        return;
      }

      if (actionKey === "schedule-interview") {
        const reqId = activeAssignmentMapping?.req_id;
        const mapId = activeAssignmentMapping?.map_id;

        if (!reqId || !mapId) {
          showToast(
            "Map the candidate to a requisition before scheduling an interview.",
            "warning"
          );
          return;
        }

        navigate("/interview-schedule", {
          state: {
            req_id: Number(reqId),
            map_id: Number(mapId)
          }
        });
        return;
      }

      if (actionKey === "add-skill") {
        setActiveTab("skills");
        setOpenSkillDialog(true);
        return;
      }

      if (actionKey === "add-experience") {
        setActiveTab("experience");
        setOpenExperienceDialog(true);
        return;
      }

      if (actionKey === "add-note") {
        setActiveTab("notes");
        return;
      }

      if (actionKey === "map-requisition") {

    console.log("Assign Requisition Clicked");

    setAssignmentDialogOpen(true);

    return;

}

if (
[
"add-education",
"upload-document"
].includes(actionKey)
) {
        showToast(`${actionKey.replace(/-/g, " ")} — coming soon in workspace actions.`, "info");
        return;
      }

      showToast(`${actionKey.replace(/-/g, " ")} action triggered.`, "info");
    },
    [
      activeAssignmentMapping?.req_id,
      activeAssignmentMapping?.map_id,
      candidate.resume_path,
      navigate,
      setActiveTab,
      showToast,
      triggerResumeUpload
    ]
  );

  const handleToolbarOverflow = useCallback(
    (action) => {
      if (action === "history") {
        setTimelineView("activity");
        setActiveTab("timeline");
        return;
      }

      if (action === "audit") {
        setTimelineView("audit");
        setActiveTab("timeline");
      }
    },
    [setActiveTab]
  );

  const handleSaveNotes = useCallback(
    async (notes) => {
      setLocalNotes(notes);
      if (notes.recruiter !== undefined) {
        await saveCandidate({ remarks: notes.recruiter });
      } else {
        showToast("Notes saved locally", "success");
      }
    },
    [saveCandidate, setLocalNotes, showToast]
  );

  const handleCloseReleaseDialog = () => {
    setReleaseDialogOpen(false);
  };

  const handleCloseReturnPoolDialog = () => {
    setReturnPoolDialogOpen(false);
  };

  const handleConfirmRelease = async () => {
    if (!candidate?.candidate_id) {
      return;
    }

    setReleaseLoading(true);

    try {
      await candidateRepository.releaseCandidateMapping(candidate.candidate_id);

      setReleaseDialogOpen(false);

      await workspace.loadCandidates();
      await workspace.loadProfile(candidate.candidate_id);
    } catch (releaseError) {
      showToast(
        releaseError.message || "Failed to release candidate mapping.",
        "error"
      );
    } finally {
      setReleaseLoading(false);
    }
  };

  const handleConfirmReturnToTalentPool = async () => {
    if (!candidate?.candidate_id) {
      return;
    }

    setReturnPoolLoading(true);

    try {
      await candidateRepository.returnCandidateToTalentPool(candidate.candidate_id);

      setReturnPoolDialogOpen(false);

      await workspace.loadCandidates();
      await workspace.loadProfile(candidate.candidate_id);
    } catch (returnError) {
      showToast(
        returnError.message || "Failed to return candidate to Talent Pool.",
        "error"
      );
    } finally {
      setReturnPoolLoading(false);
    }
  };

  const clearSidebarOperational =
    isDesktopSidebar && sidebarOperationalMount
      ? createPortal(<Box aria-hidden sx={{ display: "none" }} />, sidebarOperationalMount)
      : null;

  if (isLoadingProfile) {
    return (
      <>
        {clearSidebarOperational}
        <LoadingState message="Loading candidate workspace..." />
      </>
    );
  }

  if (error && !candidate?.candidate_id) {
    return (
      <>
        {clearSidebarOperational}
        <ErrorState title="Unable to load candidate" message={error} />
      </>
    );
  }

  const tabPanel = (() => {
    switch (activeTab) {
      case "personal":
        return (
          <CandidatePersonalPanel
            candidate={candidate}
            masterData={masterData}
            onSave={saveCandidate}
            isSaving={isSaving}
          />
        );
      case "employment":
        return (
          <CandidateEmploymentPanel
            candidate={candidate}
            masterData={masterData}
            masterLabels={masterLabels}
            onSave={saveCandidate}
            isSaving={isSaving}
          />
        );
      case "skills":
        return (
          <CandidateSkillsPanel
            skills={skills}
            masterData={masterData}
            onAddSkillsBatch={addSkillsBatch}
            onUpdateSkill={updateSkill}
            onDeleteSkill={deleteSkill}
            isSaving={isSaving}
            onOpenAddDialog={() => setOpenSkillDialog(true)}
            forceOpenDialog={openSkillDialog}
            onDialogClose={() => setOpenSkillDialog(false)}
          />
        );
      case "education":
        return (
          <CandidateEducationPanel
            candidateId={candidate.candidate_id}
          />
        );
      case "experience":
        return (
          <CandidateExperiencePanel
            candidate={candidate}
            experience={profile.children.experience}
            forceOpenDialog={openExperienceDialog}
            onDialogClose={() => setOpenExperienceDialog(false)}
          />
        );
      case "documents":
        return (
          <CandidateDocumentsPanel
            candidate={candidate}
            documents={profile.children.document}
            masterData={masterData}
            onAction={(action, doc) => handleWorkspaceAction(action, doc)}
          />
        );
      case "notes":
        return (
          <CandidateNotesPanel
            candidate={candidate}
            notes={profile.children.notes}
            mapping={mapping}
            localNotes={localNotes}
            onSaveNotes={handleSaveNotes}
            isSaving={isSaving}
          />
        );
      case "timeline":
        return (
          <CandidateTimelinePanel
            events={timelineEvents}
            view={timelineView}
            auditEvents={candidateAuditEvents}
          />
        );
      default:
        return (
          <CandidateOverviewPanel
            candidate={candidate}
            mapping={mapping}
            masterLabels={masterLabels}
            profileCompletion={profileCompletion}
            profileCompletionBreakdown={profileCompletionBreakdown}
          />
        );
    }
  })();

  const operationalSections = (
    <Stack spacing={1.5} sx={{ p: 1.5, minWidth: 0 }}>
      <CandidateOwnershipCard
        ownerDisplayName={ownerDisplayName}
        isOwner={isOwner}
        pendingRequest={pendingRequest}
        mapping={activeAssignmentMapping}
        candidateContainer={candidate?.candidate_container}
        ownerEmployeeCode={candidate?.owner_employee_code}
        onRequestOwnership={() => setOwnershipDialogOpen(true)}
        onMapRequisition={() => handleWorkspaceAction("map-requisition")}
        onReturnToTalentPool={() => setReturnPoolDialogOpen(true)}
      />
      <CandidateAssignmentCard
        candidate={candidate}
        mapping={activeAssignmentMapping}
        isOwner={isOwner}
        onAssign={() => handleWorkspaceAction("map-requisition")}
        onRelease={() => setReleaseDialogOpen(true)}
      />
    </Stack>
  );

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
        width: "100%",
        pb: { xs: 12, sm: 10 }
      }}
    >
      <WorkspaceHeader
        dense
        title={
          <PersonIdentityText
            candidate={candidate}
            noWrap
            primarySx={{
              ...theme.tokens.typography.pageTitle,
              color: "text.primary"
            }}
            idSx={{ fontSize: theme.tokens.typography.secondary.fontSize }}
          />
        }
        subtitle="Candidate Workspace"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Recruitment" },
          { label: "Candidates" },
          { label: "Candidate Workspace" }
        ]}
        statusChip={<StatusChip status={masterLabels.status} variant="soft" size="small" />}
        actions={
          <CandidateWorkspaceToolbar
            profileCompletion={profileCompletion}
            onSave={() => saveCandidate()}
            isSaving={isSaving}
            onOverflowAction={handleToolbarOverflow}
          />
        }
      />

      <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
          <CandidateDraftRegisterPanel
            candidate={candidate}
            onRegistered={async (updatedCandidate) => {
              const activeCandidateId =
                updatedCandidate?.candidate_id ||
                candidate?.candidate_id ||
                candidateId;

              if (activeCandidateId) {
                await loadProfile(activeCandidateId);
              }

              await loadCandidates({ preserveSelection: true });
              showToast("Candidate registered successfully.", "success");
            }}
          />
          <CandidateHeroCard
            candidate={candidate}
            mapping={mapping}
            displayName={displayName}
            profileCompletion={profileCompletion}
            profileCompletionBreakdown={profileCompletionBreakdown}
            skillChips={skillChips}
            masterLabels={masterLabels}
            onAction={handleWorkspaceAction}
          />
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 1.5,
              position: "sticky",
              top: 0,
              zIndex: 2,
              bgcolor: "background.default"
            }}
          >
            <EnterpriseTabs
              value={activeTab}
              onChange={(_, value) => {
                setActiveTab(value);
                if (value === "timeline") {
                  setTimelineView("activity");
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ minHeight: 40 }}
            >
              {WORKSPACE_TABS.map((tab) => (
                <Tab key={tab.key} value={tab.key} label={tab.label} sx={{ minHeight: 40, py: 1 }} />
              ))}
            </EnterpriseTabs>
          </Box>

          <Box sx={{ minHeight: 280, minWidth: 0, maxWidth: "100%", width: "100%" }}>
            {tabPanel}
          </Box>

          {!isDesktopSidebar ? (
            <Box sx={{ mt: 2 }}>{operationalSections}</Box>
          ) : null}

          <CandidateRecentActivitySection timelineEvents={timelineEvents} />
      </Box>

      <Box sx={{ display: { xs: "block", lg: "none" }, mt: 2 }}>
        <CandidateAiInsightsPanel
          open={aiPanelOpen}
          onToggle={() => setAiPanelOpen((prev) => !prev)}
          candidateId={candidate?.candidate_id}
          requisitionCode={
            mapping?.req_code ||
            mapping?.requisition_code ||
            profile?.mapping?.req_code ||
            profile?.mapping?.requisition_code ||
            null
          }
          onMapRequisition={() => setAssignmentDialogOpen(true)}
        />
      </Box>

      <Box sx={{ display: { xs: "block", lg: "none" }, mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Tap the sparkle icon to expand AI insights on tablet and mobile.
        </Typography>
      </Box>
      <CandidateAssignmentDialog
      open={assignmentDialogOpen}
      onClose={() => setAssignmentDialogOpen(false)}
      candidate={candidate}
      candidateId={candidate.candidate_id}
      onAssigned={async () => {

          setAssignmentDialogOpen(false);

          await workspace.loadCandidates();

          await workspace.loadProfile(candidate.candidate_id);

      }}
  />
      <CandidateOwnershipDialog
        open={ownershipDialogOpen}
        candidateName={<PersonIdentityText candidate={candidate} />}
        currentOwner={
          <PersonIdentityText
            name={ownerDisplayName}
            id={candidate?.owner_employee_code}
          />
        }
        loading={isSaving}
        onClose={() => setOwnershipDialogOpen(false)}
        onSubmit={async (reason) => {

          try {

            await requestOwnership(reason);

            setOwnershipDialogOpen(false);

          }

          catch {

            // requestOwnership already shows the error toast.
            // Keep dialog open.

          }

        }}
              />
      <EnterpriseConfirmationDialog
        open={releaseDialogOpen}
        title="Release Candidate"
        message="Are you sure you want to release this candidate from the current requisition?"
        confirmLabel="Release"
        loading={releaseLoading}
        onConfirm={handleConfirmRelease}
        onClose={handleCloseReleaseDialog}
      />
      <EnterpriseConfirmationDialog
        open={returnPoolDialogOpen}
        title="Return to Talent Pool"
        message="Return this candidate to the Enterprise Talent Pool? Ownership will be released and the candidate will be available for other recruiters."
        confirmLabel="Return to Talent Pool"
        loading={returnPoolLoading}
        onConfirm={handleConfirmReturnToTalentPool}
        onClose={handleCloseReturnPoolDialog}
      />
        <CandidateWorkspaceFab onAction={handleWorkspaceAction} />
      {isDesktopSidebar && sidebarOperationalMount
        ? createPortal(operationalSections, sidebarOperationalMount)
        : null}
      </Box>
    );
  }

  export default CandidateWorkspacePage;

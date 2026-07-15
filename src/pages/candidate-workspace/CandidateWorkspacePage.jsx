import CandidateAssignmentDialog
from "@/components/candidate-workspace/CandidateAssignmentDialog";

import { useCallback, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";

import {
  ErrorState,
  LoadingState,
  StatusChip,
  WorkspaceHeader
} from "@/components/enterprise";
import { WORKSPACE_TABS } from "@/enterprise/candidateWorkspaceUtils";

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
import CandidateAssignmentCard from "@/components/candidate-workspace/CandidateAssignmentCard";
import CandidateOwnershipCard from "@/components/candidate-workspace/CandidateOwnershipCard";
import CandidateOwnershipDialog from "@/components/candidate-workspace/CandidateOwnershipDialog";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import candidateRepository from "@/repositories/candidateRepository";

function CandidateWorkspacePage() {
  const navigate = useNavigate();
  const workspace = useOutletContext();
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [assignmentOpen, setAssignmentOpen] =
  useState(false);
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
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
    saveSkills,
    timelineEvents,
    masterLabels,
    masterData,
    activeTab,
    setActiveTab,
    aiPanelOpen,
    setAiPanelOpen,
    isLoadingProfile,
    isSaving,
    error,
    showToast,
    saveCandidate,
    localNotes,
    setLocalNotes,
    triggerResumeUpload,
    ownerDisplayName,
    isOwner,
    pendingRequest,
    requestOwnership
  } = workspace;

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
        navigate("/interview-schedule");
        return;
      }

      if (actionKey === "add-skill") {
        setActiveTab("skills");
        setOpenSkillDialog(true);
        return;
      }

      if (actionKey === "add-note") {
        setActiveTab("notes");
        return;
      }

      if (actionKey === "map-requisition") {

    console.log("Assign Requisition Clicked");

    setAssignmentOpen(true);

    return;

}

if (
[
"add-experience",
"add-education",
"upload-document"
].includes(actionKey)
) {
        showToast(`${actionKey.replace(/-/g, " ")} — coming soon in workspace actions.`, "info");
        return;
      }

      showToast(`${actionKey.replace(/-/g, " ")} action triggered.`, "info");
    },
    [candidate.resume_path, navigate, setActiveTab, showToast, triggerResumeUpload]
  );

  const handleToolbarOverflow = useCallback(
    (action) => {
      showToast(`${action.charAt(0).toUpperCase()}${action.slice(1)} view — preview placeholder.`, "info");
    },
    [showToast]
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

  if (isLoadingProfile) {
    return <LoadingState message="Loading candidate workspace..." />;
  }

  if (error && !candidate?.candidate_id) {
    return <ErrorState title="Unable to load candidate" message={error} />;
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
            onSaveSkills={saveSkills}
            onOpenAddDialog={() => setOpenSkillDialog(true)}
            forceOpenDialog={openSkillDialog}
            onDialogClose={() => setOpenSkillDialog(false)}
          />
        );
      case "education":
        return (
          <CandidateEducationPanel
            education={profile.children.education}
            masterData={masterData}
          />
        );
      case "experience":
        return (
          <CandidateExperiencePanel
            candidate={candidate}
            experience={profile.children.experience}
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
        return <CandidateTimelinePanel events={timelineEvents} />;
      default:
        return (
          <CandidateOverviewPanel
            candidate={candidate}
            mapping={mapping}
            masterLabels={masterLabels}
            profileCompletion={profileCompletion}
            profileCompletionBreakdown={profileCompletionBreakdown}
            timelineEvents={timelineEvents}
          />
        );
    }
  })();

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, pb: { xs: 12, sm: 10 } }}>
      <WorkspaceHeader
        dense
        title={displayName}
        subtitle={`${candidate.candidate_code || "—"} · Candidate Workspace`}
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

      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems="flex-start">
        <Box flex={1} minWidth={0}>
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
          <CandidateOwnershipCard
            ownerDisplayName={ownerDisplayName}
            isOwner={isOwner}
            pendingRequest={pendingRequest}
            mapping={activeAssignmentMapping}
            onRequestOwnership={() => setOwnershipDialogOpen(true)}
            onMapRequisition={() => handleWorkspaceAction("map-requisition")}
          />
          <CandidateAssignmentCard
            candidate={candidate}
            mapping={activeAssignmentMapping}
            isOwner={isOwner}
            onAssign={() =>
              handleWorkspaceAction("map-requisition")
            }
            onRelease={() => setReleaseDialogOpen(true)}
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
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ minHeight: 40 }}
            >
              {WORKSPACE_TABS.map((tab) => (
                <Tab key={tab.key} value={tab.key} label={tab.label} sx={{ minHeight: 40, py: 1 }} />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ minHeight: 280 }}>{tabPanel}</Box>
        </Box>

        <CandidateAiInsightsPanel
          open={aiPanelOpen}
          onToggle={() => setAiPanelOpen((prev) => !prev)}
          skillChips={skillChips}
        />
      </Stack>

      <Box sx={{ display: { xs: "block", lg: "none" }, mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Tap the sparkle icon to expand AI insights on tablet and mobile.
        </Typography>
      </Box>
      <CandidateAssignmentDialog
      open={assignmentOpen}
      onClose={() => setAssignmentOpen(false)}
      candidate={candidate}
      candidateId={candidate.candidate_id}
      onAssigned={async () => {

          setAssignmentOpen(false);

          await workspace.loadCandidates();

          await workspace.loadProfile(candidate.candidate_id);

      }}
  />
      <CandidateOwnershipDialog
        open={ownershipDialogOpen}
        candidateName={displayName}
        currentOwner={ownerDisplayName}
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
        <CandidateWorkspaceFab onAction={handleWorkspaceAction} />
      </Box>
    );
  }

  export default CandidateWorkspacePage;

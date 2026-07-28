import { Outlet, useNavigate } from "react-router-dom";

import { Box, IconButton } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import WorkspaceLayout from "@/components/enterprise/WorkspaceLayout";
import AdminNavRail from "@/components/layout/AdminNavRail";
import RecruiterNavRail from "@/components/layout/RecruiterNavRail";
import CandidateListSidebar from "@/components/candidate-workspace/CandidateListSidebar";
import CandidateNewDialog from "@/components/candidate-workspace/CandidateNewDialog";
import useCandidateWorkspace from "@/hooks/useCandidateWorkspace";

function CandidateWorkspaceLayout() {
  const navigate = useNavigate();
  const workspace = useCandidateWorkspace();
  const {
    user,
    toast,
    setToast,
    newDialogOpen,
    setNewDialogOpen,
    registerCandidate,
    isSaving,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    resumeInputRef,
    handleResumeSelected
  } = workspace;

  let enterpriseWorkspace = {};

  try {
    enterpriseWorkspace =
      JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    enterpriseWorkspace = {};
  }

  return (
    <WorkspaceLayout
      maxWidth={1680}
      navRail={
        enterpriseWorkspace.showRecruitmentWorkspace ? (
          <RecruiterNavRail loggedInUser={user} />
        ) : (
          <AdminNavRail />
        )
      }
      sidebar={
        <CandidateListSidebar
          candidates={workspace.candidates}
          selectedId={workspace.candidateId}

          workspaceView={workspace.workspaceView}
          onWorkspaceViewChange={workspace.setWorkspaceView}

          searchQuery={workspace.searchQuery}
          onSearchChange={workspace.setSearchQuery}

          statusFilter={workspace.statusFilter}
          onStatusFilterChange={workspace.setStatusFilter}

          onSelect={workspace.selectCandidate}
          onNewCandidate={() => navigate("/candidate-intake")}

          isLoading={workspace.isLoadingList}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
/>
      }
      toast={
        toast.message
          ? { message: toast.message, severity: toast.severity }
          : null
      }
      onToastClose={() => setToast({ message: "", severity: "success" })}
    >
      <Box sx={{ display: { xs: "flex", md: "none" }, mb: 1 }}>
        <IconButton
          size="small"
          aria-label="Open candidate list"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <MenuOutlinedIcon />
        </IconButton>
      </Box>

      <input
        ref={resumeInputRef}
        type="file"
        hidden
        accept=".pdf,.doc,.docx"
        onChange={handleResumeSelected}
      />

      <Outlet context={workspace} />

      <CandidateNewDialog
        open={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        onCreate={registerCandidate}
        isSaving={isSaving}
      />
    </WorkspaceLayout>
  );
}

export default CandidateWorkspaceLayout;

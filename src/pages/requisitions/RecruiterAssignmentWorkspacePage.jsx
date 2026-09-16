import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";

import WorkspaceLayout from "../../components/enterprise/WorkspaceLayout";
import AdminNavRail from "../../components/layout/AdminNavRail";
import RecruiterNavRail from "../../components/layout/RecruiterNavRail";
import TALeadNavRail from "../../components/layout/TALeadNavRail";
import EnterpriseWorkspaceHeader from "../../components/enterprise/framework/EnterpriseWorkspaceHeader";
import RecruiterAssignmentPanel from "../../components/requisitions/RecruiterAssignmentPanel";
import useRequisitionManagement from "../../hooks/useRequisitionManagement";

function resolveEnterpriseNavRail(user) {
  const workspace = (() => {
    try {
      return JSON.parse(localStorage.getItem("workspace") || "{}") || {};
    } catch {
      return {};
    }
  })();

  if (workspace.showRecruitmentWorkspace || workspace.showInterviewWorkspace) {
    return <RecruiterNavRail loggedInUser={user} />;
  }

  if (workspace.showTaLeadWorkspace) {
    return <TALeadNavRail />;
  }

  return <AdminNavRail />;
}

/**
 * Recruiter Assignment Workspace — consumes the shared RecruiterAssignmentPanel.
 * Integration only; no duplicated business logic.
 */
function RecruiterAssignmentWorkspacePage() {
  const [searchParams] = useSearchParams();
  const focusRequisitionCode = searchParams.get("focus");

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const {
    requisitions,
    recruiters,
    assignedRecruiters,
    selectedReqId,
    selectedRecruiter,
    showAssignModal,
    setRequisitionManagementUi,
    loadAssignedRecruiters,
    assignRecruiterOnRequisition,
    removeRecruiterFromRequisition,
    publishRequisitionToCandidatePortal,
    unpublishRequisitionFromCandidatePortal,
    closeRequisitionAsFilled,
    closeRequisitionAsCancelled
  } = useRequisitionManagement();

  useEffect(() => {
    if (!focusRequisitionCode || !requisitions?.length) {
      return;
    }

    const match = requisitions.find((req) => {
      const code = String(req.requisition_code || req.req_code || "").trim();
      return code === focusRequisitionCode;
    });

    if (match?.req_id) {
      setRequisitionManagementUi({
        selectedReqId: match.req_id,
        showAssignModal: true
      });
      loadAssignedRecruiters(match.req_id);
    }
  }, [
    focusRequisitionCode,
    requisitions,
    setRequisitionManagementUi,
    loadAssignedRecruiters
  ]);

  return (
    <WorkspaceLayout navRail={resolveEnterpriseNavRail(loggedInUser)}>
      <Box sx={{ bgcolor: "background.default" }}>
        <EnterpriseWorkspaceHeader title="Recruiter Assignment" />

        <Box
          sx={{
            mt: 1,
            width: { xs: "100%", md: "100%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <RecruiterAssignmentPanel
            initialSearchQuery={focusRequisitionCode || ""}
            requisitions={requisitions}
            recruiters={recruiters}
            assignedRecruiters={assignedRecruiters}
            selectedReqId={selectedReqId}
            selectedRecruiter={selectedRecruiter}
            showAssignModal={showAssignModal}
            setRequisitionManagementUi={setRequisitionManagementUi}
            loadAssignedRecruiters={loadAssignedRecruiters}
            assignRecruiterOnRequisition={assignRecruiterOnRequisition}
            removeRecruiterFromRequisition={removeRecruiterFromRequisition}
            publishRequisitionToCandidatePortal={publishRequisitionToCandidatePortal}
            unpublishRequisitionFromCandidatePortal={unpublishRequisitionFromCandidatePortal}
            closeRequisitionAsFilled={closeRequisitionAsFilled}
            closeRequisitionAsCancelled={closeRequisitionAsCancelled}
          />
        </Box>
      </Box>
    </WorkspaceLayout>
  );
}

export default RecruiterAssignmentWorkspacePage;

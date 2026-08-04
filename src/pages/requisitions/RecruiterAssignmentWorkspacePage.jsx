import { Box } from "@mui/material";

import WorkspaceLayout from "../../components/enterprise/WorkspaceLayout";
import AdminNavRail from "../../components/layout/AdminNavRail";
import RecruiterNavRail from "../../components/layout/RecruiterNavRail";
import EnterpriseWorkspaceHeader from "../../components/enterprise/framework/EnterpriseWorkspaceHeader";
import RecruiterAssignmentPanel from "../../components/requisitions/RecruiterAssignmentPanel";
import useRequisitionManagement from "../../hooks/useRequisitionManagement";

function resolveEnterpriseNavRail(user) {
  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  if (workspace.showRecruitmentWorkspace || workspace.showInterviewWorkspace) {
    return <RecruiterNavRail loggedInUser={user} />;
  }

  return <AdminNavRail />;
}

/**
 * Recruiter Assignment Workspace — consumes the shared RecruiterAssignmentPanel.
 * Integration only; no duplicated business logic.
 */
function RecruiterAssignmentWorkspacePage() {
  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (_error) {
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
    removeRecruiterFromRequisition
  } = useRequisitionManagement();

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
          />
        </Box>
      </Box>
    </WorkspaceLayout>
  );
}

export default RecruiterAssignmentWorkspacePage;

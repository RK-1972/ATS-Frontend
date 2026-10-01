import { Outlet } from "react-router-dom";
import { Alert } from "@mui/material";
import WorkspaceLayout from "../enterprise/WorkspaceLayout";
import RecruiterNavRail from "../layout/RecruiterNavRail";
import useRecruiterWorkspace from "../../hooks/useRecruiterWorkspace";

function RecruiterWorkspaceLayout() {
  const workspace = useRecruiterWorkspace();
  const {
    user,
    recruiterUi,
    setRecruiterUi,
    atsStageCatalogError,
    isAtsStageCatalogEmpty
  } = workspace;

  return (
    <WorkspaceLayout
      navRail={<RecruiterNavRail loggedInUser={user} />}
      toast={{
        message: recruiterUi.toastMessage,
        severity: recruiterUi.toastSeverity || "success"
      }}
      onToastClose={() => setRecruiterUi({ toastMessage: "", toastSeverity: "success" })}
    >
      {atsStageCatalogError ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          ATS stage catalog unavailable: {atsStageCatalogError}
        </Alert>
      ) : null}
      {!atsStageCatalogError && isAtsStageCatalogEmpty ? (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          No active ATS stages are available.
        </Alert>
      ) : null}
      <Outlet context={workspace} />
    </WorkspaceLayout>
  );
}

export default RecruiterWorkspaceLayout;

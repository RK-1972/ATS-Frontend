import { Outlet } from "react-router-dom";
import WorkspaceLayout from "../enterprise/WorkspaceLayout";
import RecruiterNavRail from "../layout/RecruiterNavRail";
import useRecruiterWorkspace from "../../hooks/useRecruiterWorkspace";

function RecruiterWorkspaceLayout() {
  const workspace = useRecruiterWorkspace();
  const { user, recruiterUi, setRecruiterUi } = workspace;

  return (
    <WorkspaceLayout
      navRail={<RecruiterNavRail loggedInUser={user} />}
      toast={{
        message: recruiterUi.toastMessage,
        severity: recruiterUi.toastSeverity || "success"
      }}
      onToastClose={() => setRecruiterUi({ toastMessage: "", toastSeverity: "success" })}
    >
      <Outlet context={workspace} />
    </WorkspaceLayout>
  );
}

export default RecruiterWorkspaceLayout;

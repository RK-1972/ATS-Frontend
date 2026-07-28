import { useMemo } from "react";
import { Outlet } from "react-router-dom";

import WorkspaceLayout from "@/components/enterprise/WorkspaceLayout";
import AdminNavRail from "@/components/layout/AdminNavRail";
import RecruiterNavRail from "@/components/layout/RecruiterNavRail";

function CandidateIntakeLayout() {
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  let enterpriseWorkspace = {};

  try {
    enterpriseWorkspace =
      JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    enterpriseWorkspace = {};
  }

  return (
    <WorkspaceLayout
      navRail={
        enterpriseWorkspace.showRecruitmentWorkspace ? (
          <RecruiterNavRail loggedInUser={user} />
        ) : (
          <AdminNavRail />
        )
      }
    >
      <Outlet />
    </WorkspaceLayout>
  );
}

export default CandidateIntakeLayout;

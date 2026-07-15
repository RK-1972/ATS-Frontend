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

  const isRecruiter = user?.role_name === "Recruiter";

  return (
    <WorkspaceLayout
      navRail={
        isRecruiter ? (
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

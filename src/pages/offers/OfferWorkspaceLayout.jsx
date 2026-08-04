import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Alert } from "@mui/material";

import WorkspaceLayout from "@/components/enterprise/WorkspaceLayout";
import { WorkspaceHeader } from "@/components/enterprise";
import AdminNavRail from "@/components/layout/AdminNavRail";
import RecruiterNavRail from "@/components/layout/RecruiterNavRail";
import OfferWorkspaceSidebar from "@/components/offers/OfferWorkspaceSidebar";
import useOfferWorkspace from "@/hooks/useOfferWorkspace";

function resolveEnterpriseNavRail(user) {
  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  if (
    workspace.showRecruitmentWorkspace ||
    workspace.showInterviewWorkspace ||
    workspace.showOfferWorkspace
  ) {
    return <RecruiterNavRail loggedInUser={user} />;
  }

  return <AdminNavRail />;
}

/**
 * Offer Workspace shell — mirrors WorkforcePlanningLayout refresh pattern.
 */
function OfferWorkspaceLayout() {
  const location = useLocation();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const offerWorkspaceState = useOfferWorkspace();
  const refreshOffers = offerWorkspaceState.refreshOffers;

  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  const canAccess = Boolean(workspace.showOfferWorkspace);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    refreshOffers?.().catch(() => {
      // keep existing UI responsive even if refresh fails
    });
  }, [location.pathname, refreshOffers]);

  return (
    <WorkspaceLayout
      navRail={resolveEnterpriseNavRail(loggedInUser)}
      sidebar={canAccess ? <OfferWorkspaceSidebar /> : null}
    >
      {canAccess ? (
        <Outlet context={offerWorkspaceState} />
      ) : (
        <>
          <WorkspaceHeader
            title="Offer Workspace"
            subtitle="Offer Management workspace access."
          />
          <Alert severity="warning">
            Offer Workspace is not enabled for your Employee Work Assignment.
          </Alert>
        </>
      )}
    </WorkspaceLayout>
  );
}

export default OfferWorkspaceLayout;

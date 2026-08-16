import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { WorkspaceLayout, LoadingState, ErrorState } from "@/components/enterprise";
import AdminNavRail from "@/components/layout/AdminNavRail";
import AdminCommandCenterHeader from "@/components/admin-home/AdminCommandCenterHeader";
import AdminSummaryCards from "@/components/admin-home/AdminSummaryCards";
import AdminAttentionPanel from "@/components/admin-home/AdminAttentionPanel";
import AdminFunctionalCards from "@/components/admin-home/AdminFunctionalCards";
import { fetchAdminCommandCenter } from "./adminHomeApi";
import { buildAdminHomeModel } from "./adminHomeViewModel";
import { useCopilotContext } from "@/components/copilot/CopilotContext";

function resolveLoadError(loadError) {
  return loadError.response?.data?.message
    || loadError.message
    || "Failed to load admin command center.";
}

function AdminHomePage() {
  const navigate = useNavigate();
  const { setCurrentPage } = useCopilotContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setCurrentPage("Dashboard");
  }, [setCurrentPage]);

  useEffect(() => {
    let active = true;

    fetchAdminCommandCenter()
      .then((data) => {
        if (active) {
          setDashboardData(data);
          setError("");
          setLoading(false);
        }
      })
      .catch((loadError) => {
        if (active) {
          setDashboardData(null);
          setError(resolveLoadError(loadError));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadToken((current) => current + 1);
  }, []);

  const model = useMemo(
    () => buildAdminHomeModel(dashboardData),
    [dashboardData]
  );

  if (loading && !dashboardData) {
    return (
      <WorkspaceLayout navRail={<AdminNavRail />}>
        <LoadingState message="Loading admin command center…" />
      </WorkspaceLayout>
    );
  }

  if (error && !dashboardData) {
    return (
      <WorkspaceLayout navRail={<AdminNavRail />}>
        <ErrorState
          title="Unable to load Admin Command Center"
          message={error}
          onRetry={handleRetry}
        />
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout navRail={<AdminNavRail />}>
      <Box
        sx={{
          py: { xs: 2, sm: 2.5 },
          px: { xs: 0, sm: 0.5 },
          width: "100%",
          minWidth: 0
        }}
      >
        <AdminCommandCenterHeader />

        <AdminSummaryCards {...model.kpis} />

        <AdminAttentionPanel
          items={model.attentionItems}
          onNavigate={navigate}
        />

        <AdminFunctionalCards onNavigate={navigate} />
      </Box>
    </WorkspaceLayout>
  );
}

export default AdminHomePage;

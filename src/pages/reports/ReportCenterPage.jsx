import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";

import { useCopilotContext } from "../../components/copilot/CopilotContext";
import {
  EnterpriseModuleCard,
  EnterpriseModuleGrid,
  EnterpriseSurface,
  ErrorState,
  LoadingState,
  WorkspaceHeader
} from "../../components/enterprise";
import { fetchStandardReports } from "./standardReportsApi";

const ICON_MAP = {
  pipeline: FilterAltOutlinedIcon,
  requisitions: AssignmentOutlinedIcon,
  trend: TrendingUpOutlinedIcon,
  funnel: FilterAltOutlinedIcon,
  workload: GroupsOutlinedIcon,
  department: BusinessOutlinedIcon
};

function ReportCenterPage() {
  const navigate = useNavigate();
  const { setCurrentPage } = useCopilotContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentPage("Reports & Analytics");
  }, [setCurrentPage]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        const data = await fetchStandardReports();
        if (!cancelled) {
          setReports(data?.reports || []);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setReports([]);
          setError(loadError.message || "Failed to load standard reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    fetchStandardReports()
      .then((data) => {
        setReports(data?.reports || []);
      })
      .catch((loadError) => {
        setReports([]);
        setError(loadError.message || "Failed to load standard reports.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <LoadingState message="Loading Report Center…" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load Report Center"
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
      <WorkspaceHeader
        title="Reports & Analytics"
        subtitle="Explore standard reports or build your own report."
        dense
      />

      <Stack spacing={2.5} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              display: "block",
              mb: 1.5
            }}
          >
            Standard Reports
          </Typography>

          {reports.length === 0 ? (
            <EnterpriseSurface sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No standard reports are available for your role.
              </Typography>
            </EnterpriseSurface>
          ) : (
            <EnterpriseModuleGrid>
              {reports.map((report) => {
                const Icon = ICON_MAP[report.icon] || AssignmentOutlinedIcon;

                return (
                  <EnterpriseModuleCard
                    key={report.report_code}
                    title={report.name}
                    description={report.description}
                    icon={Icon}
                    module="reports"
                    actionLabel="View Report"
                    onAction={() => navigate(`/reports/standard/${report.report_code}`)}
                  >
                    <Chip
                      label={report.category}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1, height: 22, fontSize: 11, fontWeight: 600 }}
                    />
                  </EnterpriseModuleCard>
                );
              })}
            </EnterpriseModuleGrid>
          )}
        </Box>

        <Divider />

        <EnterpriseSurface
          sx={{
            p: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", minWidth: 0 }}>
            <TableChartOutlinedIcon sx={{ color: "primary.main", mt: 0.25 }} />
            <Box minWidth={0}>
              <Typography variant="subtitle1" fontWeight={700}>
                Ad-hoc Report Builder
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: 13 }}>
                Create a custom report by selecting datasets, fields, filters, sorting and grouping.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={() => navigate("/reports/builder")}
            sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
          >
            Build Ad-hoc Report
          </Button>
        </EnterpriseSurface>
      </Stack>
    </Box>
  );
}

export default ReportCenterPage;

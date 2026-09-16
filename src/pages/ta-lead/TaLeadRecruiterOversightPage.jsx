import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import {
  WorkspaceLayout,
  LoadingState,
  ErrorState,
  EnterpriseSurface
} from "@/components/enterprise";
import EnterpriseWorkspaceHeader from "@/components/enterprise/framework/EnterpriseWorkspaceHeader";
import TALeadNavRail from "@/components/layout/TALeadNavRail";
import TaLeadPipelineFlow from "@/components/ta-lead/TaLeadPipelineFlow";
import { PANEL_SHELL, PANEL_HEADER } from "@/components/ta-lead/taLeadTokens";
import { getPipelineStageLabels } from "@/enterprise/atsStageCatalogUtils";
import useAtsStageCatalog from "@/hooks/useAtsStageCatalog";
import { fetchTaLeadRecruiterSummary } from "./taLeadHomeApi";

function TaLeadRecruiterOversightPage() {
  const navigate = useNavigate();
  const { recruiterCode } = useParams();
  const { stages: catalogStages } = useAtsStageCatalog();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    fetchTaLeadRecruiterSummary(recruiterCode)
      .then((data) => {
        if (active) {
          setSummary(data);
          setError("");
          setLoading(false);
        }
      })
      .catch((loadError) => {
        if (active) {
          setSummary(null);
          setError(
            loadError.response?.data?.message
              || loadError.message
              || "Failed to load recruiter oversight summary."
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [recruiterCode, reloadToken]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadToken((current) => current + 1);
  }, []);

  const pipelineStages = summary?.pipeline_stages || null;
  const stageCounts = pipelineStages || {};

  const pipelineStageOrder = useMemo(() => {
    if (!pipelineStages) {
      return [];
    }

    const catalogOrder = getPipelineStageLabels(catalogStages);
    const apiStages = Object.keys(pipelineStages);
    return catalogOrder.filter((stage) => apiStages.includes(stage));
  }, [catalogStages, pipelineStages]);

  const recruiterName = summary?.recruiter?.full_name || recruiterCode;

  if (loading && !summary) {
    return (
      <WorkspaceLayout navRail={<TALeadNavRail />}>
        <LoadingState message="Loading recruiter oversight…" />
      </WorkspaceLayout>
    );
  }

  if (error && !summary) {
    return (
      <WorkspaceLayout navRail={<TALeadNavRail />}>
        <ErrorState
          title="Unable to load recruiter oversight"
          message={error}
          onRetry={handleRetry}
        />
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout navRail={<TALeadNavRail />}>
      <Box sx={{ py: { xs: 1.5, sm: 2 }, width: "100%", minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Button
            size="small"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate("/ta-lead")}
            sx={{ textTransform: "none" }}
          >
            Back to TA Lead Home
          </Button>
        </Stack>

        <EnterpriseWorkspaceHeader
          title={recruiterName}
          subtitle={`Recruiter oversight — ${summary?.recruiter?.recruiter_code || recruiterCode}`}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 1, mb: 1.5 }}
        >
          <EnterpriseSurface sx={{ px: 1.5, py: 1, flex: 1 }}>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              Active Requisitions
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              {summary?.active_requisitions ?? 0}
            </Typography>
          </EnterpriseSurface>
          <EnterpriseSurface sx={{ px: 1.5, py: 1, flex: 1 }}>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              Active Candidates
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              {summary?.active_candidates ?? 0}
            </Typography>
          </EnterpriseSurface>
        </Stack>

        {pipelineStages ? (
          <Box sx={{ mb: 1.5 }}>
            <TaLeadPipelineFlow
              stageOrder={pipelineStageOrder}
              stageCounts={stageCounts}
            />
          </Box>
        ) : null}

        <Box sx={PANEL_SHELL}>
          <Box sx={PANEL_HEADER}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              Assigned Requisitions
            </Typography>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                    Code
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                    Status
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                    Filled
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
                    Remaining
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(summary?.requisitions || []).map((row) => (
                  <TableRow key={row.requisition_code} hover>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                      {row.req_code || row.requisition_code}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {row.job_title || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {row.req_status || "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>
                      {row.fulfillment?.filled_headcount ?? 0}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>
                      {row.fulfillment?.remaining_headcount ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </WorkspaceLayout>
  );
}

export default TaLeadRecruiterOversightPage;

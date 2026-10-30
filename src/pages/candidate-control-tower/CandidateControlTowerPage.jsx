import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RadarOutlinedIcon from "@mui/icons-material/RadarOutlined";

import AdminNavRail from "../../components/layout/AdminNavRail";
import Header from "../../components/Header";
import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import {
  EmptyState,
  EnterpriseDataGrid,
  EnterpriseSurface,
  SearchBar
} from "@/components/enterprise";
import candidateControlTowerClient from "../../api/clients/candidateControlTowerClient";
import { readWorkspaceFlags } from "@/enterprise/workspaceAvailability";

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function stageChipColor(stageName = "") {
  const normalized = String(stageName).trim().toLowerCase();

  if (normalized.includes("offer") || normalized.includes("hired")) {
    return "success";
  }

  if (normalized.includes("reject")) {
    return "error";
  }

  if (normalized.includes("interview")) {
    return "warning";
  }

  if (normalized.includes("screen")) {
    return "secondary";
  }

  return "primary";
}

function SummaryMetricCard({ label, value, helper }) {
  return (
    <EnterpriseSurface sx={{ p: 2, height: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {helper}
        </Typography>
      ) : null}
    </EnterpriseSurface>
  );
}

function CandidateControlTowerPage() {
  const navigate = useNavigate();
  const workspace = readWorkspaceFlags();
  const canAccess = Boolean(workspace.showCandidateControlTowerWorkspace);

  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    owner: "",
    requisition: "",
    stage: "",
    interviewStatus: "",
    offerStatus: "",
    source: ""
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const requestSeqRef = useRef(0);

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);

    try {
      const response = await candidateControlTowerClient.getSummary();
      setSummary(response?.data || null);
    } catch (_error) {
      setSummary(null);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    const requestId = requestSeqRef.current + 1;
    requestSeqRef.current = requestId;
    setIsLoadingGrid(true);
    setLoadError("");

    try {
      const response = await candidateControlTowerClient.searchApplications({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        q: searchQuery,
        owner: filters.owner,
        requisition: filters.requisition,
        stage: filters.stage,
        interview_status: filters.interviewStatus,
        offer_status: filters.offerStatus,
        source: filters.source,
        sortBy: "last_activity",
        sortDir: "desc"
      });

      if (requestId !== requestSeqRef.current) {
        return;
      }

      const payload = response?.data || {};
      setRows(Array.isArray(payload.items) ? payload.items : []);
      setTotalRows(Number(payload.total) || 0);
    } catch (error) {
      if (requestId !== requestSeqRef.current) {
        return;
      }

      setRows([]);
      setTotalRows(0);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load candidate applications."
      );
    } finally {
      if (requestId === requestSeqRef.current) {
        setIsLoadingGrid(false);
      }
    }
  }, [filters, paginationModel.page, paginationModel.pageSize, searchQuery]);

  useEffect(() => {
    if (!canAccess) {
      return;
    }

    void loadSummary();
  }, [canAccess, loadSummary]);

  useEffect(() => {
    if (!canAccess) {
      return;
    }

    void loadApplications();
  }, [canAccess, loadApplications]);

  const columns = useMemo(
    () => [
      {
        field: "candidate_name",
        headerName: "Candidate",
        flex: 1.1,
        minWidth: 180,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.row.candidate_name || "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.candidate_code || params.row.candidate_id}
            </Typography>
          </Box>
        )
      },
      {
        field: "owner_name",
        headerName: "Owner",
        flex: 0.9,
        minWidth: 140
      },
      {
        field: "requisition_code",
        headerName: "Requisition",
        flex: 1,
        minWidth: 160,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2">{params.row.requisition_code || "—"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.position_title || "—"}
            </Typography>
          </Box>
        )
      },
      {
        field: "stage_name",
        headerName: "Pipeline Stage",
        width: 150,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.stage_name || "Applied"}
            color={stageChipColor(params.row.stage_name)}
            variant="outlined"
            sx={{ maxWidth: "100%" }}
          />
        )
      },
      {
        field: "interview_status",
        headerName: "Interview",
        width: 130
      },
      {
        field: "offer_status",
        headerName: "Offer",
        width: 130
      },
      {
        field: "last_activity_at",
        headerName: "Last Activity",
        width: 130,
        valueFormatter: (value) => formatDateTime(value)
      },
      {
        field: "time_in_stage_days",
        headerName: "Time in Stage",
        width: 120,
        valueFormatter: (value) =>
          Number.isFinite(Number(value)) ? `${value} days` : "—"
      },
      {
        field: "actions",
        headerName: "",
        width: 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Button
            size="small"
            aria-label="View candidate"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedRow(params.row);
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </Button>
        )
      }
    ],
    []
  );

  if (!canAccess) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Header />
        <AdminNavRail />
        <Box sx={{ pl: { md: "72px" }, p: 3 }}>
          <Alert severity="warning">
            The Centralized Candidate Control Tower requires the CANDIDATE_CONTROL_TOWER work
            assignment.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Header />
      <Box sx={{ display: "flex", flex: 1, minWidth: 0 }}>
        <AdminNavRail />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            overflowX: "hidden"
          }}
        >
          <ConfigPageHeader
            icon={RadarOutlinedIcon}
            title="Candidate Control Tower"
            subtitle="Centralized view of candidate applications within your authorized scope."
            breadcrumbs={[
              { label: "Administration" },
              { label: "Candidate Control Tower" }
            ]}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <SummaryMetricCard
                label="Unique Candidates"
                value={isLoadingSummary ? "…" : summary?.unique_candidates ?? 0}
                helper="Distinct candidates in scope"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <SummaryMetricCard
                label="Active Applications"
                value={isLoadingSummary ? "…" : summary?.active_applications ?? 0}
                helper="Candidate–requisition rows"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <SummaryMetricCard
                label="Unassigned"
                value={isLoadingSummary ? "…" : summary?.unassigned_applications ?? 0}
                helper="Missing owner on application"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <SummaryMetricCard
                label="Interviews (7d)"
                value={isLoadingSummary ? "…" : summary?.upcoming_interviews ?? 0}
                helper="Scheduled in next 7 days"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <SummaryMetricCard
                label="Active Offers"
                value={isLoadingSummary ? "…" : summary?.active_offers ?? 0}
                helper="Non-terminal offer status"
              />
            </Grid>
          </Grid>

          <EnterpriseSurface sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, candidate ID, email…"
                onSubmit={() => {
                  setPaginationModel((current) => ({ ...current, page: 0 }));
                }}
              />
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Owner"
                    value={filters.owner}
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, owner: event.target.value }));
                      setPaginationModel((current) => ({ ...current, page: 0 }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Requisition"
                    value={filters.requisition}
                    onChange={(event) => {
                      setFilters((current) => ({
                        ...current,
                        requisition: event.target.value
                      }));
                      setPaginationModel((current) => ({ ...current, page: 0 }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Pipeline Stage"
                    value={filters.stage}
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, stage: event.target.value }));
                      setPaginationModel((current) => ({ ...current, page: 0 }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Interview Status"
                    value={filters.interviewStatus}
                    onChange={(event) => {
                      setFilters((current) => ({
                        ...current,
                        interviewStatus: event.target.value
                      }));
                      setPaginationModel((current) => ({ ...current, page: 0 }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Offer Status"
                    value={filters.offerStatus}
                    onChange={(event) => {
                      setFilters((current) => ({
                        ...current,
                        offerStatus: event.target.value
                      }));
                      setPaginationModel((current) => ({ ...current, page: 0 }));
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Source"
                    value={filters.source}
                    onChange={(event) => {
                      setFilters((current) => ({ ...current, source: event.target.value }));
                      setPaginationModel((current) => ({ ...current, page: 0 }));
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </EnterpriseSurface>

          {loadError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          ) : null}

          {!isLoadingGrid && rows.length === 0 ? (
            <EmptyState
              title="No applications in scope"
              description="Try adjusting search or filters. Results respect your existing candidate and requisition authorization."
            />
          ) : (
            <EnterpriseDataGrid
              rows={rows}
              columns={columns}
              loading={isLoadingGrid}
              height={520}
              getRowId={(row) => row.mapping_id}
              paginationMode="server"
              rowCount={totalRows}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pagination
              onRowClick={(params) => setSelectedRow(params.row)}
            />
          )}
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 2 } }}
      >
        {selectedRow ? (
          <Stack spacing={2}>
            <Typography variant="h6">{selectedRow.candidate_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedRow.candidate_code || selectedRow.candidate_id}
            </Typography>
            <Chip
              size="small"
              label={selectedRow.stage_name || "Applied"}
              color={stageChipColor(selectedRow.stage_name)}
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            />
            <Typography variant="body2">
              <strong>Owner:</strong> {selectedRow.owner_name}
            </Typography>
            <Typography variant="body2">
              <strong>Requisition:</strong> {selectedRow.requisition_code} —{" "}
              {selectedRow.position_title || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Interview:</strong> {selectedRow.interview_status}
            </Typography>
            <Typography variant="body2">
              <strong>Offer:</strong> {selectedRow.offer_status}
            </Typography>
            <Typography variant="body2">
              <strong>Last activity:</strong> {formatDateTime(selectedRow.last_activity_at)}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                navigate(`/candidates/${encodeURIComponent(selectedRow.candidate_id)}`);
              }}
            >
              View Full Profile
            </Button>
          </Stack>
        ) : null}
      </Drawer>
    </Box>
  );
}

export default CandidateControlTowerPage;

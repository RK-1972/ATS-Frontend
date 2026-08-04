import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

import EnterpriseCard from "../../components/enterprise/framework/EnterpriseCard";
import EnterpriseWorkspaceHeader from "../../components/enterprise/framework/EnterpriseWorkspaceHeader";
import EnterpriseModuleIcon from "../../components/enterprise/EnterpriseModuleIcon";
import {
  EmptyState,
  EnterpriseDataGrid,
  LoadingState,
  SearchBar,
  StatusChip
} from "../../components/enterprise";
import {
  PIPELINE_STAGES,
  normalizeStage
} from "../../enterprise/recruiterSelectors";
import recruitmentClient from "../../api/clients/recruitmentClient";
import candidateRepository from "../../repositories/candidateRepository";

const PIPELINE_STAGE_ICONS = {
  Applied: PersonAddAltOutlinedIcon,
  Screening: SearchOutlinedIcon,
  "L1 Interview": VideoCallOutlinedIcon,
  "L2 Interview": GroupsOutlinedIcon,
  "Client Interview": BusinessOutlinedIcon,
  Offer: WorkspacePremiumOutlinedIcon,
  Joined: CheckCircleOutlinedIcon
};

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function matchesCode(left, right) {
  return normalizeCode(left) === normalizeCode(right);
}

function displayValue(value) {
  if (value === 0) return "0";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatPersonLines(name, code) {
  const cleanedName = String(name || "").trim();
  const cleanedCode = String(code || "").trim();

  if (cleanedName && cleanedCode) {
    return { primary: cleanedName, secondary: `(${cleanedCode})` };
  }

  if (cleanedName) {
    return { primary: cleanedName, secondary: null };
  }

  if (cleanedCode) {
    return { primary: cleanedCode, secondary: null };
  }

  return { primary: "—", secondary: null };
}

function readSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function resolveHiringManagerLines(requisition) {
  return formatPersonLines(
    requisition.hiring_manager || requisition.hiring_manager_name || null,
    requisition.hiring_manager_code ||
      requisition.hm_employee_code ||
      requisition.hiring_manager_employee_code ||
      null
  );
}

function resolveRecruiterLines(requisition) {
  const code = requisition.recruiter_code || null;
  let name =
    requisition.recruiter_name || requisition.full_name || null;

  if (!name && code) {
    const sessionUser = readSessionUser();
    if (
      sessionUser &&
      matchesCode(sessionUser.employee_code, code)
    ) {
      name = sessionUser.full_name || null;
    }
  }

  return formatPersonLines(name, code);
}

function HeroAttribute({ icon: Icon, module = "recruitment", caption, primary, secondary = null }) {
  const titleText = secondary
    ? `${displayValue(primary)} ${secondary}`
    : displayValue(primary);

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="flex-start"
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 1,
        borderRadius: 2,
        bgcolor: "action.hover"
      }}
    >
      <EnterpriseModuleIcon
        icon={Icon}
        module={module}
        density="sm"
        size={28}
        iconSize={16}
        sx={{ mt: 0.15 }}
      />
      <Box minWidth={0}>
        <Typography
          variant="body2"
          fontWeight={700}
          color="text.primary"
          noWrap
          title={titleText}
          sx={{ lineHeight: 1.25 }}
        >
          {displayValue(primary)}
        </Typography>
        {secondary ? (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            title={secondary}
            sx={{ display: "block", lineHeight: 1.2, fontWeight: 600 }}
          >
            {secondary}
          </Typography>
        ) : null}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.2, fontWeight: 500 }}
        >
          {caption}
        </Typography>
      </Box>
    </Stack>
  );
}

function RequisitionSummaryHero({ requisition }) {
  const hiringManager = resolveHiringManagerLines(requisition);
  const recruiter = resolveRecruiterLines(requisition);

  const attributes = [
    {
      key: "client",
      caption: "Client",
      primary: requisition.client_name,
      secondary: null,
      icon: BusinessOutlinedIcon,
      module: "team"
    },
    {
      key: "hiring_manager",
      caption: "Hiring Manager",
      primary: hiringManager.primary,
      secondary: hiringManager.secondary,
      icon: PersonOutlineOutlinedIcon,
      module: "recruitment"
    },
    {
      key: "recruiter",
      caption: "Recruiter",
      primary: recruiter.primary,
      secondary: recruiter.secondary,
      icon: BadgeOutlinedIcon,
      module: "recruitment"
    },
    {
      key: "openings",
      caption: "Open Positions",
      primary: requisition.openings_count,
      secondary: null,
      icon: GroupsOutlinedIcon,
      module: "requisitions"
    },
    {
      key: "location",
      caption: "Location",
      primary: requisition.work_location,
      secondary: null,
      icon: LocationOnOutlinedIcon,
      module: "administration"
    }
  ];

  const primarySkill = requisition.primary_skill;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}0F 0%, transparent 42%)`
      }}
    >
      <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 1.75 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          flexWrap="wrap"
          sx={{ mb: 0.75 }}
        >
          <Chip
            icon={<WorkOutlineOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            label={displayValue(requisition.req_code)}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.2,
              borderColor: "primary.main",
              color: "primary.main",
              bgcolor: "background.paper"
            }}
          />
          <StatusChip status={requisition.req_status || "—"} />
        </Stack>

        <Typography
          variant="h6"
          fontWeight={800}
          color="text.primary"
          sx={{
            fontSize: { xs: "1.15rem", sm: "1.35rem" },
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            mb: 1.5
          }}
        >
          {displayValue(requisition.job_title || requisition.req_code)}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))"
            }
          }}
        >
          {attributes.map((item) => (
            <HeroAttribute
              key={item.key}
              icon={item.icon}
              module={item.module}
              caption={item.caption}
              primary={item.primary}
              secondary={item.secondary}
            />
          ))}
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
          <Chip
            label={displayValue(primarySkill)}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Box>
    </Paper>
  );
}

function PipelineStageMetricCards({ metrics }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1,
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
          lg: "repeat(7, minmax(0, 1fr))"
        }
      }}
    >
      {metrics.map((metric) => {
        const Icon = PIPELINE_STAGE_ICONS[metric.key] || GroupsOutlinedIcon;

        return (
          <Paper
            key={metric.key}
            elevation={0}
            sx={{
              px: 1.25,
              py: 1.25,
              borderRadius: 2.5,
              border: 1,
              borderColor: "divider",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              minWidth: 0
            }}
          >
            <Stack spacing={0.75} alignItems="flex-start">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main"
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                fontWeight={800}
                color="text.primary"
                sx={{
                  fontSize: "1.35rem",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {metric.value ?? 0}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ lineHeight: 1.2 }}
              >
                {metric.label}
              </Typography>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}

function RecruiterRequisitionDetailsPage() {
  const navigate = useNavigate();
  const { reqCode: routeReqCode } = useParams();
  const reqCode = decodeURIComponent(routeReqCode || "");

  const [requisition, setRequisition] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const loadDetails = useCallback(async () => {
    if (!reqCode) {
      setRequisition(null);
      setCandidates([]);
      setLoadError("Requisition code is required.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const today = new Date().toISOString().slice(0, 10);
      const [assignedList, dashboard] = await Promise.all([
        candidateRepository.getMyRequisitions(),
        // Wide range so assigned candidates are not limited to the cockpit's default 30-day window
        recruitmentClient.getMyDashboard({
          fromDate: "2020-01-01",
          toDate: today
        })
      ]);

      const assignedRows = Array.isArray(assignedList) ? assignedList : [];
      const matchedReq =
        assignedRows.find((row) => matchesCode(row.req_code, reqCode)) || null;

      if (!matchedReq) {
        setRequisition(null);
        setCandidates([]);
        setLoadError(
          "This requisition is not assigned to you, or it could not be found."
        );
        return;
      }

      const dashReq =
        (Array.isArray(dashboard?.requisitions)
          ? dashboard.requisitions
          : []
        ).find((row) =>
          matchesCode(row.requisition_code, matchedReq.req_code)
        ) || null;

      const pipelineRows = Array.isArray(dashboard?.activePipeline)
        ? dashboard.activePipeline
        : Array.isArray(dashboard?.pipeline)
          ? dashboard.pipeline
          : [];

      const reqCandidates = pipelineRows.filter((row) =>
        matchesCode(row.requisition_code, matchedReq.req_code)
      );

      // Display-only fields already present on my-dashboard requisition rows
      setRequisition({
        ...matchedReq,
        hiring_manager:
          matchedReq.hiring_manager ||
          matchedReq.hiring_manager_name ||
          dashReq?.hiring_manager ||
          null,
        hiring_manager_code:
          matchedReq.hiring_manager_code ||
          dashReq?.hiring_manager_code ||
          null
      });
      setCandidates(reqCandidates);
    } catch (error) {
      setRequisition(null);
      setCandidates([]);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load requisition details."
      );
    } finally {
      setIsLoading(false);
    }
  }, [reqCode]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const pipelineMetrics = useMemo(() => {
    const counts = PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    candidates.forEach((row) => {
      const stage = normalizeStage(row.stage_name);
      if (counts[stage] !== undefined) {
        counts[stage] += 1;
      }
    });

    return PIPELINE_STAGES.map((stage) => ({
      key: stage,
      label: stage,
      value: counts[stage]
    }));
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const query = String(search || "").trim().toLowerCase();

    if (!query) {
      return candidates;
    }

    return candidates.filter((row) => {
      const haystack = [
        row.candidate_name,
        row.candidate_code,
        row.stage_name,
        row.source_type
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [candidates, search]);

  const handleScheduleInterview = (row) => {
    const requisitionCode = requisition?.req_code || reqCode || null;
    const candidateId = row?.candidate_id ?? null;
    const candidateName = String(row?.candidate_name || "").trim() || null;

    if (!requisitionCode || candidateId == null || candidateId === "" || !candidateName) {
      return;
    }

    navigate("/interview-schedule", {
      state: {
        requisitionCode,
        candidateId,
        candidateName
      }
    });
  };

  const candidateColumns = [
    {
      field: "candidate_name",
      headerName: "Candidate",
      flex: 1.4,
      minWidth: 160,
      valueGetter: (value, row) =>
        row.candidate_name || row.candidate_code || "—"
    },
    {
      field: "candidate_code",
      headerName: "Code",
      width: 120,
      valueGetter: (value, row) => row.candidate_code || "—"
    },
    {
      field: "stage_name",
      headerName: "Stage",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <StatusChip status={normalizeStage(params.value) || params.value || "—"} />
      )
    },
    {
      field: "source_type",
      headerName: "Source",
      width: 120,
      valueGetter: (value, row) => row.source_type || "—"
    },
    {
      field: "actions",
      headerName: "Action",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={(event) => {
            event.stopPropagation();
            handleScheduleInterview(params.row);
          }}
          sx={{ textTransform: "none", fontWeight: 600, py: 0.25 }}
        >
          Schedule Interview
        </Button>
      )
    }
  ];

  return (
    <Box>
      <EnterpriseWorkspaceHeader
        title="Requisition Details"
        subtitle="Recruiter working view for an assigned requisition"
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/recruiter/my-requisitions")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadDetails}
              disabled={isLoading}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Stack>
        }
      />

      {isLoading ? (
        <LoadingState message="Loading requisition details…" />
      ) : loadError || !requisition ? (
        <EmptyState
          icon={AssignmentOutlinedIcon}
          title="Requisition unavailable"
          description={loadError || "Requisition not found."}
          actionLabel="Back to My Requisitions"
          onAction={() => navigate("/recruiter/my-requisitions")}
        />
      ) : (
        <Stack spacing={1.5}>
          <RequisitionSummaryHero requisition={requisition} />

          <EnterpriseCard
            title="Pipeline Summary"
            subtitle="Candidate counts by stage for this requisition"
          >
            <PipelineStageMetricCards metrics={pipelineMetrics} />
          </EnterpriseCard>

          <EnterpriseCard
            title="Assigned Candidates"
            subtitle={`${filteredCandidates.length} candidate${filteredCandidates.length === 1 ? "" : "s"}`}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mb: 1.5 }}
            >
              <SearchBar
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidates"
                width={320}
              />
            </Stack>

            {candidates.length === 0 ? (
              <EmptyState
                icon={PeopleOutlinedIcon}
                title="No assigned candidates"
                description="Candidates mapped to this requisition will appear here."
              />
            ) : filteredCandidates.length === 0 ? (
              <EmptyState
                icon={PeopleOutlinedIcon}
                title="No matching candidates"
                description="Try a different search term."
              />
            ) : (
              <EnterpriseDataGrid
                rows={filteredCandidates}
                columns={candidateColumns}
                getRowId={(row) =>
                  row.map_id ||
                  row.mapping_id ||
                  `${row.candidate_id}-${row.requisition_code}`
                }
                height={420}
                disableColumnMenu
                onRowClick={(params) => handleScheduleInterview(params.row)}
              />
            )}
          </EnterpriseCard>
        </Stack>
      )}
    </Box>
  );
}

export default RecruiterRequisitionDetailsPage;

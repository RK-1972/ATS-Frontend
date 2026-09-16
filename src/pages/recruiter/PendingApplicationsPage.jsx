import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import EnterpriseCard from "../../components/enterprise/framework/EnterpriseCard";
import EnterpriseWorkspaceHeader from "../../components/enterprise/framework/EnterpriseWorkspaceHeader";
import {
  EmptyState,
  EnterpriseDataGrid,
  LoadingState,
  SearchBar,
  StatusChip
} from "../../components/enterprise";
import recruitmentClient from "../../api/clients/recruitmentClient";

function formatAppliedDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function PendingApplicationsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    setActionError("");

    try {
      const response = await recruitmentClient.listPendingPortalApplications();
      const data = Array.isArray(response?.data) ? response.data : [];
      setRows(data);
    } catch (error) {
      setRows([]);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load pending applications."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    recruitmentClient
      .listPendingPortalApplications()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const data = Array.isArray(response?.data) ? response.data : [];
        setRows(data);
        setLoadError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setRows([]);
        setLoadError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load pending applications."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const query = String(search || "").trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [
        row.candidate_name,
        row.candidate_code,
        row.email_id,
        row.requisition_code,
        row.position_title,
        row.stage_name
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [rows, search]);

  const handleClaim = async (row) => {
    const mappingId = row?.mapping_id;

    if (!mappingId) {
      return;
    }

    setClaimingId(mappingId);
    setActionError("");

    try {
      const response = await recruitmentClient.claimPendingPortalApplication(mappingId);

      if (response?.success === false) {
        throw new Error(response.message || "Failed to accept application.");
      }

      const candidateId = response?.data?.candidate_id || row.candidate_id;

      if (candidateId) {
        navigate(`/candidates/${candidateId}`);
        return;
      }

      await loadApplications();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          error.message ||
          "Failed to accept application into your pipeline."
      );
    } finally {
      setClaimingId(null);
    }
  };

  const columns = [
    {
      field: "candidate_name",
      headerName: "Candidate",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (_, row) =>
        row.candidate_name || row.candidate_code || `ID ${row.candidate_id}`
    },
    {
      field: "email_id",
      headerName: "Email",
      flex: 1.2,
      minWidth: 180
    },
    {
      field: "requisition_code",
      headerName: "Requisition",
      flex: 1,
      minWidth: 130
    },
    {
      field: "position_title",
      headerName: "Position",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (value) => value || "—"
    },
    {
      field: "applied_on",
      headerName: "Applied",
      width: 130,
      valueGetter: (value) => formatAppliedDate(value)
    },
    {
      field: "stage_name",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <StatusChip status={params.value || "Applied"} variant="soft" />
      )
    },
    {
      field: "actions",
      headerName: "Action",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color="primary"
          disabled={claimingId === params.row.mapping_id}
          startIcon={<HowToRegOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={(event) => {
            event.stopPropagation();
            handleClaim(params.row);
          }}
          sx={{ textTransform: "none", fontWeight: 600, py: 0.25 }}
        >
          {claimingId === params.row.mapping_id
            ? "Accepting…"
            : "Accept into My Pipeline"}
        </Button>
      )
    }
  ];

  return (
    <Box>
      <EnterpriseWorkspaceHeader
        title="Pending Applications"
        subtitle="Candidate Portal applications awaiting acceptance on your assigned requisitions"
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadApplications}
            disabled={isLoading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>
        }
      />

      <EnterpriseCard
        title="Portal applications"
        subtitle={`${filteredRows.length} pending application${filteredRows.length === 1 ? "" : "s"}`}
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
            placeholder="Search candidates or requisitions"
            width={320}
          />
        </Stack>

        {actionError ? (
          <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
            {actionError}
          </Typography>
        ) : null}

        {isLoading ? (
          <LoadingState message="Loading pending applications…" />
        ) : loadError ? (
          <EmptyState
            icon={InboxOutlinedIcon}
            title="Unable to load applications"
            description={loadError}
            actionLabel="Retry"
            onAction={loadApplications}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={InboxOutlinedIcon}
            title="No pending applications"
            description="When candidates apply through the Candidate Portal on your assigned requisitions, they will appear here until you accept them into your pipeline."
          />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            icon={InboxOutlinedIcon}
            title="No matching applications"
            description="Try a different search term."
          />
        ) : (
          <EnterpriseDataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.mapping_id}
            height={520}
            disableColumnMenu
          />
        )}
      </EnterpriseCard>
    </Box>
  );
}

export default PendingApplicationsPage;

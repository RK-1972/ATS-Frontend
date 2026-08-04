import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
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
import candidateRepository from "../../repositories/candidateRepository";

function MyAssignedRequisitionsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");

  const loadRequisitions = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await candidateRepository.getMyRequisitions();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      setRows([]);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load assigned requisitions."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequisitions();
  }, [loadRequisitions]);

  const filteredRows = useMemo(() => {
    const query = String(search || "").trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [
        row.req_code,
        row.client_name,
        row.job_title,
        row.req_status,
        row.openings_count
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [rows, search]);

  const handleOpen = (row) => {
    const code = row?.req_code;
    if (!code) {
      return;
    }
    navigate(`/recruiter/my-requisitions/${encodeURIComponent(code)}`);
  };

  const columns = [
    {
      field: "req_code",
      headerName: "Requisition Code",
      flex: 1.1,
      minWidth: 140
    },
    {
      field: "client_name",
      headerName: "Client",
      flex: 1.2,
      minWidth: 140
    },
    {
      field: "job_title",
      headerName: "Job Title",
      flex: 1.4,
      minWidth: 160
    },
    {
      field: "openings_count",
      headerName: "Open Positions",
      width: 130,
      align: "center",
      headerAlign: "center"
    },
    {
      field: "req_status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => (
        <StatusChip status={params.value || "—"} />
      )
    },
    {
      field: "actions",
      headerName: "Action",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={(event) => {
            event.stopPropagation();
            handleOpen(params.row);
          }}
          sx={{ textTransform: "none", fontWeight: 600, py: 0.25 }}
        >
          Open
        </Button>
      )
    }
  ];

  return (
    <Box>
      <EnterpriseWorkspaceHeader
        title="My Assigned Requisitions"
        subtitle="Requisitions assigned to you for recruiting"
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadRequisitions}
            disabled={isLoading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>
        }
      />

      <EnterpriseCard
        title="Assigned requisitions"
        subtitle={`${filteredRows.length} requisition${filteredRows.length === 1 ? "" : "s"}`}
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
            placeholder="Search assigned requisitions"
            width={320}
          />
        </Stack>

        {isLoading ? (
          <LoadingState message="Loading your assigned requisitions…" />
        ) : loadError ? (
          <EmptyState
            icon={AssignmentOutlinedIcon}
            title="Unable to load requisitions"
            description={loadError}
            actionLabel="Retry"
            onAction={loadRequisitions}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={AssignmentOutlinedIcon}
            title="No assigned requisitions"
            description="When a TA Assigner assigns you to a requisition, it will appear here."
          />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            icon={AssignmentOutlinedIcon}
            title="No matching requisitions"
            description="Try a different search term."
          />
        ) : (
          <EnterpriseDataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) =>
              row.req_id ?? row.req_code ?? `${row.recruiter_code}-${row.assigned_on}`
            }
            height={520}
            disableColumnMenu
            onRowClick={(params) => handleOpen(params.row)}
          />
        )}
      </EnterpriseCard>
    </Box>
  );
}

export default MyAssignedRequisitionsPage;

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import WorkspaceLayout from "../../components/enterprise/WorkspaceLayout";
import AdminNavRail from "../../components/layout/AdminNavRail";
import RecruiterNavRail from "../../components/layout/RecruiterNavRail";
import EnterpriseCard from "../../components/enterprise/framework/EnterpriseCard";
import EnterpriseWorkspaceHeader from "../../components/enterprise/framework/EnterpriseWorkspaceHeader";
import EnterpriseConfirmationDialog from "../../components/enterprise/EnterpriseConfirmationDialog";
import {
  EmptyState,
  EnterpriseDataGrid,
  LoadingState,
  SearchBar,
  StatusChip
} from "../../components/enterprise";
import TalentDemandDraftService from "../../services/talentDemandDraftService";

function resolveEnterpriseNavRail(user) {
  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  if (workspace.showRecruitmentWorkspace || workspace.showInterviewWorkspace) {
    return <RecruiterNavRail loggedInUser={user} />;
  }

  return <AdminNavRail />;
}

function formatDateTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
}

function toStatusChipLabel(status) {
  if (!status) return "Draft";
  const normalized = String(status).trim();
  if (normalized.toUpperCase() === "DRAFT") return "Draft";
  return normalized
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function MyDraftsPage() {
  const navigate = useNavigate();
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (_error) {
      return null;
    }
  }, []);

  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState({ message: "", severity: "success" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDrafts = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await TalentDemandDraftService.listMyDrafts();
      setDrafts(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setDrafts([]);
      setToast({
        message:
          error.response?.data?.message || "Failed to load drafts.",
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const statusOptions = useMemo(() => {
    const unique = new Set(
      drafts
        .map((draft) => String(draft.status || "").toUpperCase())
        .filter(Boolean)
    );
    return ["ALL", ...Array.from(unique).sort()];
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drafts.filter((draft) => {
      const status = String(draft.status || "").toUpperCase();
      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        draft.draft_code,
        draft.job_title,
        draft.client_name,
        draft.hiring_manager,
        draft.status,
        draft.updated_by
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [drafts, search, statusFilter]);

  const handleContinueEditing = (draftId) => {
    navigate(`/requisitions?draftId=${encodeURIComponent(draftId)}`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.draft_id) return;

    setIsDeleting(true);

    try {
      await TalentDemandDraftService.deleteDraft(deleteTarget.draft_id);
      setToast({
        message: "Draft deleted successfully.",
        severity: "success"
      });
      setDeleteTarget(null);
      await loadDrafts();
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to delete draft.",
        severity: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      field: "draft_code",
      headerName: "Draft Code",
      flex: 1.1,
      minWidth: 150
    },
    {
      field: "job_title",
      headerName: "Position Title",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (_value, row) => row.job_title || "—"
    },
    {
      field: "client_name",
      headerName: "Client",
      flex: 1,
      minWidth: 130,
      valueGetter: (_value, row) => row.client_name || "—"
    },
    {
      field: "hiring_manager",
      headerName: "Hiring Manager",
      flex: 1,
      minWidth: 140,
      valueGetter: (_value, row) => row.hiring_manager || "—"
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <StatusChip status={toStatusChipLabel(params.row.status)} />
      )
    },
    {
      field: "updated_on",
      headerName: "Last Updated",
      flex: 1.1,
      minWidth: 160,
      valueGetter: (_value, row) => formatDateTime(row.updated_on)
    },
    {
      field: "updated_by",
      headerName: "Updated By",
      flex: 0.9,
      minWidth: 120,
      valueGetter: (_value, row) => row.updated_by || "—"
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={(event) => {
              event.stopPropagation();
              handleContinueEditing(params.row.draft_id);
            }}
            sx={{ textTransform: "none", fontWeight: 600, py: 0.25 }}
          >
            Continue Editing
          </Button>
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={(event) => {
              event.stopPropagation();
              setDeleteTarget(params.row);
            }}
            sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 1 }}
          >
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <WorkspaceLayout navRail={resolveEnterpriseNavRail(loggedInUser)}>
      <Box sx={{ bgcolor: "background.default" }}>
        <EnterpriseWorkspaceHeader
          title="My Drafts"
          subtitle="Resume and manage your Talent Demand draft documents"
          actions={
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshOutlinedIcon />}
                onClick={loadDrafts}
                disabled={isLoading}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/requisitions")}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                New Talent Demand
              </Button>
            </>
          }
        />

        <EnterpriseCard
          title="Draft documents"
          subtitle="Private work-in-progress Talent Demand requests"
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
              placeholder="Search drafts"
              width={320}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="my-drafts-status-filter-label">Status</InputLabel>
              <Select
                labelId="my-drafts-status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option === "ALL" ? "All statuses" : option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {isLoading ? (
            <LoadingState message="Loading your drafts…" />
          ) : drafts.length === 0 ? (
            <EmptyState
              icon={DescriptionOutlinedIcon}
              title="No drafts yet"
              description="Save a Talent Demand as a draft to see it here."
              actionLabel="Create Talent Demand"
              onAction={() => navigate("/requisitions")}
            />
          ) : filteredDrafts.length === 0 ? (
            <EmptyState
              icon={DescriptionOutlinedIcon}
              title="No matching drafts"
              description="Try a different search term or status filter."
            />
          ) : (
            <EnterpriseDataGrid
              rows={filteredDrafts}
              columns={columns}
              getRowId={(row) => row.draft_id}
              height={480}
              disableColumnMenu
            />
          )}
        </EnterpriseCard>
      </Box>

      <EnterpriseConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete draft?"
        message={
          deleteTarget
            ? `Soft-delete draft ${deleteTarget.draft_code || deleteTarget.draft_id}? You can no longer continue editing it after deletion.`
            : ""
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ message: "", severity: "success" })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </WorkspaceLayout>
  );
}

export default MyDraftsPage;

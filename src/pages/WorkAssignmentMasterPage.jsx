import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import API from "@/api/axios";
import AppHeader from "@/components/layout/AppHeader";
import AdminNavRail from "@/components/layout/AdminNavRail";
import WorkAssignmentFormDialog from "@/components/admin/WorkAssignmentFormDialog";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import {
  EmptyState,
  EnterpriseDataGrid,
  EnterpriseSurface,
  EnterpriseToolbar,
  LoadingState,
  SearchBar,
  StatusChip
} from "@/components/enterprise";

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return value;
}

/**
 * Enterprise Work Assignment Master — dense grid + create.
 */
function WorkAssignmentMasterPage() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "Admin";

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toast, setToast] = useState({ message: "", severity: "error" });
  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [actionsRow, setActionsRow] = useState(null);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    row: null,
    nextActive: null
  });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("work_assignments");
    localStorage.removeItem("work_assignment_status");
    localStorage.removeItem("workspace");
    navigate("/login");
  };

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await API.get("/work-assignments");
      setRows(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      setRows([]);
      setToast({
        message:
          error.response?.data?.message || "Failed to load work assignments.",
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const categoryOptions = useMemo(() => {
    const unique = new Set(
      rows
        .map((row) => String(row.category || "").trim())
        .filter(Boolean)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const businessModuleOptions = useMemo(() => {
    const unique = new Set(
      rows
        .map((row) => String(row.business_module || "").trim())
        .filter(Boolean)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const handleOpenCreate = () => {
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (isCreating) {
      return;
    }
    setCreateOpen(false);
    setCreateError("");
  };

  const handleCreateSubmit = async (payload) => {
    setIsCreating(true);
    setCreateError("");

    try {
      const response = await API.post("/work-assignments", payload);
      setCreateOpen(false);
      setToast({
        message:
          response.data?.message || "Work assignment created successfully.",
        severity: "success"
      });
      await loadAssignments();
    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Failed to create work assignment."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = useCallback((row) => {
    setEditError("");
    setEditTarget(row);
  }, []);

  const handleCloseEdit = () => {
    if (isUpdating) {
      return;
    }
    setEditTarget(null);
    setEditError("");
  };

  const handleEditSubmit = async (payload) => {
    if (!editTarget) {
      return;
    }

    // assignment_code is an immutable business key; PUT rejects it.
    const updatePayload = { ...payload };
    delete updatePayload.assignment_code;

    setIsUpdating(true);
    setEditError("");

    try {
      const response = await API.put(
        `/work-assignments/${editTarget.work_assignment_id}`,
        updatePayload
      );
      setEditTarget(null);
      setToast({
        message:
          response.data?.message || "Work assignment updated successfully.",
        severity: "success"
      });
      await loadAssignments();
    } catch (error) {
      setEditError(
        error.response?.data?.message || "Failed to update work assignment."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenActionsMenu = useCallback((event, row) => {
    event.stopPropagation();
    setActionsAnchor(event.currentTarget);
    setActionsRow(row);
  }, []);

  const handleCloseActionsMenu = () => {
    setActionsAnchor(null);
    setActionsRow(null);
  };

  const handleRequestStatusChange = (nextActive) => {
    const row = actionsRow;
    handleCloseActionsMenu();

    if (!row) {
      return;
    }

    if (!nextActive && Number(row.employees_assigned) > 0) {
      setToast({
        message:
          "Cannot deactivate a Work Assignment that is currently assigned to one or more employees.",
        severity: "error"
      });
      return;
    }

    setStatusDialog({
      open: true,
      row,
      nextActive
    });
  };

  const handleCloseStatusDialog = () => {
    if (isStatusUpdating) {
      return;
    }
    setStatusDialog({ open: false, row: null, nextActive: null });
  };

  const handleConfirmStatusChange = async () => {
    const { row, nextActive } = statusDialog;

    if (!row || nextActive === null || nextActive === undefined) {
      return;
    }

    setIsStatusUpdating(true);

    try {
      const response = await API.put(
        `/work-assignments/${row.work_assignment_id}`,
        { is_active: Boolean(nextActive) }
      );
      setStatusDialog({ open: false, row: null, nextActive: null });
      setToast({
        message:
          response.data?.message ||
          (nextActive
            ? "Work assignment activated successfully."
            : "Work assignment deactivated successfully."),
        severity: "success"
      });
      await loadAssignments();
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          (nextActive
            ? "Failed to activate work assignment."
            : "Failed to deactivate work assignment."),
        severity: "error"
      });
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      if (statusFilter === "active" && !row.is_active) {
        return false;
      }
      if (statusFilter === "inactive" && row.is_active) {
        return false;
      }

      if (
        categoryFilter !== "all" &&
        String(row.category || "").trim() !== categoryFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        row.assignment_code,
        row.assignment_name,
        row.business_module,
        row.category,
        row.workspace_route,
        row.workspace_flag,
        row.display_order
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rows, searchQuery, statusFilter, categoryFilter]);

  const columns = useMemo(
    () => [
      {
        field: "assignment_code",
        headerName: "Assignment Code",
        flex: 1.1,
        minWidth: 160,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}
          >
            {displayValue(params.value)}
          </Typography>
        )
      },
      {
        field: "assignment_name",
        headerName: "Assignment Name",
        flex: 1.2,
        minWidth: 160
      },
      {
        field: "business_module",
        headerName: "Business Module",
        flex: 0.9,
        minWidth: 120,
        valueFormatter: (value) => displayValue(value)
      },
      {
        field: "category",
        headerName: "Category",
        flex: 0.8,
        minWidth: 110,
        valueFormatter: (value) => displayValue(value)
      },
      {
        field: "workspace_route",
        headerName: "Workspace Route",
        flex: 1,
        minWidth: 140,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontSize: 12 }}
            color="text.secondary"
          >
            {displayValue(params.value)}
          </Typography>
        )
      },
      {
        field: "display_order",
        headerName: "Display Order",
        type: "number",
        width: 110,
        align: "center",
        headerAlign: "center"
      },
      {
        field: "is_active",
        headerName: "Active",
        width: 110,
        sortable: true,
        renderCell: (params) =>
          params.value ? (
            <StatusChip status="Active" variant="soft" />
          ) : (
            <Chip
              label="Inactive"
              size="small"
              variant="outlined"
              sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
            />
          )
      },
      {
        field: "system_defined",
        headerName: "System Defined",
        width: 140,
        sortable: true,
        renderCell: (params) =>
          params.value ? (
            <Chip
              icon={<LockOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              label="System"
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              —
            </Typography>
          )
      },
      {
        field: "employees_assigned",
        headerName: "Employees Assigned",
        type: "number",
        width: 150,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Badge
            badgeContent={Number(params.value) || 0}
            color="primary"
            showZero
            max={9999}
            sx={{
              "& .MuiBadge-badge": {
                position: "relative",
                transform: "none",
                fontWeight: 700,
                fontSize: 11,
                minWidth: 22,
                height: 22
              }
            }}
          />
        )
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 108,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
            <Tooltip title="Edit">
              <IconButton
                size="small"
                aria-label="Edit"
                onClick={() => handleOpenEdit(params.row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton
                size="small"
                aria-label="More actions"
                aria-haspopup="menu"
                onClick={(event) => handleOpenActionsMenu(event, params.row)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [handleOpenEdit, handleOpenActionsMenu]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <AppHeader
        loggedInUser={loggedInUser}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <Box sx={{ display: "flex", flex: 1 }}>
        <AdminNavRail />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.5 },
            maxWidth: 1480
          }}
        >
          <ConfigPageHeader
            title="Work Assignments"
            subtitle="Define enterprise work assignments that control workspace access across OPTALYNX."
            breadcrumbs={[
              { label: "Administration" },
              { label: "Master Data" },
              { label: "Work Assignments" }
            ]}
            statusChip={
              <Chip
                label={`${filteredRows.length} records`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            }
            actions={
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={loadAssignments}
                  disabled={isLoading}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddOutlinedIcon />}
                  onClick={handleOpenCreate}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  New Work Assignment
                </Button>
              </Stack>
            }
          />

          <EnterpriseSurface
            sx={{
              mb: 2,
              pt: 2,
              pb: 1.5,
              px: 1.5,
              overflow: "visible",
              position: "relative",
              zIndex: 1
            }}
          >
            <EnterpriseToolbar
              left={
                <>
                  <FilterListOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: "uppercase", mr: 1 }}
                  >
                    Filters
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="wa-status-filter-label">Status</InputLabel>
                    <Select
                      labelId="wa-status-filter-label"
                      label="Status"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="wa-category-filter-label">
                      Category
                    </InputLabel>
                    <Select
                      labelId="wa-category-filter-label"
                      label="Category"
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(event.target.value)
                      }
                    >
                      <MenuItem value="all">All</MenuItem>
                      {categoryOptions.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              }
            />
          </EnterpriseSurface>

          <Box
            sx={{
              mb: 2,
              position: "relative",
              zIndex: 1
            }}
          >
            <EnterpriseToolbar
              left={
                <SearchBar
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search work assignments"
                  width={320}
                />
              }
              right={
                <Typography variant="caption" color="text.secondary">
                  {isLoading
                    ? "Loading…"
                    : `${filteredRows.length} of ${rows.length} shown`}
                </Typography>
              }
            />
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 0,
              width: "100%",
              isolation: "isolate"
            }}
          >
            {isLoading ? (
              <EnterpriseSurface sx={{ minHeight: 360 }}>
                <LoadingState message="Loading work assignments…" />
              </EnterpriseSurface>
            ) : filteredRows.length === 0 ? (
              <EnterpriseSurface sx={{ minHeight: 360 }}>
                <EmptyState
                  title="No work assignments found"
                  description={
                    rows.length === 0
                      ? "No work assignment master records are available."
                      : "Try a different search term or filter."
                  }
                />
              </EnterpriseSurface>
            ) : (
              <EnterpriseDataGrid
                rows={filteredRows}
                columns={columns}
                getRowId={(row) => row.work_assignment_id}
                height={520}
                disableColumnMenu
                sx={{
                  // Avoid clipping the dense column-header row under adjacent toolbars.
                  overflow: "visible"
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <WorkAssignmentFormDialog
        open={createOpen}
        mode="create"
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
        isSaving={isCreating}
        businessModuleOptions={businessModuleOptions}
        submitError={createError}
      />

      <WorkAssignmentFormDialog
        open={Boolean(editTarget)}
        mode="edit"
        initialValue={editTarget}
        onClose={handleCloseEdit}
        onSubmit={handleEditSubmit}
        isSaving={isUpdating}
        businessModuleOptions={businessModuleOptions}
        submitError={editError}
      />

      <Menu
        anchorEl={actionsAnchor}
        open={Boolean(actionsAnchor)}
        onClose={handleCloseActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {actionsRow?.is_active ? (
          <MenuItem onClick={() => handleRequestStatusChange(false)}>
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleRequestStatusChange(true)}>
            Activate
          </MenuItem>
        )}
      </Menu>

      <EnterpriseConfirmationDialog
        open={statusDialog.open}
        title={
          statusDialog.nextActive
            ? "Activate Work Assignment?"
            : "Deactivate Work Assignment?"
        }
        message={
          statusDialog.row
            ? statusDialog.nextActive
              ? `Activate “${statusDialog.row.assignment_name || statusDialog.row.assignment_code}”? It will become available for employee assignment and workspace resolution.`
              : `Deactivate “${statusDialog.row.assignment_name || statusDialog.row.assignment_code}”? It will no longer be available for new employee assignments or workspace resolution.`
            : ""
        }
        confirmLabel={statusDialog.nextActive ? "Activate" : "Deactivate"}
        confirmColor={statusDialog.nextActive ? "primary" : "warning"}
        loading={isStatusUpdating}
        onConfirm={handleConfirmStatusChange}
        onClose={handleCloseStatusDialog}
      />

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "error" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ message: "", severity: "error" })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default WorkAssignmentMasterPage;

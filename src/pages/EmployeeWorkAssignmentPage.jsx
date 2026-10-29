import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Chip,
  List,
  ListItemButton,
  Snackbar,
  Stack,
  Switch,
  Typography
} from "@mui/material";

import API from "../api/axios";
import AdminNavRail from "../components/layout/AdminNavRail";
import Header from "../components/Header";
import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import {
  EmptyState,
  EnterpriseDataGrid,
  EnterpriseSurface,
  LoadingState,
  SearchBar
} from "@/components/enterprise";
import { filterActiveEmployeeRecords } from "../utils/activeEmployeeFilters";
import { refreshWorkspaceSession } from "../utils/sessionWorkspaceRefresh";

function employeeInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

async function maybeRefreshSelfWorkspace(employeeCode) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.employee_code === employeeCode) {
      await refreshWorkspaceSession();
    }
  } catch (_error) {
    // ignore parse errors
  }
}

function EmployeeWorkAssignmentPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [masterAssignments, setMasterAssignments] = useState([]);
  const [assignedRows, setAssignedRows] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [busyAssignmentId, setBusyAssignmentId] = useState(null);
  const assignmentMutationInFlightRef = useRef(false);
  const [toast, setToast] = useState({ message: "", severity: "success" });

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      setLoadError("");

      try {
        const response = await API.get("/users");
        const rows = filterActiveEmployeeRecords(response.data?.data || []);
        setEmployees(rows);

        if (rows.length > 0) {
          setSelectedUserId(rows[0].user_id);
        }
      } catch (error) {
        setEmployees([]);
        setSelectedUserId(null);
        setLoadError(
          error.response?.data?.message || "Failed to load employees."
        );
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const response = await API.get("/work-assignments/active");
        setMasterAssignments(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
      } catch (_error) {
        setMasterAssignments([]);
      }
    };

    loadMasters();
  }, []);

  const selectedEmployee = useMemo(
    () =>
      employees.find((employee) => employee.user_id === selectedUserId) || null,
    [employees, selectedUserId]
  );

  const loadEmployeeAssignments = useCallback(async (employeeCode) => {
    if (!employeeCode) {
      setAssignedRows([]);
      return;
    }

    setIsLoadingAssignments(true);

    try {
      const response = await API.get(
        `/employee-work-assignments/${encodeURIComponent(employeeCode)}`
      );
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setAssignedRows(rows.filter((row) => row.is_active !== false));
    } catch (error) {
      setAssignedRows([]);
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to load employee work assignments.",
        severity: "error"
      });
    } finally {
      setIsLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    loadEmployeeAssignments(selectedEmployee?.employee_code);
  }, [selectedEmployee?.employee_code, loadEmployeeAssignments]);

  const filteredEmployees = useMemo(() => {
    const query = employeeSearchQuery.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const name = String(employee.full_name || "").toLowerCase();
      const code = String(employee.employee_code || "").toLowerCase();
      const role = String(employee.role_name || "").toLowerCase();

      return (
        name.includes(query) || code.includes(query) || role.includes(query)
      );
    });
  }, [employees, employeeSearchQuery]);

  const assignedByWorkAssignmentId = useMemo(() => {
    const map = new Map();
    assignedRows.forEach((row) => {
      map.set(Number(row.work_assignment_id), row);
    });
    return map;
  }, [assignedRows]);

  const assignmentGridRows = useMemo(() => {
    return masterAssignments.map((master) => {
      const workAssignmentId = Number(master.work_assignment_id);
      const assigned = assignedByWorkAssignmentId.get(workAssignmentId);

      return {
        id: workAssignmentId,
        work_assignment_id: workAssignmentId,
        assignment_name: master.assignment_name || master.assignment_code,
        assignment_code: master.assignment_code,
        category: master.category || master.business_module || "—",
        enabled: Boolean(assigned),
        employee_work_assignment_id:
          assigned?.employee_work_assignment_id ?? null
      };
    });
  }, [masterAssignments, assignedByWorkAssignmentId]);

  const enabledCount = useMemo(
    () => assignmentGridRows.filter((row) => row.enabled).length,
    [assignmentGridRows]
  );

  const disabledCount = useMemo(
    () => assignmentGridRows.filter((row) => !row.enabled).length,
    [assignmentGridRows]
  );

  const runAssignmentMutation = useCallback(
    async (busyKey, mutation) => {
      if (assignmentMutationInFlightRef.current || !selectedEmployee?.employee_code) {
        return false;
      }

      assignmentMutationInFlightRef.current = true;
      setBusyAssignmentId(busyKey);

      try {
        await mutation();
        return true;
      } finally {
        assignmentMutationInFlightRef.current = false;
        setBusyAssignmentId(null);
      }
    },
    [selectedEmployee?.employee_code]
  );

  const handleAssign = useCallback(
    async (workAssignmentId) => {
      const employeeCode = selectedEmployee?.employee_code;
      const normalizedWorkAssignmentId = Number(workAssignmentId);

      if (!employeeCode || !Number.isFinite(normalizedWorkAssignmentId)) {
        return;
      }

      if (assignedByWorkAssignmentId.has(normalizedWorkAssignmentId)) {
        setToast({
          message: "Employee already has this work assignment.",
          severity: "error"
        });
        return;
      }

      try {
        await runAssignmentMutation(normalizedWorkAssignmentId, async () => {
          await API.post("/employee-work-assignments", {
            employee_code: employeeCode,
            work_assignment_id: normalizedWorkAssignmentId,
            effective_from: new Date().toISOString().slice(0, 10),
            effective_to: null
          });

          setToast({
            message: "Work assignment assigned successfully.",
            severity: "success"
          });
          await loadEmployeeAssignments(employeeCode);
          await maybeRefreshSelfWorkspace(employeeCode);
        });
      } catch (error) {
        setToast({
          message:
            error.response?.data?.message || "Failed to assign work assignment.",
          severity: "error"
        });
      }
    },
    [
      assignedByWorkAssignmentId,
      loadEmployeeAssignments,
      runAssignmentMutation,
      selectedEmployee?.employee_code
    ]
  );

  const handleRemove = useCallback(
    async (employeeWorkAssignmentId, workAssignmentIdForBusy = null) => {
      const normalizedEmployeeWorkAssignmentId = String(
        employeeWorkAssignmentId ?? ""
      ).trim();
      const busyKey = workAssignmentIdForBusy ?? normalizedEmployeeWorkAssignmentId;

      if (!normalizedEmployeeWorkAssignmentId) {
        return;
      }

      try {
        await runAssignmentMutation(busyKey, async () => {
          await API.delete(
            `/employee-work-assignments/${encodeURIComponent(normalizedEmployeeWorkAssignmentId)}`
          );

          setToast({
            message: "Work assignment removed successfully.",
            severity: "success"
          });
          await loadEmployeeAssignments(selectedEmployee?.employee_code);
          await maybeRefreshSelfWorkspace(selectedEmployee?.employee_code);
        });
      } catch (error) {
        setToast({
          message:
            error.response?.data?.message || "Failed to remove work assignment.",
          severity: "error"
        });
      }
    },
    [loadEmployeeAssignments, runAssignmentMutation, selectedEmployee?.employee_code]
  );

  const handleAccessToggle = useCallback(
    async (row, nextEnabled) => {
      if (!selectedEmployee?.employee_code || assignmentMutationInFlightRef.current) {
        return;
      }

      if (nextEnabled === Boolean(row.enabled)) {
        return;
      }

      if (nextEnabled) {
        await handleAssign(row.work_assignment_id);
        return;
      }

      await handleRemove(row.employee_work_assignment_id, row.work_assignment_id);
    },
    [handleAssign, handleRemove, selectedEmployee?.employee_code]
  );

  const assignmentColumns = useMemo(
    () => [
      {
        field: "assignment_name",
        headerName: "Work Assignment",
        flex: 1.2,
        minWidth: 180
      },
      {
        field: "assignment_code",
        headerName: "Code",
        flex: 1,
        minWidth: 160
      },
      {
        field: "category",
        headerName: "Category",
        flex: 0.8,
        minWidth: 120
      },
      {
        field: "access",
        headerName: "Access",
        width: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const row = params.row;
          const isBusy =
            busyAssignmentId != null &&
            (busyAssignmentId === row.work_assignment_id ||
              (row.employee_work_assignment_id != null &&
                busyAssignmentId === row.employee_work_assignment_id));
          const switchDisabled = !selectedEmployee?.employee_code || isBusy;

          return (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.75, height: "100%" }}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Switch
                size="small"
                checked={Boolean(row.enabled)}
                disabled={switchDisabled}
                onChange={(event) => {
                  event.stopPropagation();
                  void handleAccessToggle(row, event.target.checked);
                }}
                inputProps={{
                  "aria-label": `${row.assignment_name} access`
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {row.enabled ? "On" : "Off"}
              </Typography>
            </Box>
          );
        }
      }
    ],
    [
      busyAssignmentId,
      handleAccessToggle,
      selectedEmployee?.employee_code
    ]
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
      <Header />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AdminNavRail />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: 1480,
            mx: "auto",
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.5 },
            width: "100%"
          }}
        >
          <ConfigPageHeader
            title="Employee Work Assignments"
            subtitle="Enable only the workspaces each employee needs."
            breadcrumbs={[
              { label: "Administration" },
              { label: "Access Management" }
            ]}
            statusChip={
              selectedEmployee ? (
                <Chip
                  label={`${assignmentGridRows.length} assignments available`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ) : null
            }
          />

          {loadError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          ) : null}

          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            <EnterpriseSurface sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Employees
              </Typography>

              <SearchBar
                value={employeeSearchQuery}
                onChange={(event) => setEmployeeSearchQuery(event.target.value)}
                placeholder="Search employee or code"
                width="100%"
              />

              {isLoadingEmployees ? (
                <LoadingState message="Loading employees…" />
              ) : filteredEmployees.length === 0 ? (
                <EmptyState
                  title="No employees found"
                  description="Try a different search or verify user access."
                />
              ) : (
                <List dense sx={{ maxHeight: 520, overflow: "auto", mt: 1.5 }}>
                  {filteredEmployees.map((employee) => (
                    <ListItemButton
                      key={employee.user_id}
                      selected={employee.user_id === selectedUserId}
                      onClick={() => setSelectedUserId(employee.user_id)}
                      sx={{ borderRadius: 2, mb: 0.5, py: 0.75 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {employee.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.employee_code} · {employee.role_name}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              )}
            </EnterpriseSurface>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {selectedEmployee ? (
                <EnterpriseSurface
                  sx={{
                    mb: 1.5,
                    py: 1.25,
                    px: 1.5,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderColor: "primary.dark"
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontSize: 14,
                          fontWeight: 700
                        }}
                      >
                        {employeeInitials(selectedEmployee.full_name)}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {selectedEmployee.full_name}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {selectedEmployee.employee_code} · {selectedEmployee.role_name}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      label={`${enabledCount} enabled · ${disabledCount} disabled`}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.16)",
                        color: "inherit",
                        fontWeight: 600
                      }}
                    />
                  </Stack>
                </EnterpriseSurface>
              ) : (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  Select an employee to manage work assignments.
                </Alert>
              )}

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Enabled: {enabledCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Disabled: {disabledCount}
                </Typography>
              </Stack>

              {!selectedEmployee ? null : assignmentGridRows.length === 0 && !isLoadingAssignments ? (
                <EmptyState
                  title="No work assignments available"
                  description="Active work assignment master records are required before access can be granted."
                />
              ) : (
                <EnterpriseDataGrid
                  rows={assignmentGridRows}
                  columns={assignmentColumns}
                  loading={isLoadingAssignments}
                  height={Math.min(560, Math.max(320, assignmentGridRows.length * 36 + 56))}
                  disableRowSelectionOnClick
                  initialState={{
                    pagination: { paginationModel: { pageSize: 25 } }
                  }}
                  pageSizeOptions={[10, 25, 50]}
                />
              )}

              <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                Switches reflect persisted employee access. Turning a switch on assigns
                immediately; turning it off removes that assignment using the existing
                workflow.
              </Alert>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ message: "", severity: "success" })}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployeeWorkAssignmentPage;

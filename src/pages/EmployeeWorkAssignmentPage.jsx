import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import API from "../api/axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

function InfoField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function EmployeeWorkAssignmentPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [masterAssignments, setMasterAssignments] = useState([]);
  const [assignedRows, setAssignedRows] = useState([]);
  const [selectedAvailableId, setSelectedAvailableId] = useState(null);
  const [selectedAssignedId, setSelectedAssignedId] = useState(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [toast, setToast] = useState({ message: "", severity: "success" });

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      setLoadError("");

      try {
        // Existing admin employee directory API (no /employees endpoint).
        const response = await API.get("/users");
        const rows = response.data?.data || [];
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
      setSelectedAssignedId(null);
      setSelectedAvailableId(null);
      return;
    }

    setIsLoadingAssignments(true);

    try {
      const response = await API.get(
        `/employee-work-assignments/${encodeURIComponent(employeeCode)}`
      );
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setAssignedRows(rows.filter((row) => row.is_active !== false));
      setSelectedAssignedId(null);
      setSelectedAvailableId(null);
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
    const query = searchQuery.trim().toLowerCase();

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
  }, [employees, searchQuery]);

  const assignedWorkAssignmentIds = useMemo(() => {
    return new Set(
      assignedRows.map((row) => Number(row.work_assignment_id)).filter(Boolean)
    );
  }, [assignedRows]);

  const availableAssignments = useMemo(() => {
    return masterAssignments.filter(
      (row) => !assignedWorkAssignmentIds.has(Number(row.work_assignment_id))
    );
  }, [masterAssignments, assignedWorkAssignmentIds]);

  const handleAssign = async () => {
    const employeeCode = selectedEmployee?.employee_code;
    const workAssignmentId = selectedAvailableId;

    if (!employeeCode || !workAssignmentId) {
      return;
    }

    if (assignedWorkAssignmentIds.has(Number(workAssignmentId))) {
      setToast({
        message: "Employee already has this work assignment.",
        severity: "error"
      });
      return;
    }

    setIsAssigning(true);

    try {
      await API.post("/employee-work-assignments", {
        employee_code: employeeCode,
        work_assignment_id: workAssignmentId,
        effective_from: new Date().toISOString().slice(0, 10),
        effective_to: null
      });

      setToast({
        message: "Work assignment assigned successfully.",
        severity: "success"
      });
      await loadEmployeeAssignments(employeeCode);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to assign work assignment.",
        severity: "error"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedAssignedId) {
      return;
    }

    setIsRemoving(true);

    try {
      await API.delete(
        `/employee-work-assignments/${encodeURIComponent(selectedAssignedId)}`
      );

      setToast({
        message: "Work assignment removed successfully.",
        severity: "success"
      });
      await loadEmployeeAssignments(selectedEmployee?.employee_code);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to remove work assignment.",
        severity: "error"
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2, py: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Employee Work Assignments
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Assign Enterprise Work Assignments to employees for workspace access.
        </Typography>

        {loadError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        ) : null}

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                Employees
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Search employees"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchOutlinedIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  )
                }}
                sx={{ mb: 1.5 }}
              />

              {isLoadingEmployees ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <List dense sx={{ maxHeight: 560, overflow: "auto" }}>
                  {filteredEmployees.map((employee) => (
                    <ListItemButton
                      key={employee.user_id}
                      selected={employee.user_id === selectedUserId}
                      onClick={() => setSelectedUserId(employee.user_id)}
                      sx={{ borderRadius: 2, mb: 0.5 }}
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
            </CardContent>
          </Card>

          <Card sx={{ flex: 1.2, minWidth: 0 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Assignment Panel
              </Typography>

              {selectedEmployee ? (
                <Stack spacing={1} mb={2}>
                  <InfoField label="Employee" value={selectedEmployee.full_name} />
                  <InfoField
                    label="Employee Code"
                    value={selectedEmployee.employee_code}
                  />
                  <InfoField label="Role" value={selectedEmployee.role_name} />
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Select an employee to manage work assignments.
                </Typography>
              )}

              <Divider sx={{ mb: 2 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="stretch"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Assigned Work Assignments
                  </Typography>

                  {isLoadingAssignments ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : assignedRows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No active assignments.
                    </Typography>
                  ) : (
                    <List dense sx={{ maxHeight: 280, overflow: "auto" }}>
                      {assignedRows.map((row) => (
                        <ListItemButton
                          key={row.employee_work_assignment_id}
                          selected={
                            Number(selectedAssignedId) ===
                            Number(row.employee_work_assignment_id)
                          }
                          onClick={() =>
                            setSelectedAssignedId(
                              row.employee_work_assignment_id
                            )
                          }
                          sx={{ borderRadius: 2, mb: 0.5 }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {row.assignment_name || row.assignment_code}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.assignment_code}
                              {row.business_module
                                ? ` · ${row.business_module}`
                                : ""}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
                    disabled={!selectedAssignedId || isRemoving}
                    onClick={handleRemove}
                  >
                    {isRemoving ? "Removing…" : "Remove"}
                  </Button>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Available Work Assignments
                  </Typography>

                  {availableAssignments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No available assignments to assign.
                    </Typography>
                  ) : (
                    <List dense sx={{ maxHeight: 280, overflow: "auto" }}>
                      {availableAssignments.map((row) => (
                        <ListItemButton
                          key={row.work_assignment_id}
                          selected={
                            Number(selectedAvailableId) ===
                            Number(row.work_assignment_id)
                          }
                          onClick={() =>
                            setSelectedAvailableId(row.work_assignment_id)
                          }
                          sx={{ borderRadius: 2, mb: 0.5 }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {row.assignment_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.assignment_code}
                              {row.business_module
                                ? ` · ${row.business_module}`
                                : ""}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
                    disabled={
                      !selectedEmployee?.employee_code ||
                      !selectedAvailableId ||
                      isAssigning
                    }
                    onClick={handleAssign}
                  >
                    {isAssigning ? "Assigning…" : "Assign"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
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

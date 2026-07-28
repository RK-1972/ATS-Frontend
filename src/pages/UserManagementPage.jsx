import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import API from "../api/axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  Snackbar,
  Alert,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const RAISE_REQUISITION_CODE = "RAISE_REQUISITION";
const RAISE_BUDGET_REQUEST_CODE = "RAISE_BUDGET_REQUEST";

function resolvePermissionEnabled(permissions, permissionCode) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  const permission = permissions.find(
    (row) =>
      String(row.permission_code || "").trim().toUpperCase() ===
      String(permissionCode || "").trim().toUpperCase()
  );

  return Boolean(permission?.is_enabled);
}

function buildPermissionPayload(raiseRequisitionEnabled, raiseBudgetRequestEnabled) {
  return [
    {
      permission_code: RAISE_REQUISITION_CODE,
      is_enabled: raiseRequisitionEnabled
    },
    {
      permission_code: RAISE_BUDGET_REQUEST_CODE,
      is_enabled: raiseBudgetRequestEnabled
    }
  ];
}

function InfoField({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [raiseRequisitionEnabled, setRaiseRequisitionEnabled] = useState(false);
  const [originalRaiseRequisitionEnabled, setOriginalRaiseRequisitionEnabled] =
    useState(false);
  const [raiseBudgetRequestEnabled, setRaiseBudgetRequestEnabled] = useState(false);
  const [originalRaiseBudgetRequestEnabled, setOriginalRaiseBudgetRequestEnabled] =
    useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [pendingSwitchUserId, setPendingSwitchUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", severity: "success" });

  const hasUnsavedChanges = useMemo(
    () =>
      raiseRequisitionEnabled !== originalRaiseRequisitionEnabled
      || raiseBudgetRequestEnabled !== originalRaiseBudgetRequestEnabled,
    [
      raiseRequisitionEnabled,
      originalRaiseRequisitionEnabled,
      raiseBudgetRequestEnabled,
      originalRaiseBudgetRequestEnabled
    ]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await API.get("/users");
        const rows = response.data?.data || [];
        setUsers(rows);

        if (rows.length > 0) {
          setSelectedUserId(rows[0].user_id);
        }
      } catch (error) {
        setLoadError(
          error.response?.data?.message || "Failed to load employees."
        );
        setUsers([]);
        setSelectedUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const selectedEmployee = useMemo(
    () => users.find((employee) => employee.user_id === selectedUserId) || null,
    [users, selectedUserId]
  );

  useEffect(() => {
    const employeeCode = selectedEmployee?.employee_code;

    if (!employeeCode) {
      return undefined;
    }

    let cancelled = false;

    const fetchPermissions = async () => {
      setIsLoadingPermissions(true);

      try {
        const response = await API.get(
          `/user-permissions/${encodeURIComponent(employeeCode)}`
        );
        const permissions = response.data?.data || [];
        const raiseRequisition = resolvePermissionEnabled(
          permissions,
          RAISE_REQUISITION_CODE
        );
        const raiseBudget = resolvePermissionEnabled(
          permissions,
          RAISE_BUDGET_REQUEST_CODE
        );

        if (!cancelled) {
          setRaiseRequisitionEnabled(raiseRequisition);
          setOriginalRaiseRequisitionEnabled(raiseRequisition);
          setRaiseBudgetRequestEnabled(raiseBudget);
          setOriginalRaiseBudgetRequestEnabled(raiseBudget);
        }
      } catch {
        if (!cancelled) {
          setRaiseRequisitionEnabled(false);
          setOriginalRaiseRequisitionEnabled(false);
          setRaiseBudgetRequestEnabled(false);
          setOriginalRaiseBudgetRequestEnabled(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPermissions(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [selectedEmployee?.employee_code]);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((employee) => {
      const name = String(employee.full_name || "").toLowerCase();
      const code = String(employee.employee_code || "").toLowerCase();
      const role = String(employee.role_name || "").toLowerCase();

      return (
        name.includes(query) ||
        code.includes(query) ||
        role.includes(query)
      );
    });
  }, [users, searchQuery]);

  const handleEmployeeSelect = (userId) => {
    if (userId === selectedUserId) {
      return;
    }

    if (!hasUnsavedChanges) {
      setSelectedUserId(userId);
      return;
    }

    setPendingSwitchUserId(userId);
    setUnsavedDialogOpen(true);
  };

  const handleCloseUnsavedDialog = () => {
    setUnsavedDialogOpen(false);
    setPendingSwitchUserId(null);
  };

  const persistPermissions = async ({ switchAfterSave = false } = {}) => {
    const employeeCode = selectedEmployee?.employee_code;

    if (!employeeCode) {
      return false;
    }

    setIsSaving(true);

    try {
      await API.put(
        `/user-permissions/${encodeURIComponent(employeeCode)}`,
        buildPermissionPayload(
          raiseRequisitionEnabled,
          raiseBudgetRequestEnabled
        )
      );

      setOriginalRaiseRequisitionEnabled(raiseRequisitionEnabled);
      setOriginalRaiseBudgetRequestEnabled(raiseBudgetRequestEnabled);
      setToast({
        message: "Permissions saved successfully.",
        severity: "success"
      });

      if (switchAfterSave && pendingSwitchUserId !== null) {
        setSelectedUserId(pendingSwitchUserId);
        handleCloseUnsavedDialog();
      }

      return true;
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to save permissions.",
        severity: "error"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogSave = async () => {
    await persistPermissions({ switchAfterSave: true });
  };

  const handleDialogDiscard = () => {
    if (pendingSwitchUserId !== null) {
      setSelectedUserId(pendingSwitchUserId);
    }
    handleCloseUnsavedDialog();
  };

  const handleMainSave = async () => {
    await persistPermissions();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          maxWidth: 1680,
          width: "100%",
          mx: "auto",
          px: { xs: 1.5, sm: 2 },
          py: 1.5
        }}
      >
        {/* Left — Employee Directory (~28%) */}
        <Box
          sx={{
            width: { xs: "100%", md: "28%" },
            maxWidth: { md: 320 },
            minWidth: { md: 260 },
            flexShrink: 0,
            borderRight: { md: 1 },
            borderColor: "divider",
            bgcolor: "background.paper",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            minHeight: 0
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Employee Directory
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Search Employee"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", mr: 0.75 }} />
                  )
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13
                }
              }}
            />
          </Box>

          <List disablePadding dense sx={{ flex: 1, overflow: "auto" }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={22} />
              </Box>
            ) : null}

            {!isLoading && loadError ? (
              <Typography variant="caption" color="error" sx={{ display: "block", px: 1.5, py: 1 }}>
                {loadError}
              </Typography>
            ) : null}

            {!isLoading && !loadError && filteredEmployees.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 1.5, py: 1 }}>
                No employees found.
              </Typography>
            ) : null}

            {!isLoading && !loadError
              ? filteredEmployees.map((employee) => {
                  const isSelected = employee.user_id === selectedUserId;

                  return (
                    <ListItemButton
                      key={employee.user_id}
                      selected={isSelected}
                      onClick={() => handleEmployeeSelect(employee.user_id)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        alignItems: "flex-start",
                        borderBottom: 1,
                        borderColor: "divider"
                      }}
                    >
                      <Stack direction="row" spacing={1.25} width="100%">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                            fontSize: 13
                          }}
                        >
                          {(employee.full_name?.[0] || "?").toUpperCase()}
                        </Avatar>

                        <Box minWidth={0} flex={1}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{ fontSize: 13 }}
                          >
                            {employee.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {employee.employee_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {employee.role_name}
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItemButton>
                  );
                })
              : null}
          </List>
        </Box>

        {/* Right — Permissions Workspace (~72%) */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            pl: { md: 2 },
            overflow: "auto"
          }}
        >
          <Stack spacing={1.75}>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                User Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Configure enterprise permissions for individual employees.
              </Typography>
            </Box>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
                  Enterprise Employee Information
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.25, sm: 2 }}
                  divider={
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ display: { xs: "none", sm: "block" } }}
                    />
                  }
                >
                  <InfoField label="Employee Code" value={selectedEmployee?.employee_code} />
                  <InfoField label="Employee Name" value={selectedEmployee?.full_name} />
                  <InfoField label="Role" value={selectedEmployee?.role_name} />
                  <InfoField
                    label="Status"
                    value={
                      selectedEmployee
                        ? selectedEmployee.is_active
                          ? "Active"
                          : "Inactive"
                        : "—"
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Recruitment Permissions
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>
                  Configure permissions assigned at the employee level.
                </Typography>

                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper"
                    }}
                  >
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Raise Requisition
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allows the employee to create new requisitions.
                      </Typography>
                    </Box>
                    <Switch
                      checked={raiseRequisitionEnabled}
                      disabled={isLoadingPermissions || !selectedEmployee}
                      onChange={(event) =>
                        setRaiseRequisitionEnabled(event.target.checked)
                      }
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper"
                    }}
                  >
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Raise Budget Request
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allows the employee to create and submit Budget Requests.
                      </Typography>
                    </Box>
                    <Switch
                      checked={raiseBudgetRequestEnabled}
                      disabled={isLoadingPermissions || !selectedEmployee}
                      onChange={(event) =>
                        setRaiseBudgetRequestEnabled(event.target.checked)
                      }
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.25 }}>
              <Button
                variant="contained"
                disabled={!hasUnsavedChanges || isLoadingPermissions || isSaving}
                onClick={handleMainSave}
                sx={{ minWidth: 160 }}
              >
                Save Permissions
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={unsavedDialogOpen}
        onClose={isSaving ? undefined : handleCloseUnsavedDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Unsaved Changes
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            You have unsaved permission changes. Would you like to save them before switching employees?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseUnsavedDialog}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleDialogDiscard}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleDialogSave}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 96 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}

export default UserManagementPage;

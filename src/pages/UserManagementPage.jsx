import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import AdminNavRail from "../components/layout/AdminNavRail";
import API from "../api/axios";
import AuthorizationService, {
  USER_ADMINISTRATOR_CODE,
  getProvisionableRoles
} from "../services/authorizationService";
import {
  Avatar,
  Autocomplete,
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
  Grid,
  List,
  ListItemButton,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { FramerDialogTransition } from "../theme/motionRenderer";

const CREATE_USER_DIALOG_MAX_WIDTH = 680;

const createUserNoAutofillHtmlInput = {
  "data-form-type": "other",
  "data-lpignore": "true",
  "data-1p-ignore": true
};

const createUserManualFieldInputProps = {
  employeeCode: {
    ...createUserNoAutofillHtmlInput,
    autoComplete: "off",
    name: "optalynx-provision-employee-code"
  },
  fullName: {
    ...createUserNoAutofillHtmlInput,
    autoComplete: "off",
    name: "optalynx-provision-full-name"
  },
  email: {
    ...createUserNoAutofillHtmlInput,
    autoComplete: "off",
    name: "optalynx-provision-email",
    inputMode: "email"
  },
  password: {
    ...createUserNoAutofillHtmlInput,
    autoComplete: "new-password",
    name: "optalynx-provision-password"
  },
  confirmPassword: {
    ...createUserNoAutofillHtmlInput,
    autoComplete: "new-password",
    name: "optalynx-provision-password-confirm"
  }
};

const createUserDenseFieldSx = {
  overflow: "visible",
  "& .MuiInputBase-root": {
    minHeight: 40,
    fontSize: 13,
    overflow: "visible"
  },
  "& .MuiInputLabel-root": {
    fontSize: 13,
    lineHeight: 1.2,
    "&.MuiInputLabel-shrink": {
      px: 0.5,
      backgroundColor: "background.paper"
    }
  },
  "& .MuiOutlinedInput-notchedOutline": {
    transition:
      "border-color var(--optalynx-motion-duration-fast) var(--optalynx-motion-easing-standard)"
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& .MuiOutlinedInput-notchedOutline": {
      transition: "none"
    }
  }
};

const createUserAssignmentSx = {
  ...createUserDenseFieldSx,
  "& .MuiAutocomplete-inputRoot": {
    minHeight: 40,
    py: 0.25,
    alignItems: "center",
    flexWrap: "wrap",
    gap: 0.5
  },
  "& .MuiChip-root": {
    height: 24,
    fontSize: 12,
    "& .MuiChip-label": {
      px: 0.75
    }
  }
};

const createUserAssignmentSlotProps = {
  popper: {
    placement: "bottom-start",
    sx: {
      zIndex: (theme) => theme.zIndex.modal + 2
    },
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 6]
        }
      },
      {
        name: "preventOverflow",
        options: {
          padding: 8,
          boundary: "viewport"
        }
      }
    ]
  },
  paper: {
    sx: {
      mt: 0,
      border: 1,
      borderColor: "divider",
      boxShadow: (theme) => theme.tokens?.shadows?.mid ?? theme.shadows[4]
    }
  },
  listbox: {
    sx: {
      maxHeight: 220,
      py: 0.25,
      "& .MuiAutocomplete-option": {
        alignItems: "flex-start",
        py: 0.75,
        minHeight: 36
      }
    }
  }
};

function sortWorkAssignments(rows) {
  return [...rows].sort((left, right) => {
    const orderLeft = Number(left.display_order ?? 0);
    const orderRight = Number(right.display_order ?? 0);

    if (orderLeft !== orderRight) {
      return orderLeft - orderRight;
    }

    return String(left.assignment_name || "").localeCompare(
      String(right.assignment_name || "")
    );
  });
}

function filterWorkAssignmentOptions(options, { inputValue }) {
  const query = inputValue.trim().toLowerCase();

  if (!query) {
    return options;
  }

  return options.filter((option) => {
    const name = String(option.assignment_name || "").toLowerCase();
    const code = String(option.assignment_code || "").toLowerCase();
    return name.includes(query) || code.includes(query);
  });
}

const createUserDialogButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  minHeight: 36,
  px: 2,
  transition:
    "background-color var(--optalynx-motion-duration-fast) var(--optalynx-motion-easing-standard), box-shadow var(--optalynx-motion-duration-fast) var(--optalynx-motion-easing-standard), opacity var(--optalynx-motion-duration-instant) var(--optalynx-motion-easing-standard)",
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none"
  }
};

const REQUISITION_REQUESTOR_ASSIGNMENT = "REQUISITION_REQUESTOR";
const BUDGET_REQUESTOR_ASSIGNMENT = "BUDGET_REQUESTOR";

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

function formatRoleHistoryTimestamp(value) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString();
}

function UserManagementPage() {
  const theme = useTheme();
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const isPlatformAdmin = loggedInUser?.role_name === "Admin";
  const provisionableRoles = getProvisionableRoles();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [masterAssignments, setMasterAssignments] = useState([]);
  const [createForm, setCreateForm] = useState({
    employee_code: "",
    full_name: "",
    email_id: "",
    password: "",
    confirm_password: "",
    role_name: provisionableRoles[0] || "Recruiter",
    work_assignments: []
  });
  const [createFormError, setCreateFormError] = useState("");
  const [toast, setToast] = useState({ message: "", severity: "success" });
  const [roleHistory, setRoleHistory] = useState([]);
  const [isLoadingRoleHistory, setIsLoadingRoleHistory] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [changeRoleForm, setChangeRoleForm] = useState({
    role_name: "",
    reason: ""
  });
  const [changeRoleError, setChangeRoleError] = useState("");
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogMode, setStatusDialogMode] = useState("deactivate");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [statusChangeError, setStatusChangeError] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await API.get("/users");
      const rows = response.data?.data || [];
      setUsers(rows);

      if (rows.length > 0) {
        setSelectedUserId((current) => current || rows[0].user_id);
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

  useEffect(() => {
    let cancelled = false;

    const initializePage = async () => {
      try {
        const allowed = await AuthorizationService.canAccessUserAdministration();

        if (cancelled) {
          return;
        }

        if (!allowed) {
          setAccessDenied(true);
          setCanCreateUser(false);
          return;
        }

        setAccessDenied(false);
        setCanCreateUser(true);
        await loadUsers();
      } catch {
        if (!cancelled) {
          setAccessDenied(true);
          setCanCreateUser(false);
        }
      }
    };

    initializePage();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!createDialogOpen) {
      return;
    }

    const loadAssignments = async () => {
      try {
        const response = await API.get("/work-assignments/active");
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const filtered = rows.filter((row) => {
          if (isPlatformAdmin) {
            return true;
          }

          return (
            String(row.assignment_code || "").trim().toUpperCase() !==
            USER_ADMINISTRATOR_CODE
          );
        });
        setMasterAssignments(filtered);
      } catch {
        setMasterAssignments([]);
      }
    };

    loadAssignments();
  }, [createDialogOpen, isPlatformAdmin]);

  const selectableAssignments = useMemo(() => {
    return sortWorkAssignments(
      masterAssignments.filter((row) => row.is_active !== false)
    );
  }, [masterAssignments]);

  const selectedEmployee = useMemo(
    () => users.find((employee) => employee.user_id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const isSelfSelectedEmployee = useMemo(() => {
    const actorCode = String(loggedInUser?.employee_code || "").trim();
    const subjectCode = String(selectedEmployee?.employee_code || "").trim();
    return Boolean(actorCode && subjectCode && actorCode === subjectCode);
  }, [loggedInUser?.employee_code, selectedEmployee?.employee_code]);

  const canChangePrimaryRole = Boolean(
    selectedEmployee && !isSelfSelectedEmployee && canCreateUser
  );

  const canChangeUserStatus = canChangePrimaryRole;

  const primaryRoleSelectOptions = useMemo(() => {
    const currentRole = selectedEmployee?.role_name;

    if (currentRole && !provisionableRoles.includes(currentRole)) {
      return [currentRole, ...provisionableRoles];
    }

    return provisionableRoles;
  }, [selectedEmployee?.role_name, provisionableRoles]);

  const loadRoleHistory = async (employeeCode) => {
    if (!employeeCode) {
      return [];
    }

    const response = await API.get(
      `/users/${encodeURIComponent(employeeCode)}/role-history`
    );
    return Array.isArray(response.data?.data) ? response.data.data : [];
  };

  const loadStatusHistory = async (employeeCode) => {
    if (!employeeCode) {
      return [];
    }

    const response = await API.get(
      `/users/${encodeURIComponent(employeeCode)}/status-history`
    );
    return Array.isArray(response.data?.data) ? response.data.data : [];
  };

  useEffect(() => {
    const employeeCode = selectedEmployee?.employee_code;

    if (!employeeCode) {
      return undefined;
    }

    let cancelled = false;

    const fetchEmployeeHistory = async () => {
      setIsLoadingRoleHistory(true);

      try {
        const [historyRows, statusRows] = await Promise.all([
          loadRoleHistory(employeeCode),
          loadStatusHistory(employeeCode)
        ]);

        if (!cancelled) {
          setRoleHistory(historyRows);
          setStatusHistory(statusRows);
        }
      } catch {
        if (!cancelled) {
          setRoleHistory([]);
          setStatusHistory([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRoleHistory(false);
        }
      }
    };

    fetchEmployeeHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedEmployee?.employee_code]);

  const refreshRoleHistory = async (employeeCode) => {
    if (!employeeCode) {
      setRoleHistory([]);
      return;
    }

    setIsLoadingRoleHistory(true);

    try {
      const historyRows = await loadRoleHistory(employeeCode);
      setRoleHistory(historyRows);
    } catch {
      setRoleHistory([]);
    } finally {
      setIsLoadingRoleHistory(false);
    }
  };

  const refreshStatusHistory = async (employeeCode) => {
    if (!employeeCode) {
      setStatusHistory([]);
      return;
    }

    try {
      const historyRows = await loadStatusHistory(employeeCode);
      setStatusHistory(historyRows);
    } catch {
      setStatusHistory([]);
    }
  };

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

    setSelectedUserId(userId);
  };

  const resetCreateForm = () => {
    setCreateForm({
      employee_code: "",
      full_name: "",
      email_id: "",
      password: "",
      confirm_password: "",
      role_name: provisionableRoles[0] || "Recruiter",
      work_assignments: []
    });
    setCreateFormError("");
  };

  const handleOpenCreateDialog = () => {
    resetCreateForm();
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    if (isCreatingUser) {
      return;
    }

    setCreateDialogOpen(false);
    resetCreateForm();
  };

  const handleOpenChangeRoleDialog = (presetRoleName = null) => {
    if (!selectedEmployee) {
      return;
    }

    setChangeRoleForm({
      role_name:
        presetRoleName ||
        selectedEmployee.role_name ||
        provisionableRoles[0] ||
        "Recruiter",
      reason: ""
    });
    setChangeRoleError("");
    setChangeRoleDialogOpen(true);
  };

  const handlePrimaryRoleSelection = (nextRole) => {
    if (!canChangePrimaryRole || !selectedEmployee) {
      return;
    }

    const normalizedRole = String(nextRole || "").trim();

    if (!normalizedRole || normalizedRole === selectedEmployee.role_name) {
      return;
    }

    handleOpenChangeRoleDialog(normalizedRole);
  };

  const handleCloseChangeRoleDialog = () => {
    if (isChangingRole) {
      return;
    }

    setChangeRoleDialogOpen(false);
    setChangeRoleError("");
  };

  const handleChangePrimaryRole = async () => {
    const employeeCode = selectedEmployee?.employee_code;
    const nextRole = String(changeRoleForm.role_name || "").trim();
    const reason = String(changeRoleForm.reason || "").trim();

    if (!employeeCode) {
      return;
    }

    if (!nextRole) {
      setChangeRoleError("New Role is required.");
      return;
    }

    if (nextRole === selectedEmployee.role_name) {
      setChangeRoleError("Select a different Primary Role.");
      return;
    }

    setIsChangingRole(true);
    setChangeRoleError("");

    try {
      const response = await API.post(
        `/users/${encodeURIComponent(employeeCode)}/primary-role`,
        {
          role_name: nextRole,
          reason: reason || undefined
        }
      );

      const updatedUser = response.data?.data?.user;

      if (updatedUser?.user_id) {
        setUsers((current) =>
          current.map((employee) =>
            employee.user_id === updatedUser.user_id
              ? { ...employee, role_name: updatedUser.role_name }
              : employee
          )
        );
      } else {
        await loadUsers();
      }

      await refreshRoleHistory(employeeCode);
      setChangeRoleDialogOpen(false);
      setToast({
        message:
          response.data?.message ||
          "Primary Role updated. The employee must sign in again for full role-dependent session behavior.",
        severity: "success"
      });
    } catch (error) {
      setChangeRoleError(
        error.response?.data?.message || "Failed to change Primary Role."
      );
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleOpenStatusDialog = (mode) => {
    if (!selectedEmployee || !canChangeUserStatus) {
      return;
    }

    setStatusDialogMode(mode);
    setStatusChangeReason("");
    setStatusChangeError("");
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    if (isChangingStatus) {
      return;
    }

    setStatusDialogOpen(false);
    setStatusChangeError("");
  };

  const handleChangeUserStatus = async () => {
    const employeeCode = selectedEmployee?.employee_code;
    const reason = String(statusChangeReason || "").trim();
    const endpoint =
      statusDialogMode === "activate" ? "activate" : "deactivate";

    if (!employeeCode) {
      return;
    }

    setIsChangingStatus(true);
    setStatusChangeError("");

    try {
      const response = await API.post(
        `/users/${encodeURIComponent(employeeCode)}/${endpoint}`,
        { reason: reason || undefined }
      );

      const updatedUser = response.data?.data?.user;

      if (updatedUser?.user_id) {
        setUsers((current) =>
          current.map((employee) =>
            employee.user_id === updatedUser.user_id
              ? { ...employee, is_active: updatedUser.is_active }
              : employee
          )
        );
      } else {
        await loadUsers();
      }

      await refreshStatusHistory(employeeCode);
      setStatusDialogOpen(false);
      setToast({
        message:
          response.data?.message ||
          (statusDialogMode === "activate"
            ? "User activated successfully."
            : "User deactivated successfully."),
        severity: "success"
      });
    } catch (error) {
      setStatusChangeError(
        error.response?.data?.message || "Failed to update account status."
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleCreateUser = async () => {
    setCreateFormError("");

    const employeeCode = createForm.employee_code.trim();
    const fullName = createForm.full_name.trim();
    const emailId = createForm.email_id.trim();
    const password = createForm.password;
    const confirmPassword = createForm.confirm_password;

    if (!employeeCode || !fullName || !emailId || !password) {
      setCreateFormError("Employee Code, Full Name, Email, and Password are required.");
      return;
    }

    if (password.length < 8) {
      setCreateFormError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setCreateFormError("Password and Confirm Password must match.");
      return;
    }

    setIsCreatingUser(true);

    try {
      const response = await API.post("/users/provision", {
        employee_code: employeeCode,
        full_name: fullName,
        email_id: emailId,
        password,
        role_name: createForm.role_name,
        work_assignment_ids: createForm.work_assignments.map(
          (row) => row.work_assignment_id
        )
      });

      const createdUser = response.data?.data?.user;

      setCreateDialogOpen(false);
      resetCreateForm();
      await loadUsers();

      if (createdUser?.user_id) {
        setSelectedUserId(createdUser.user_id);
      }

      setToast({
        message: "User created successfully.",
        severity: "success"
      });
    } catch (error) {
      setCreateFormError(
        error.response?.data?.message || "Failed to create user."
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (accessDenied) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
        <Header />
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
          <Alert severity="error" sx={{ maxWidth: 520 }}>
            You are not authorized to access User Administration.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AdminNavRail />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          minWidth: 0,
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
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1.5,
                flexWrap: "wrap"
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  User Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Configure enterprise permissions for individual employees.
                </Typography>
              </Box>

              {canCreateUser ? (
                <Button
                  variant="contained"
                  startIcon={<AddOutlinedIcon />}
                  onClick={handleOpenCreateDialog}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                >
                  Create User
                </Button>
              ) : null}
            </Box>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
                  Enterprise Employee Information
                </Typography>
                <Stack spacing={1.25}>
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

                  {canChangeUserStatus ? (
                    <Box>
                      <Button
                        variant="outlined"
                        color={
                          selectedEmployee?.is_active ? "error" : "primary"
                        }
                        onClick={() =>
                          handleOpenStatusDialog(
                            selectedEmployee?.is_active ? "deactivate" : "activate"
                          )
                        }
                        disabled={isChangingStatus || isChangingRole}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          minHeight: 40
                        }}
                      >
                        {selectedEmployee?.is_active
                          ? "Deactivate User"
                          : "Activate User"}
                      </Button>
                    </Box>
                  ) : null}

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "stretch", sm: "flex-end" }}
                  >
                    <TextField
                      select
                      label="Primary Role"
                      size="small"
                      fullWidth
                      value={selectedEmployee?.role_name || ""}
                      disabled={!canChangePrimaryRole || isChangingRole}
                      onChange={(event) =>
                        handlePrimaryRoleSelection(event.target.value)
                      }
                      sx={createUserDenseFieldSx}
                    >
                      {primaryRoleSelectOptions.map((role) => (
                        <MenuItem key={role} value={role} dense>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      variant="outlined"
                      onClick={() => handleOpenChangeRoleDialog()}
                      disabled={!canChangePrimaryRole || isChangingRole}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        minHeight: 40,
                        whiteSpace: "nowrap",
                        flexShrink: 0
                      }}
                    >
                      Change Primary Role
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Primary Role History
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.25 }}
                >
                  Immutable record of Primary Role changes for the selected employee.
                </Typography>

                {isLoadingRoleHistory ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={22} />
                  </Box>
                ) : !selectedEmployee ? (
                  <Typography variant="body2" color="text.secondary">
                    Select an employee to view role history.
                  </Typography>
                ) : roleHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No role history recorded yet.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small" aria-label="Primary role history">
                      <TableHead>
                        <TableRow>
                          <TableCell>Effective Date/Time</TableCell>
                          <TableCell>Previous Role</TableCell>
                          <TableCell>New Role</TableCell>
                          <TableCell>Changed By</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roleHistory.map((row) => (
                          <TableRow key={row.history_id}>
                            <TableCell>
                              {formatRoleHistoryTimestamp(row.effective_at)}
                            </TableCell>
                            <TableCell>{row.previous_role_name || "—"}</TableCell>
                            <TableCell>{row.new_role_name || "—"}</TableCell>
                            <TableCell>
                              {row.changed_by_name ||
                                row.changed_by_employee_code ||
                                "—"}
                            </TableCell>
                            <TableCell>{row.reason || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Account Status History
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.25 }}
                >
                  Immutable record of account activation and deactivation events.
                </Typography>

                {isLoadingRoleHistory ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={22} />
                  </Box>
                ) : !selectedEmployee ? (
                  <Typography variant="body2" color="text.secondary">
                    Select an employee to view account status history.
                  </Typography>
                ) : statusHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No account status history recorded yet.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small" aria-label="Account status history">
                      <TableHead>
                        <TableRow>
                          <TableCell>Effective Date/Time</TableCell>
                          <TableCell>Previous Status</TableCell>
                          <TableCell>New Status</TableCell>
                          <TableCell>Changed By</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statusHistory.map((row) => (
                          <TableRow key={row.history_id}>
                            <TableCell>
                              {formatRoleHistoryTimestamp(row.effective_at)}
                            </TableCell>
                            <TableCell>{row.previous_status || "—"}</TableCell>
                            <TableCell>{row.new_status || "—"}</TableCell>
                            <TableCell>
                              {row.changed_by_name ||
                                row.changed_by_employee_code ||
                                "—"}
                            </TableCell>
                            <TableCell>{row.reason || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Recruitment Capabilities
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>
                  Governed by active Work Assignments — not editable on this screen.
                </Typography>

                <Stack spacing={1}>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper"
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Create requisitions
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Requires active{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        {REQUISITION_REQUESTOR_ASSIGNMENT}
                      </Typography>{" "}
                      work assignment.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper"
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Create budget requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Requires active{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        {BUDGET_REQUESTOR_ASSIGNMENT}
                      </Typography>{" "}
                      work assignment.
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ mt: 1.5 }}
                >
                  <Button
                    component="a"
                    href="/employee-work-assignments"
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600, alignSelf: "flex-start" }}
                  >
                    Manage Employee Work Assignments
                  </Button>
                  {canCreateUser ? (
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleOpenCreateDialog}
                      sx={{ textTransform: "none", fontWeight: 600, alignSelf: "flex-start" }}
                    >
                      Or assign via Create User
                    </Button>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
      </Box>

      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth={false}
        slots={{ transition: FramerDialogTransition }}
        transitionDuration={{
          enter: theme.motion?.tokens?.duration?.enter ?? 280,
          exit: theme.motion?.tokens?.duration?.exit ?? 200
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: `min(100% - 32px, ${CREATE_USER_DIALOG_MAX_WIDTH}px)`,
            maxWidth: CREATE_USER_DIALOG_MAX_WIDTH,
            boxShadow: theme.tokens?.shadows?.mid ?? theme.shadows[4],
            m: 1.5,
            overflow: "visible"
          }
        }}
      >
        <DialogTitle
          sx={{
            px: 2,
            pt: 1,
            pb: 0.25
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ lineHeight: 1.25, letterSpacing: 0.1 }}
          >
            Create User
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.25, lineHeight: 1.3 }}
          >
            Provision a new employee account and optional work assignments.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 2, pt: 0, pb: 0.75, overflow: "visible" }}>
          <Box
            component="form"
            autoComplete="off"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
            }}
            sx={{ overflow: "visible" }}
          >
            <Box
              component="input"
              type="text"
              name="bogus-username-autofill-trap"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              sx={{
                position: "absolute",
                opacity: 0,
                height: 0,
                width: 0,
                p: 0,
                m: 0,
                border: 0,
                overflow: "hidden",
                pointerEvents: "none"
              }}
            />
            <Grid container spacing={1.5} sx={{ overflow: "visible" }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Employee Code"
                value={createForm.employee_code}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    employee_code: event.target.value
                  }))
                }
                fullWidth
                size="small"
                margin="none"
                sx={createUserDenseFieldSx}
                slotProps={{
                  htmlInput: createUserManualFieldInputProps.employeeCode
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                value={createForm.full_name}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    full_name: event.target.value
                  }))
                }
                fullWidth
                size="small"
                margin="none"
                sx={createUserDenseFieldSx}
                slotProps={{
                  htmlInput: createUserManualFieldInputProps.fullName
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                type="email"
                value={createForm.email_id}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    email_id: event.target.value
                  }))
                }
                fullWidth
                size="small"
                margin="none"
                sx={createUserDenseFieldSx}
                slotProps={{
                  htmlInput: createUserManualFieldInputProps.email
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Role"
                value={createForm.role_name}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    role_name: event.target.value
                  }))
                }
                fullWidth
                size="small"
                margin="none"
                sx={createUserDenseFieldSx}
              >
                {provisionableRoles.map((role) => (
                  <MenuItem key={role} value={role} dense>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Password"
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                fullWidth
                size="small"
                margin="none"
                sx={createUserDenseFieldSx}
                slotProps={{
                  htmlInput: createUserManualFieldInputProps.password
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Confirm Password"
                type="password"
                value={createForm.confirm_password}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    confirm_password: event.target.value
                  }))
                }
                fullWidth
                size="small"
                margin="none"
                sx={createUserDenseFieldSx}
                slotProps={{
                  htmlInput: createUserManualFieldInputProps.confirmPassword
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                size="small"
                options={selectableAssignments}
                value={createForm.work_assignments}
                onChange={(_event, value) =>
                  setCreateForm((current) => ({
                    ...current,
                    work_assignments: value
                  }))
                }
                getOptionLabel={(option) => option.assignment_name || ""}
                filterOptions={filterWorkAssignmentOptions}
                isOptionEqualToValue={(option, value) =>
                  option.work_assignment_id === value.work_assignment_id
                }
                limitTags={4}
                slotProps={createUserAssignmentSlotProps}
                renderOption={({ key, ...optionProps }, option) => (
                  <Box
                    component="li"
                    key={key}
                    {...optionProps}
                    sx={{ flexDirection: "column", alignItems: "flex-start" }}
                  >
                    <Typography variant="body2" fontSize={13} fontWeight={600}>
                      {option.assignment_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {option.assignment_code}
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Work Assignments"
                    placeholder="Select assignments"
                    size="small"
                    margin="none"
                    sx={createUserDenseFieldSx}
                  />
                )}
                sx={createUserAssignmentSx}
              />
            </Grid>

            {createFormError ? (
              <Grid size={{ xs: 12 }}>
                <Alert
                  severity="error"
                  sx={{
                    py: 0.25,
                    alignItems: "center",
                    "& .MuiAlert-message": { fontSize: 13 }
                  }}
                >
                  {createFormError}
                </Alert>
              </Grid>
            ) : null}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            py: 0.75,
            pt: 0.5,
            gap: 1,
            borderTop: 1,
            borderColor: "divider"
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleCloseCreateDialog}
            disabled={isCreatingUser}
            sx={{ ...createUserDialogButtonSx, minWidth: 72 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateUser}
            disabled={isCreatingUser}
            startIcon={
              <CircularProgress
                size={14}
                color="inherit"
                sx={{
                  opacity: isCreatingUser ? 1 : 0,
                  transition:
                    "opacity var(--optalynx-motion-duration-fast) var(--optalynx-motion-easing-standard)",
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none"
                  }
                }}
              />
            }
            sx={{
              ...createUserDialogButtonSx,
              minWidth: 112,
              "& .MuiButton-startIcon": {
                marginRight: isCreatingUser ? 0.75 : 0,
                marginLeft: 0,
                transition:
                  "margin-right var(--optalynx-motion-duration-fast) var(--optalynx-motion-easing-standard)",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none"
                }
              }
            }}
          >
            <Box
              component="span"
              sx={{
                opacity: isCreatingUser ? 0.9 : 1,
                transition:
                  "opacity var(--optalynx-motion-duration-fast) var(--optalynx-motion-easing-standard)",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none"
                }
              }}
            >
              {isCreatingUser ? "Creating..." : "Create User"}
            </Box>
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={changeRoleDialogOpen}
        onClose={handleCloseChangeRoleDialog}
        fullWidth
        maxWidth="xs"
        slots={{ transition: FramerDialogTransition }}
        transitionDuration={{
          enter: theme.motion?.tokens?.duration?.enter ?? 280,
          exit: theme.motion?.tokens?.duration?.exit ?? 200
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "min(100% - 32px, 480px)",
            maxWidth: 480,
            boxShadow: theme.tokens?.shadows?.mid ?? theme.shadows[4],
            m: 1.5,
            overflow: "visible"
          }
        }}
      >
        <DialogTitle sx={{ px: 2, pt: 1, pb: 0.25 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.25 }}>
            Change Primary Role
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.25, lineHeight: 1.3 }}
          >
            Update the employee&apos;s Primary Role and record the change in history.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 2, pt: 0.5, pb: 0.75, overflow: "visible" }}>
          <Stack spacing={1.25}>
            <TextField
              select
              label="New Role"
              size="small"
              fullWidth
              value={changeRoleForm.role_name}
              onChange={(event) =>
                setChangeRoleForm((current) => ({
                  ...current,
                  role_name: event.target.value
                }))
              }
              disabled={isChangingRole}
              sx={createUserDenseFieldSx}
            >
              {provisionableRoles.map((role) => (
                <MenuItem key={role} value={role} dense>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Reason"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={changeRoleForm.reason}
              onChange={(event) =>
                setChangeRoleForm((current) => ({
                  ...current,
                  reason: event.target.value
                }))
              }
              disabled={isChangingRole}
              placeholder="Optional"
              sx={createUserDenseFieldSx}
            />

            {changeRoleError ? (
              <Alert severity="error" sx={{ py: 0.25 }}>
                {changeRoleError}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 1.5, pt: 0.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseChangeRoleDialog}
            disabled={isChangingRole}
            sx={createUserDialogButtonSx}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePrimaryRole}
            disabled={isChangingRole}
            sx={createUserDialogButtonSx}
          >
            {isChangingRole ? "Changing..." : "Change Role"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        fullWidth
        maxWidth="xs"
        slots={{ transition: FramerDialogTransition }}
        transitionDuration={{
          enter: theme.motion?.tokens?.duration?.enter ?? 280,
          exit: theme.motion?.tokens?.duration?.exit ?? 200
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "min(100% - 32px, 480px)",
            maxWidth: 480,
            boxShadow: theme.tokens?.shadows?.mid ?? theme.shadows[4],
            m: 1.5,
            overflow: "visible"
          }
        }}
      >
        <DialogTitle sx={{ px: 2, pt: 1, pb: 0.25 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.25 }}>
            {statusDialogMode === "activate" ? "Activate User" : "Deactivate User"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.25, lineHeight: 1.3 }}
          >
            {statusDialogMode === "activate"
              ? "Restore this employee's account access and login ability."
              : "Deactivate this employee's account. Active sessions will no longer be authorized."}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 2, pt: 0.5, pb: 0.75, overflow: "visible" }}>
          <Stack spacing={1.25}>
            <TextField
              label="Reason"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={statusChangeReason}
              onChange={(event) => setStatusChangeReason(event.target.value)}
              disabled={isChangingStatus}
              placeholder="Optional"
              sx={createUserDenseFieldSx}
            />

            {statusChangeError ? (
              <Alert severity="error" sx={{ py: 0.25 }}>
                {statusChangeError}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 1.5, pt: 0.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseStatusDialog}
            disabled={isChangingStatus}
            sx={createUserDialogButtonSx}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={statusDialogMode === "activate" ? "primary" : "error"}
            onClick={handleChangeUserStatus}
            disabled={isChangingStatus}
            sx={createUserDialogButtonSx}
          >
            {isChangingStatus
              ? "Saving..."
              : statusDialogMode === "activate"
                ? "Activate User"
                : "Deactivate User"}
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

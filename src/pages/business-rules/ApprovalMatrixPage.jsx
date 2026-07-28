import { useEffect, useMemo, useState } from "react";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import API from "@/api/axios";
import useApprovalRoutes from "@/hooks/useApprovalRoutes";

function formatDateValue(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function formatUserOptionLabel(user) {
  if (!user) {
    return "";
  }

  const name = String(user.full_name || "").trim();
  const code = String(user.employee_code || "").trim();

  if (name && code) {
    return `${name} (${code})`;
  }

  return name || code || "";
}

function cloneRoutePayload(payload) {
  return {
    route: {
      ...(payload?.route || {})
    },
    steps: Array.isArray(payload?.steps)
      ? payload.steps.map((step) => ({ ...step }))
      : []
  };
}

function ApprovalStepCard({
  step,
  stepNumber,
  editable = false,
  canDelete = false,
  users = [],
  onChange,
  onDelete
}) {
  const displayStepNumber =
    stepNumber ?? step.step_no ?? step.sequence_no ?? "—";
  const approvalType = step.approval_type || "Approval Required";
  const primaryApprover = step.approver_employee_code || "";

  const selectedApprover =
    users.find(
      (user) => String(user.employee_code || "") === String(primaryApprover)
    ) ||
    (primaryApprover
      ? {
          employee_code: primaryApprover,
          full_name: ""
        }
      : null);

  const updateField = (field, value) => {
    if (!editable || !onChange) {
      return;
    }
    onChange({ ...step, [field]: value });
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.25, px: 1.5, "&:last-child": { pb: 1.25 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Approval Step {displayStepNumber}
          </Typography>
          {editable ? (
            <IconButton
              size="small"
              aria-label={`Remove Approval Step ${displayStepNumber}`}
              onClick={onDelete}
              disabled={!canDelete}
              sx={{ color: "error.main" }}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>

        <Stack spacing={1}>
          <FormControl size="small" fullWidth>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, fontWeight: 600 }}
            >
              Approval Type
            </Typography>
            <Select
              value={approvalType}
              disabled={!editable}
              onChange={(event) => updateField("approval_type", event.target.value)}
              sx={{ fontSize: 13 }}
            >
              <MenuItem value="Approval Required">Approval Required</MenuItem>
              <MenuItem value="Review Only">Review Only</MenuItem>
              <MenuItem value="Information Only">Information Only</MenuItem>
              {!["Approval Required", "Review Only", "Information Only"].includes(
                approvalType
              ) ? (
                <MenuItem value={approvalType}>{approvalType}</MenuItem>
              ) : null}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, fontWeight: 600 }}
            >
              Primary Approver
            </Typography>
            <Autocomplete
              size="small"
              options={users}
              disabled={!editable}
              value={selectedApprover}
              getOptionLabel={formatUserOptionLabel}
              isOptionEqualToValue={(option, value) =>
                String(option?.employee_code || "") ===
                String(value?.employee_code || "")
              }
              onChange={(_event, nextUser) => {
                updateField(
                  "approver_employee_code",
                  nextUser?.employee_code || ""
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={editable ? "Search employee" : undefined}
                  sx={{
                    "& .MuiOutlinedInput-input": {
                      fontSize: 13
                    }
                  }}
                />
              )}
            />
          </FormControl>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 0, sm: 1 }}
            flexWrap="wrap"
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(step.comments_required)}
                  disabled={!editable}
                  onChange={(event) =>
                    updateField("comments_required", event.target.checked)
                  }
                />
              }
              label={
                <Typography variant="body2">Comments Mandatory</Typography>
              }
              sx={{ mr: 1.5 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(step.allow_reject)}
                  disabled={!editable}
                  onChange={(event) =>
                    updateField("allow_reject", event.target.checked)
                  }
                />
              }
              label={<Typography variant="body2">Allow Reject</Typography>}
              sx={{ mr: 1.5 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(step.allow_return)}
                  disabled={!editable}
                  onChange={(event) =>
                    updateField("allow_return", event.target.checked)
                  }
                />
              }
              label={<Typography variant="body2">Allow Return</Typography>}
              sx={{ mr: 1.5 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(step.stop_if_rejected)}
                  disabled={!editable}
                  onChange={(event) =>
                    updateField("stop_if_rejected", event.target.checked)
                  }
                />
              }
              label={
                <Typography variant="body2">Stop Workflow if Rejected</Typography>
              }
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function createBlankApprovalStep(stepNumber) {
  return {
    step_no: stepNumber,
    sequence_no: stepNumber,
    approver_employee_code: "",
    approval_type: "Approval Required",
    comments_required: false,
    allow_reject: true,
    allow_return: true,
    stop_if_rejected: true
  };
}

function createBlankDraftRoute() {
  return {
    route: {
      route_name: "",
      description: "",
      applies_to: "Requisition",
      status: "Active",
      effective_from: new Date().toISOString().slice(0, 10),
      max_approval_days: 3
    },
    steps: [createBlankApprovalStep(1)]
  };
}

const APPLIES_TO_OPTIONS = [
  "Requisition",
  "Offer",
  "Candidate Exception",
  "Vendor Registration",
  "Budget Approval"
];

function ApprovalRouteManagementPage() {
  const {
    approvalRoutes,
    selectedRoute,
    loading,
    error,
    loadApprovalRoutes,
    loadApprovalRoute,
    createApprovalRoute,
    updateApprovalRoute
  } = useApprovalRoutes();

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [draftRoute, setDraftRoute] = useState(null);
  const [editRoute, setEditRoute] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState({ message: "", severity: "error" });
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [approvalSlaUnit, setApprovalSlaUnit] = useState("Days");

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const routes = await loadApprovalRoutes();

        if (cancelled || !Array.isArray(routes) || routes.length === 0) {
          return;
        }

        const firstRouteId = routes[0].route_id;
        setSelectedRouteId(firstRouteId);
        await loadApprovalRoute(firstRouteId);
      } catch (_error) {
        // error already stored in hook state
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadApprovalRoutes, loadApprovalRoute]);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        const response = await API.get("/users");
        const rows = response.data?.data || [];

        if (!cancelled) {
          setUsers(Array.isArray(rows) ? rows : []);
        }
      } catch (_error) {
        if (!cancelled) {
          setUsers([]);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isCreating) {
      return;
    }

    if (!selectedRoute) {
      setEditRoute(null);
      setIsDirty(false);
      return;
    }

    setEditRoute(cloneRoutePayload(selectedRoute));
    setIsDirty(false);
  }, [selectedRoute, isCreating]);

  const filteredRoutes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return approvalRoutes;
    }

    return approvalRoutes.filter((route) => {
      const name = String(route.route_name || "").toLowerCase();
      const status = String(route.status || "").toLowerCase();
      return name.includes(query) || status.includes(query);
    });
  }, [approvalRoutes, searchQuery]);

  const activeSelection = isCreating ? draftRoute : editRoute;
  const route = activeSelection?.route || null;
  const steps = Array.isArray(activeSelection?.steps) ? activeSelection.steps : [];
  const isEditable = Boolean(route);

  const handleNewApprovalRoute = () => {
    setSelectedRouteId(null);
    setIsCreating(true);
    setDraftRoute(createBlankDraftRoute());
    setEditRoute(null);
    setIsDirty(false);
  };

  const handleSelectRoute = async (routeId) => {
    if (!isCreating && routeId === selectedRouteId) {
      return;
    }

    setIsCreating(false);
    setDraftRoute(null);
    setIsDirty(false);
    setSelectedRouteId(routeId);

    try {
      await loadApprovalRoute(routeId);
    } catch (_error) {
      // error already stored in hook state
    }
  };

  const updateWorkingRouteField = (field, value) => {
    if (isCreating) {
      setDraftRoute((prev) => {
        if (!prev?.route) {
          return prev;
        }

        return {
          ...prev,
          route: {
            ...prev.route,
            [field]: value
          }
        };
      });
      return;
    }

    setEditRoute((prev) => {
      if (!prev?.route) {
        return prev;
      }

      return {
        ...prev,
        route: {
          ...prev.route,
          [field]: value
        }
      };
    });
    setIsDirty(true);
  };

  const updateWorkingStep = (stepIndex, nextStep) => {
    if (isCreating) {
      setDraftRoute((prev) => {
        if (!prev || !Array.isArray(prev.steps)) {
          return prev;
        }

        return {
          ...prev,
          steps: prev.steps.map((step, index) =>
            index === stepIndex ? nextStep : step
          )
        };
      });
      return;
    }

    setEditRoute((prev) => {
      if (!prev || !Array.isArray(prev.steps)) {
        return prev;
      }

      return {
        ...prev,
        steps: prev.steps.map((step, index) =>
          index === stepIndex ? nextStep : step
        )
      };
    });
    setIsDirty(true);
  };

  const handleAddApprovalStep = () => {
    if (!isEditable) {
      return;
    }

    if (isCreating) {
      setDraftRoute((prev) => {
        const currentSteps = Array.isArray(prev?.steps) ? prev.steps : [];
        const nextNumber = currentSteps.length + 1;

        return {
          ...prev,
          steps: [...currentSteps, createBlankApprovalStep(nextNumber)]
        };
      });
      return;
    }

    setEditRoute((prev) => {
      const currentSteps = Array.isArray(prev?.steps) ? prev.steps : [];
      const nextNumber = currentSteps.length + 1;

      return {
        ...prev,
        steps: [...currentSteps, createBlankApprovalStep(nextNumber)]
      };
    });
    setIsDirty(true);
  };

  const renumberSteps = (stepsList) =>
    stepsList.map((step, index) => ({
      ...step,
      step_no: index + 1,
      sequence_no: index + 1
    }));

  const handleRemoveApprovalStep = (stepIndex) => {
    if (!isEditable) {
      return;
    }

    const currentSteps = Array.isArray(steps) ? steps : [];

    if (currentSteps.length <= 1) {
      setToast({
        message: "At least one Approval Step is required.",
        severity: "error"
      });
      return;
    }

    const nextSteps = renumberSteps(
      currentSteps.filter((_step, index) => index !== stepIndex)
    );

    if (isCreating) {
      setDraftRoute((prev) => ({
        ...prev,
        steps: nextSteps
      }));
      return;
    }

    setEditRoute((prev) => ({
      ...prev,
      steps: nextSteps
    }));
    setIsDirty(true);
  };

  const buildRoutePayload = (source) => {
    const sourceRoute = source?.route || {};
    const sourceSteps = Array.isArray(source?.steps) ? source.steps : [];

    return {
      route: {
        route_name: String(sourceRoute.route_name || "").trim(),
        description: sourceRoute.description || "",
        applies_to: sourceRoute.applies_to || "Requisition",
        status: sourceRoute.status || "Active",
        effective_from: sourceRoute.effective_from || null,
        max_approval_days:
          sourceRoute.max_approval_days === "" ||
          sourceRoute.max_approval_days == null
            ? 3
            : Number(sourceRoute.max_approval_days)
      },
      steps: sourceSteps.map((step, index) => ({
        step_no: index + 1,
        sequence_no: index + 1,
        approver_employee_code: String(
          step.approver_employee_code || ""
        ).trim(),
        approval_type: step.approval_type || "Approval Required",
        comments_required: Boolean(step.comments_required),
        allow_reject: Boolean(step.allow_reject),
        allow_return: Boolean(step.allow_return),
        stop_if_rejected: Boolean(step.stop_if_rejected)
      }))
    };
  };

  const validateRoutePayload = (source) => {
    const sourceRoute = source?.route;
    const sourceSteps = Array.isArray(source?.steps) ? source.steps : [];

    if (!String(sourceRoute?.route_name || "").trim()) {
      return "Route Name is required.";
    }

    if (sourceSteps.length === 0) {
      return "At least one Approval Step is required.";
    }

    const missingApprover = sourceSteps.some(
      (step) => !String(step.approver_employee_code || "").trim()
    );

    if (missingApprover) {
      return "Primary Approver is required for every Approval Step.";
    }

    return "";
  };

  const handleCreateRoute = async () => {
    if (!isCreating || !draftRoute?.route) {
      return;
    }

    const validationMessage = validateRoutePayload(draftRoute);

    if (validationMessage) {
      setToast({ message: validationMessage, severity: "error" });
      return;
    }

    const payload = buildRoutePayload(draftRoute);

    setIsSaving(true);

    try {
      const createdRouteId = await createApprovalRoute(payload);

      setIsCreating(false);
      setDraftRoute(null);

      await loadApprovalRoutes();

      if (createdRouteId != null) {
        setSelectedRouteId(createdRouteId);
        await loadApprovalRoute(createdRouteId);
      }
    } catch (createError) {
      if (createError.response?.status === 409) {
        setToast({
          message:
            "An Approval Route with this name already exists for the selected Applies To.",
          severity: "error"
        });
        return;
      }

      const message =
        createError.response?.data?.message ||
        createError.message ||
        error ||
        "Failed to create approval route.";
      setToast({ message, severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRoute = async () => {
    if (isCreating || !selectedRouteId || !editRoute?.route || !isDirty) {
      return;
    }

    const validationMessage = validateRoutePayload(editRoute);

    if (validationMessage) {
      setToast({ message: validationMessage, severity: "error" });
      return;
    }

    const payload = buildRoutePayload(editRoute);

    setIsSaving(true);

    try {
      await updateApprovalRoute(selectedRouteId, payload);
      await loadApprovalRoutes();
      await loadApprovalRoute(selectedRouteId);
      setIsDirty(false);
      setToast({
        message: "Approval route updated successfully.",
        severity: "success"
      });
    } catch (updateError) {
      if (updateError.response?.status === 409) {
        setToast({
          message:
            "An Approval Route with this name already exists for the selected Applies To.",
          severity: "error"
        });
        return;
      }

      const message =
        updateError.response?.data?.message ||
        updateError.message ||
        error ||
        "Failed to update approval route.";
      setToast({ message, severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const appliesTo = route?.applies_to || "Requisition";
  const maxDays = route?.max_approval_days ?? "";
  const effectiveFrom = formatDateValue(route?.effective_from);
  const routeStatus = route?.status || "Active";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, gap: 1.5 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {isCreating ? "New Approval Route" : "Approval Route Management"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Define reusable enterprise approval routes and approval steps.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 520,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper"
        }}
      >
        {/* Left — Approval Route Directory (~28%) */}
        <Box
          sx={{
            width: { xs: "100%", md: "28%" },
            maxWidth: { md: 280 },
            minWidth: { md: 220 },
            flexShrink: 0,
            borderRight: { md: 1 },
            borderColor: "divider",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            minHeight: 0
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<AddOutlinedIcon />}
              onClick={handleNewApprovalRoute}
              sx={{ mb: 1.25, textTransform: "none", fontWeight: 600 }}
            >
              + New Approval Route
            </Button>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Approval Route Directory
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Search routes"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchOutlinedIcon
                      sx={{ fontSize: 18, color: "text.secondary", mr: 0.75 }}
                    />
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
            {loading && approvalRoutes.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={22} />
              </Box>
            ) : null}

            {!loading && error && approvalRoutes.length === 0 ? (
              <Typography
                variant="caption"
                color="error"
                sx={{ display: "block", px: 1.5, py: 1 }}
              >
                {error}
              </Typography>
            ) : null}

            {!loading &&
            approvalRoutes.length === 0 &&
            !error &&
            filteredRoutes.length === 0 ? (
              <Box sx={{ px: 1.5, py: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  No Approval Routes Found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Create an approval route to begin configuring enterprise
                  approval steps.
                </Typography>
              </Box>
            ) : null}

            {filteredRoutes.map((item) => {
              const isSelected =
                !isCreating && item.route_id === selectedRouteId;

              return (
                <ListItemButton
                  key={item.route_id}
                  selected={isSelected}
                  onClick={() => handleSelectRoute(item.route_id)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    alignItems: "flex-start",
                    borderBottom: 1,
                    borderColor: "divider"
                  }}
                >
                  <Box minWidth={0} width="100%">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ fontSize: 13 }}
                    >
                      {item.route_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      display="block"
                    >
                      {item.status}
                    </Typography>
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Right — Route workspace (~72%) */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 1.5,
            overflow: "auto"
          }}
        >
          {loading && !route && !isCreating ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 280
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {!loading &&
          !isCreating &&
          approvalRoutes.length === 0 &&
          !error ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                minHeight: 280,
                px: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                No Approval Routes Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No reusable approval routes are configured yet. Routes will
                appear here once they are created.
              </Typography>
            </Box>
          ) : null}

          {route ? (
            <Stack spacing={1.5}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
                    Approval Route Information
                  </Typography>

                  <Stack spacing={1.25}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.25}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, fontWeight: 600, display: "block" }}
                        >
                          Approval Route Name
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          value={route.route_name || ""}
                          onChange={(event) =>
                            updateWorkingRouteField(
                              "route_name",
                              event.target.value
                            )
                          }
                          helperText="Example: Engineering Hiring, Campus Hiring, Executive Hiring"
                          FormHelperTextProps={{
                            sx: { mx: 0, mt: 0.5, fontSize: 11 }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-input": { fontSize: 13 }
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, fontWeight: 600, display: "block" }}
                        >
                          Description
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          value={route.description || ""}
                          onChange={(event) =>
                            updateWorkingRouteField(
                              "description",
                              event.target.value
                            )
                          }
                          sx={{
                            "& .MuiOutlinedInput-input": { fontSize: 13 }
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, fontWeight: 600, display: "block" }}
                        >
                          Status
                        </Typography>
                        <Select
                          size="small"
                          fullWidth
                          value={routeStatus}
                          onChange={(event) =>
                            updateWorkingRouteField("status", event.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                          {!["Active", "Inactive"].includes(routeStatus) ? (
                            <MenuItem value={routeStatus}>{routeStatus}</MenuItem>
                          ) : null}
                        </Select>
                      </Box>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.25}
                      alignItems={{ sm: "flex-end" }}
                    >
                      <FormControl
                        size="small"
                        sx={{ minWidth: { sm: 200 }, flex: 1 }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, fontWeight: 600 }}
                        >
                          Applies To
                        </Typography>
                        <Select
                          value={appliesTo}
                          onChange={(event) =>
                            updateWorkingRouteField(
                              "applies_to",
                              event.target.value
                            )
                          }
                          sx={{ fontSize: 13 }}
                        >
                          {APPLIES_TO_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                          {!APPLIES_TO_OPTIONS.includes(appliesTo) ? (
                            <MenuItem value={appliesTo}>{appliesTo}</MenuItem>
                          ) : null}
                        </Select>
                      </FormControl>

                      <Box sx={{ flex: 1, minWidth: { sm: 200 } }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, fontWeight: 600, display: "block" }}
                        >
                          Approval SLA
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="stretch">
                          <TextField
                            size="small"
                            type="number"
                            value={maxDays}
                            onChange={(event) => {
                              const raw = event.target.value;
                              updateWorkingRouteField(
                                "max_approval_days",
                                raw === "" ? "" : Number(raw)
                              );
                            }}
                            inputProps={{ min: 1, step: 1 }}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              "& .MuiOutlinedInput-input": {
                                fontSize: 13
                              }
                            }}
                          />
                          <FormControl size="small" sx={{ minWidth: 104 }}>
                            <Select
                              value={approvalSlaUnit}
                              onChange={(event) =>
                                setApprovalSlaUnit(event.target.value)
                              }
                              sx={{ fontSize: 13 }}
                            >
                              <MenuItem value="Hours">Hours</MenuItem>
                              <MenuItem value="Days">Days</MenuItem>
                              <MenuItem value="Weeks">Weeks</MenuItem>
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: { sm: 200 } }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 0.5, fontWeight: 600, display: "block" }}
                        >
                          Effective From
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          type="date"
                          value={effectiveFrom}
                          onChange={(event) =>
                            updateWorkingRouteField(
                              "effective_from",
                              event.target.value
                            )
                          }
                          sx={{
                            "& .MuiOutlinedInput-input": {
                              fontSize: 13
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    Approval Steps
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1.25 }}
                  >
                    Configure sequential approvers for this route.
                  </Typography>

                  <Stack spacing={1}>
                    {steps.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No approval steps configured for this route.
                      </Typography>
                    ) : (
                      steps.map((step, index) => (
                        <ApprovalStepCard
                          key={
                            step.step_id ||
                            `draft-step-${step.sequence_no || index}`
                          }
                          step={step}
                          stepNumber={index + 1}
                          editable={isEditable}
                          canDelete={isEditable}
                          users={users}
                          onChange={(nextStep) =>
                            updateWorkingStep(index, nextStep)
                          }
                          onDelete={() => handleRemoveApprovalStep(index)}
                        />
                      ))
                    )}

                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddOutlinedIcon />}
                        onClick={handleAddApprovalStep}
                        disabled={!isEditable || isSaving}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        + Add Approval Step
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.25 }}>
                {isCreating ? (
                  <Button
                    variant="contained"
                    onClick={handleCreateRoute}
                    disabled={isSaving || loading}
                    sx={{ minWidth: 140 }}
                  >
                    {isSaving ? "Creating…" : "Create Route"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSaveRoute}
                    disabled={!isDirty || isSaving || loading}
                    sx={{ minWidth: 140 }}
                  >
                    {isSaving ? "Saving…" : "Save Route"}
                  </Button>
                )}
              </Box>
            </Stack>
          ) : null}
        </Box>
      </Box>

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

export default ApprovalRouteManagementPage;

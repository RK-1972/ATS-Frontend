import { useEffect, useMemo, useState } from "react";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";

import masterDataClient from "@/api/clients/masterDataClient";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";
import useApprovalRoutePolicies from "@/hooks/useApprovalRoutePolicies";
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

function uniqueStringValues(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  ];
}

function resolvePolicyCriteriaFromRecord(policy) {
  const designations = Array.isArray(policy?.designations)
    && policy.designations.length
    ? uniqueStringValues(policy.designations)
    : policy?.designation
      ? uniqueStringValues([policy.designation])
      : [];

  const grades = Array.isArray(policy?.grades) && policy.grades.length
    ? uniqueStringValues(policy.grades)
    : policy?.grade
      ? uniqueStringValues([policy.grade])
      : [];

  return { designations, grades };
}

function mapValuesToDesignationOptions(values, designationOptions) {
  return uniqueStringValues(values).map((value) => {
    const match = designationOptions.find(
      (option) => option.value.toLowerCase() === value.toLowerCase()
    );

    return match || { value, label: value };
  });
}

function mapValuesToGradeOptions(values, gradeOptions) {
  return uniqueStringValues(values).map((value) => {
    const match = gradeOptions.find((option) => option.value === value)
      || gradeOptions.find(
        (option) =>
          option.name === value
          || option.label === value
          || option.code === value
      );

    return match || { value, label: value };
  });
}

function renderSelectedOptionChip(option, getTagProps, index) {
  const { key, ...tagProps } = getTagProps({ index });
  const fullLabel = option.label || option.value;

  return (
    <Tooltip key={key} title={fullLabel} arrow placement="top">
      <Chip
        {...tagProps}
        label={fullLabel}
        size="small"
      />
    </Tooltip>
  );
}

function blankPolicyForm() {
  return {
    route_id: "",
    department: "",
    designations: [],
    grades: [],
    min_amount: "",
    max_amount: "",
    is_active: true,
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: ""
  };
}

function policyToForm(policy) {
  if (!policy) {
    return blankPolicyForm();
  }

  const { designations, grades } = resolvePolicyCriteriaFromRecord(policy);

  return {
    route_id: policy.route_id ?? "",
    department: policy.department ?? "",
    designations,
    grades,
    min_amount:
      policy.min_amount === null || policy.min_amount === undefined
        ? ""
        : String(policy.min_amount),
    max_amount:
      policy.max_amount === null || policy.max_amount === undefined
        ? ""
        : String(policy.max_amount),
    is_active: Boolean(policy.is_active),
    effective_from: formatDateValue(policy.effective_from)
      || new Date().toISOString().slice(0, 10),
    effective_to: formatDateValue(policy.effective_to)
  };
}

function formToPayload(form) {
  const designations = uniqueStringValues(form.designations);
  const grades = uniqueStringValues(form.grades);

  return {
    route_id: form.route_id === "" ? null : Number(form.route_id),
    department: String(form.department || "").trim() || null,
    designations: designations.length ? designations : null,
    grades: grades.length ? grades : null,
    min_amount: form.min_amount === "" ? null : Number(form.min_amount),
    max_amount: form.max_amount === "" ? null : Number(form.max_amount),
    is_active: Boolean(form.is_active),
    effective_from: form.effective_from || null,
    effective_to: form.effective_to || null
  };
}

function formatCriteriaList(values, fallbackLabel) {
  if (!Array.isArray(values) || !values.length) {
    return fallbackLabel;
  }

  if (values.length <= 3) {
    return values.join(", ");
  }

  return `${values.slice(0, 3).join(", ")} +${values.length - 3} more`;
}

function criteriaSummary(policy) {
  const { designations, grades } = resolvePolicyCriteriaFromRecord(policy);

  const parts = [
    policy.department || "Any department",
    formatCriteriaList(designations, "Any designation"),
    formatCriteriaList(grades, "Any grade")
  ];

  if (policy.min_amount != null || policy.max_amount != null) {
    const min =
      policy.min_amount != null ? String(policy.min_amount) : "0";
    const max =
      policy.max_amount != null ? String(policy.max_amount) : "∞";
    parts.push(`₹${min} – ₹${max}`);
  } else {
    parts.push("Any amount");
  }

  return parts.join(" · ");
}

function sanitizeNonNegativeAmount(raw) {
  if (raw === null || raw === undefined) {
    return "";
  }

  const text = String(raw).replace(/[^\d.]/g, "");
  if (text === "") {
    return "";
  }

  const firstDot = text.indexOf(".");
  const normalized =
    firstDot === -1
      ? text
      : `${text.slice(0, firstDot + 1)}${text.slice(firstDot + 1).replace(/\./g, "")}`;

  if (normalized === "." || normalized.startsWith("-")) {
    return "";
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    return "";
  }

  return normalized;
}

function isActiveRoute(route) {
  return String(route?.status || "").trim().toLowerCase() === "active";
}

function ApprovalPoliciesPage() {
  const {
    policies,
    loading: policiesLoading,
    error: policiesError,
    loadPolicies,
    createPolicy,
    updatePolicy,
    activatePolicy,
    deactivatePolicy,
    loadPolicy
  } = useApprovalRoutePolicies();

  const {
    approvalRoutes,
    loading: routesLoading,
    loadApprovalRoutes
  } = useApprovalRoutes();

  const [search, setSearch] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(blankPolicyForm());
  const [fieldErrors, setFieldErrors] = useState({ route_id: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [mastersError, setMastersError] = useState("");

  useEffect(() => {
    loadPolicies().catch(() => {});
    loadApprovalRoutes().catch(() => {});
  }, [loadPolicies, loadApprovalRoutes]);

  useEffect(() => {
    let cancelled = false;

    const loadMasters = async () => {
      setLoadingMasters(true);
      setMastersError("");

      try {
        const bundle = await masterDataClient.getAll();
        if (cancelled) {
          return;
        }

        const publishedDepartments = getPublishedRecords(bundle, "departments");
        const publishedDesignations = getPublishedRecords(bundle, "designations");
        const publishedGrades = getPublishedRecords(bundle, "grades");

        setDepartmentOptions(
          publishedDepartments.map((record) => ({
            value: record.name,
            label: record.name,
            code: record.code
          }))
        );

        setDesignationOptions(
          publishedDesignations.map((record) => ({
            value: record.name,
            label: record.name,
            code: record.code
          }))
        );

        setGradeOptions(
          publishedGrades.map((record) => ({
            value: record.code,
            label: `${record.code} — ${record.name}`,
            code: record.code,
            name: record.name
          }))
        );
      } catch (loadError) {
        if (!cancelled) {
          setDepartmentOptions([]);
          setDesignationOptions([]);
          setGradeOptions([]);
          setMastersError(
            loadError.response?.data?.message
              || loadError.message
              || "Failed to load master data for policy criteria."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMasters(false);
        }
      }
    };

    loadMasters();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return policies;
    }

    return policies.filter((policy) => {
      const { designations: designationValues, grades: gradeValues } =
        resolvePolicyCriteriaFromRecord(policy);

      const haystack = [
        policy.policy_id,
        policy.route_name,
        policy.route_applies_to,
        policy.department,
        ...designationValues,
        ...gradeValues,
        policy.is_active ? "active" : "inactive"
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [policies, search]);

  const selectedPolicy = useMemo(
    () => policies.find((item) => String(item.policy_id) === String(selectedPolicyId))
      || null,
    [policies, selectedPolicyId]
  );

  const routeOptions = useMemo(() => {
    const activeRoutes = approvalRoutes
      .filter(isActiveRoute)
      .sort((a, b) =>
        String(a.route_name || "").localeCompare(String(b.route_name || ""))
      );

    if (!form.route_id) {
      return activeRoutes;
    }

    const selectedStillListed = activeRoutes.some(
      (route) => String(route.route_id) === String(form.route_id)
    );

    if (selectedStillListed) {
      return activeRoutes;
    }

    const currentRoute = approvalRoutes.find(
      (route) => String(route.route_id) === String(form.route_id)
    );

    return currentRoute ? [currentRoute, ...activeRoutes] : activeRoutes;
  }, [approvalRoutes, form.route_id]);

  const selectedDepartment = useMemo(() => {
    const value = String(form.department || "").trim();
    if (!value) {
      return null;
    }

    return (
      departmentOptions.find(
        (option) => option.value.toLowerCase() === value.toLowerCase()
      ) || { value, label: value }
    );
  }, [departmentOptions, form.department]);

  const selectedDesignations = useMemo(
    () => mapValuesToDesignationOptions(form.designations, designationOptions),
    [designationOptions, form.designations]
  );

  const selectedGrades = useMemo(
    () => mapValuesToGradeOptions(form.grades, gradeOptions),
    [gradeOptions, form.grades]
  );

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelectedPolicyId(null);
    setForm(blankPolicyForm());
    setFieldErrors({ route_id: "" });
  };

  const selectPolicy = async (policyId) => {
    setIsCreating(false);
    setSelectedPolicyId(policyId);
    setFieldErrors({ route_id: "" });

    try {
      const policy = await loadPolicy(policyId);
      setForm(policyToForm(policy));
      return;
    } catch (_loadError) {
      // Fall back to the list row if the detail fetch fails.
    }

    const policy = policies.find(
      (item) => String(item.policy_id) === String(policyId)
    );
    setForm(policyToForm(policy));
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "route_id" && fieldErrors.route_id) {
      setFieldErrors((prev) => ({ ...prev, route_id: "" }));
    }
  };

  const handleAmountChange = (field, rawValue) => {
    updateField(field, sanitizeNonNegativeAmount(rawValue));
  };

  const handleSave = async () => {
    const payload = formToPayload({
      ...form,
      designations: selectedDesignations.map((option) => option.value),
      grades: selectedGrades.map((option) => option.value)
    });
    const nextErrors = { route_id: "" };

    if (!payload.route_id) {
      nextErrors.route_id = "Please select an Approval Route.";
      setFieldErrors(nextErrors);
      showToast("Please select an Approval Route before saving.", "error");
      return;
    }

    if (
      payload.min_amount != null
      && payload.max_amount != null
      && payload.max_amount < payload.min_amount
    ) {
      showToast(
        "Maximum amount must be greater than or equal to minimum amount.",
        "error"
      );
      return;
    }

    setFieldErrors(nextErrors);
    setSaving(true);
    try {
      if (isCreating) {
        const created = await createPolicy(payload);
        await loadPolicies();
        setIsCreating(false);
        setSelectedPolicyId(created?.policy_id ?? null);
        setForm(policyToForm(created));
        showToast("Approval policy created.");
      } else if (selectedPolicyId) {
        const updated = await updatePolicy(selectedPolicyId, payload);
        await loadPolicies();
        setForm(policyToForm(updated));
        showToast("Approval policy updated.");
      }
    } catch (saveError) {
      showToast(
        saveError.response?.data?.message
          || saveError.message
          || "Failed to save approval policy.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedPolicyId || isCreating) {
      return;
    }

    setSaving(true);
    try {
      const next = selectedPolicy?.is_active
        ? await deactivatePolicy(selectedPolicyId)
        : await activatePolicy(selectedPolicyId);
      await loadPolicies();
      setForm(policyToForm(next));
      showToast(
        next?.is_active
          ? "Approval policy activated."
          : "Approval policy deactivated."
      );
    } catch (toggleError) {
      showToast(
        toggleError.response?.data?.message
          || toggleError.message
          || "Failed to update policy status.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const loading = policiesLoading || routesLoading;
  const editorOpen = isCreating || Boolean(selectedPolicyId);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "flex-start" }}
        spacing={1.5}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            Approval Policies
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Map matching criteria to an Approval Route. All specified criteria must match.
            Leave any field blank to match all values.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={startCreate}
          sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Create Policy
        </Button>
      </Stack>

      {policiesError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {policiesError}
        </Alert>
      ) : null}

      {mastersError ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {mastersError}
        </Alert>
      ) : null}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
        <Card variant="outlined" sx={{ width: { xs: "100%", md: 340 }, flexShrink: 0 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search policies"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 1.5 }}
            />

            {loading && policies.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : filteredPolicies.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No approval policies configured yet. Create a policy and map it to a route.
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: 520, overflow: "auto", py: 0 }}>
                {filteredPolicies.map((policy) => {
                  const selected =
                    !isCreating
                    && String(policy.policy_id) === String(selectedPolicyId);

                  return (
                    <ListItemButton
                      key={policy.policy_id}
                      selected={selected}
                      onClick={() => selectPolicy(policy.policy_id)}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.5,
                        alignItems: "flex-start",
                        flexDirection: "column",
                        gap: 0.25
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Typography variant="body2" fontWeight={700}>
                          Policy #{policy.policy_id}
                        </Typography>
                        <Chip
                          size="small"
                          label={policy.is_active ? "Active" : "Inactive"}
                          color={policy.is_active ? "success" : "default"}
                          variant="outlined"
                          sx={{ height: 22, fontWeight: 600 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {policy.route_name || `Route ${policy.route_id}`}
                        {policy.route_applies_to
                          ? ` · ${policy.route_applies_to}`
                          : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {criteriaSummary(policy)}
                      </Typography>
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            {!editorOpen ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  Select a policy or create a new one
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Policies connect document matching criteria to an Approval Route.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1}
                >
                  <Typography variant="h6" fontWeight={700}>
                    {isCreating
                      ? "New Approval Policy"
                      : `Policy #${selectedPolicyId}`}
                  </Typography>
                  {!isCreating ? (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(form.is_active)}
                          onChange={handleToggleActive}
                          disabled={saving}
                        />
                      }
                      label={form.is_active ? "Active" : "Inactive"}
                    />
                  ) : (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(form.is_active)}
                          onChange={(event) =>
                            updateField("is_active", event.target.checked)
                          }
                        />
                      }
                      label={form.is_active ? "Active" : "Inactive"}
                    />
                  )}
                </Stack>

                <FormControl
                  size="small"
                  fullWidth
                  required
                  error={Boolean(fieldErrors.route_id)}
                >
                  <InputLabel id="approval-policy-route-label" shrink>
                    Approval Route
                  </InputLabel>
                  <Select
                    labelId="approval-policy-route-label"
                    label="Approval Route"
                    notched
                    displayEmpty
                    value={form.route_id === "" ? "" : String(form.route_id)}
                    onChange={(event) =>
                      updateField(
                        "route_id",
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value)
                      )
                    }
                  >
                    <MenuItem value="">
                      <em>Select an active approval route</em>
                    </MenuItem>
                    {routeOptions.map((route) => (
                      <MenuItem
                        key={route.route_id}
                        value={String(route.route_id)}
                      >
                        {route.route_name}
                        {route.applies_to ? ` (${route.applies_to})` : ""}
                        {!isActiveRoute(route) ? " — Inactive" : ""}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {fieldErrors.route_id
                      || "Required. Only Active routes are available for new policies."}
                  </FormHelperText>
                </FormControl>

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Matching criteria
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    All specified criteria must match. Leave any field blank to match all values.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Autocomplete
                        size="small"
                        options={departmentOptions}
                        loading={loadingMasters}
                        value={selectedDepartment}
                        onChange={(_event, option) =>
                          updateField("department", option?.value || "")
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(a, b) => a.value === b.value}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Department"
                            placeholder="Any department"
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Autocomplete
                        key={`designations-${selectedPolicyId ?? "new"}`}
                        multiple
                        filterSelectedOptions
                        size="small"
                        limitTags={2}
                        options={designationOptions}
                        loading={loadingMasters}
                        value={selectedDesignations}
                        onChange={(_event, options) =>
                          updateField(
                            "designations",
                            uniqueStringValues(
                              (options || []).map((option) => option.value)
                            )
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(a, b) =>
                          String(a?.value || "").toLowerCase()
                          === String(b?.value || "").toLowerCase()
                        }
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) =>
                            renderSelectedOptionChip(option, getTagProps, index)
                          )
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Designation / Position"
                            placeholder={
                              selectedDesignations.length
                                ? ""
                                : "Any designation"
                            }
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Autocomplete
                        key={`grades-${selectedPolicyId ?? "new"}`}
                        multiple
                        filterSelectedOptions
                        size="small"
                        limitTags={2}
                        options={gradeOptions}
                        loading={loadingMasters}
                        value={selectedGrades}
                        onChange={(_event, options) =>
                          updateField(
                            "grades",
                            uniqueStringValues(
                              (options || []).map((option) => option.value)
                            )
                          )
                        }
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(a, b) =>
                          String(a?.value || "").toLowerCase()
                          === String(b?.value || "").toLowerCase()
                        }
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) =>
                            renderSelectedOptionChip(option, getTagProps, index)
                          )
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Grade"
                            placeholder={
                              selectedGrades.length ? "" : "Any grade"
                            }
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Minimum amount (INR)"
                        value={form.min_amount}
                        onChange={(event) =>
                          handleAmountChange("min_amount", event.target.value)
                        }
                        inputProps={{ min: 0, step: 1 }}
                        helperText=" "
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Maximum amount (INR)"
                        value={form.max_amount}
                        onChange={(event) =>
                          handleAmountChange("max_amount", event.target.value)
                        }
                        inputProps={{ min: 0, step: 1 }}
                        helperText=" "
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
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
                        value={form.effective_from}
                        onChange={(event) =>
                          updateField("effective_from", event.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-input": {
                            fontSize: 13
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 0.5, fontWeight: 600, display: "block" }}
                      >
                        Effective To
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        type="date"
                        value={form.effective_to}
                        onChange={(event) =>
                          updateField("effective_to", event.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-input": {
                            fontSize: 13
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ textTransform: "none" }}
                  >
                    {saving
                      ? "Saving…"
                      : isCreating
                        ? "Create Policy"
                        : "Save Policy"}
                  </Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApprovalPoliciesPage;

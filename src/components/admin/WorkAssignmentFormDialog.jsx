import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography
} from "@mui/material";

const ASSIGNMENT_CODE_PATTERN = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;

const DEFAULT_BUSINESS_MODULE_OPTIONS = [
  "Requisition",
  "Recruitment",
  "Interview",
  "Offer"
];

const WORKSPACE_FLAG_OPTIONS = [
  { value: "", label: "None" },
  { value: "showRecruitmentWorkspace", label: "showRecruitmentWorkspace" },
  { value: "showApprovalWorkspace", label: "showApprovalWorkspace" },
  { value: "showInterviewWorkspace", label: "showInterviewWorkspace" },
  { value: "showRequestWorkspace", label: "showRequestWorkspace" },
  { value: "showOfferWorkspace", label: "showOfferWorkspace" }
];

const WORKSPACE_ICON_OPTIONS = [
  { value: "", label: "None" },
  { value: "WorkOutlineOutlined", label: "WorkOutlineOutlined" },
  { value: "DashboardOutlined", label: "DashboardOutlined" },
  { value: "FactCheckOutlined", label: "FactCheckOutlined" },
  { value: "DescriptionOutlined", label: "DescriptionOutlined" },
  { value: "LocalOfferOutlined", label: "LocalOfferOutlined" }
];

const emptyForm = {
  assignment_code: "",
  assignment_name: "",
  business_module: "",
  category: "",
  workspace_route: "",
  workspace_flag: "",
  workspace_icon: "",
  display_order: "",
  is_active: true
};

function SectionHeading({ label }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: "block",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.4
      }}
    >
      {label}
    </Typography>
  );
}

function buildEmptyErrors() {
  return {
    assignment_code: "",
    assignment_name: "",
    business_module: "",
    category: "",
    display_order: ""
  };
}

function validateForm(form) {
  const errors = buildEmptyErrors();
  let isValid = true;

  const code = String(form.assignment_code || "").trim();
  if (!code) {
    errors.assignment_code = "Assignment Code is required.";
    isValid = false;
  } else if (!ASSIGNMENT_CODE_PATTERN.test(code)) {
    errors.assignment_code =
      "Use uppercase letters with underscores only (e.g. RECRUITER_MANAGER).";
    isValid = false;
  }

  if (!String(form.assignment_name || "").trim()) {
    errors.assignment_name = "Assignment Name is required.";
    isValid = false;
  }

  if (!String(form.business_module || "").trim()) {
    errors.business_module = "Business Module is required.";
    isValid = false;
  }

  if (!String(form.category || "").trim()) {
    errors.category = "Category is required.";
    isValid = false;
  }

  const orderRaw = String(form.display_order ?? "").trim();
  if (!orderRaw) {
    errors.display_order = "Display Order is required.";
    isValid = false;
  } else if (!/^-?\d+$/.test(orderRaw) || !Number.isFinite(Number(orderRaw))) {
    errors.display_order = "Display Order must be a number.";
    isValid = false;
  }

  return { isValid, errors };
}

function toPayload(form) {
  const workspaceFlag = String(form.workspace_flag || "").trim();
  const workspaceIcon = String(form.workspace_icon || "").trim();
  const workspaceRoute = String(form.workspace_route || "").trim();

  return {
    assignment_code: String(form.assignment_code || "").trim().toUpperCase(),
    assignment_name: String(form.assignment_name || "").trim(),
    business_module: String(form.business_module || "").trim(),
    category: String(form.category || "").trim(),
    workspace_route: workspaceRoute || null,
    workspace_flag: workspaceFlag || null,
    workspace_icon: workspaceIcon || null,
    display_order: Number(String(form.display_order).trim()),
    is_active: Boolean(form.is_active)
  };
}

/**
 * Enterprise Work Assignment create/edit dialog (MD3).
 * mode="create" is implemented; mode="edit" is reserved for a later step.
 */
function WorkAssignmentFormDialog({
  open,
  mode = "create",
  onClose,
  onSubmit,
  isSaving = false,
  businessModuleOptions = DEFAULT_BUSINESS_MODULE_OPTIONS,
  initialValue = null,
  submitError = ""
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState(buildEmptyErrors());
  const isCreate = mode === "create";

  const moduleOptions = useMemo(() => {
    const merged = new Set([
      ...DEFAULT_BUSINESS_MODULE_OPTIONS,
      ...(businessModuleOptions || [])
    ]);
    return Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [businessModuleOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors(buildEmptyErrors());

    if (!isCreate && initialValue) {
      setForm({
        assignment_code: initialValue.assignment_code || "",
        assignment_name: initialValue.assignment_name || "",
        business_module: initialValue.business_module || "",
        category: initialValue.category || "",
        workspace_route: initialValue.workspace_route || "",
        workspace_flag: initialValue.workspace_flag || "",
        workspace_icon: initialValue.workspace_icon || "",
        display_order:
          initialValue.display_order === null ||
          initialValue.display_order === undefined
            ? ""
            : String(initialValue.display_order),
        is_active:
          initialValue.is_active === undefined
            ? true
            : Boolean(initialValue.is_active)
      });
      return;
    }

    setForm({ ...emptyForm });
  }, [open, isCreate, initialValue]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }
    setForm({ ...emptyForm });
    setErrors(buildEmptyErrors());
    onClose?.();
  };

  const handleSubmit = () => {
    const { isValid, errors: nextErrors } = validateForm(form);
    setErrors(nextErrors);

    if (!isValid) {
      return;
    }

    onSubmit?.(toPayload(form));
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          {isCreate ? "New Work Assignment" : "Edit Work Assignment"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Define a work assignment that controls workspace access across OPTALYNX.
        </Typography>

        {submitError ? (
          <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
            {submitError}
          </Typography>
        ) : null}

        <Grid container spacing={2} columns={12}>
          <Grid size={12}>
            <SectionHeading label="General Information" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <TextField
              label="Assignment Code"
              required
              fullWidth
              size="small"
              value={form.assignment_code}
              onChange={(event) =>
                updateField(
                  "assignment_code",
                  event.target.value.toUpperCase().replace(/\s+/g, "_")
                )
              }
              error={Boolean(errors.assignment_code)}
              helperText={errors.assignment_code}
              disabled={isSaving || !isCreate}
              inputProps={{ "aria-label": "Assignment Code" }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <TextField
              label="Assignment Name"
              required
              fullWidth
              size="small"
              value={form.assignment_name}
              onChange={(event) =>
                updateField("assignment_name", event.target.value)
              }
              error={Boolean(errors.assignment_name)}
              helperText={errors.assignment_name}
              disabled={isSaving}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <Autocomplete
              freeSolo
              fullWidth
              options={moduleOptions}
              value={form.business_module}
              onChange={(_event, value) =>
                updateField("business_module", value || "")
              }
              onInputChange={(_event, value) =>
                updateField("business_module", value || "")
              }
              disabled={isSaving}
              slotProps={{
                paper: {
                  sx: { minWidth: "fit-content" }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Business Module"
                  required
                  fullWidth
                  size="small"
                  error={Boolean(errors.business_module)}
                  helperText={errors.business_module}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <TextField
              label="Category"
              required
              fullWidth
              size="small"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              error={Boolean(errors.category)}
              helperText={errors.category}
              disabled={isSaving}
            />
          </Grid>

          <Grid size={12}>
            <SectionHeading label="Workspace Configuration" />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ minWidth: 0 }}>
            <TextField
              label="Workspace Route"
              fullWidth
              size="small"
              value={form.workspace_route}
              onChange={(event) =>
                updateField("workspace_route", event.target.value)
              }
              placeholder="/recruiter"
              disabled={isSaving}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ minWidth: 0 }}>
            <FormControl fullWidth size="small" disabled={isSaving}>
              <InputLabel id="wa-workspace-flag-label">Workspace Flag</InputLabel>
              <Select
                labelId="wa-workspace-flag-label"
                label="Workspace Flag"
                value={form.workspace_flag}
                onChange={(event) =>
                  updateField("workspace_flag", event.target.value)
                }
                MenuProps={{
                  PaperProps: { sx: { minWidth: "fit-content" } }
                }}
              >
                {WORKSPACE_FLAG_OPTIONS.map((option) => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ minWidth: 0 }}>
            <FormControl fullWidth size="small" disabled={isSaving}>
              <InputLabel id="wa-workspace-icon-label">Workspace Icon</InputLabel>
              <Select
                labelId="wa-workspace-icon-label"
                label="Workspace Icon"
                value={form.workspace_icon}
                onChange={(event) =>
                  updateField("workspace_icon", event.target.value)
                }
                MenuProps={{
                  PaperProps: { sx: { minWidth: "fit-content" } }
                }}
              >
                {WORKSPACE_ICON_OPTIONS.map((option) => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <SectionHeading label="Behaviour" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <TextField
              label="Display Order"
              required
              fullWidth
              size="small"
              type="number"
              value={form.display_order}
              onChange={(event) =>
                updateField("display_order", event.target.value)
              }
              error={Boolean(errors.display_order)}
              helperText={errors.display_order}
              disabled={isSaving}
              inputProps={{ step: 1 }}
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{ minWidth: 0, display: "flex", alignItems: "flex-start" }}
          >
            <FormControl fullWidth error={false}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.is_active)}
                    onChange={(event) =>
                      updateField("is_active", event.target.checked)
                    }
                    disabled={isSaving}
                    color="primary"
                  />
                }
                label="Active"
              />
              <FormHelperText sx={{ ml: 0 }}>
                Inactive assignments are excluded from workspace resolution.
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isSaving}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            minWidth: 96
          }}
        >
          {isSaving ? "Saving…" : isCreate ? "Save" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WorkAssignmentFormDialog;

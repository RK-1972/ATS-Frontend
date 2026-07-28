import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import masterDataClient from "@/api/clients/masterDataClient";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import WorkforceStatusChip from "./WorkforceStatusChip";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

const EMPTY_FORM = {
  department: "",
  position: "",
  grade: "",
  headcount: "1",
  proposed_budget: "",
  justification: "",
  priority: "Medium"
};

const EMPTY_META = {
  id: "",
  status: "",
  submitted_by: "",
  submitted_on: ""
};

function buildEmptyErrors() {
  return {
    department: "",
    position: "",
    grade: "",
    headcount: "",
    proposed_budget: "",
    justification: ""
  };
}

function validateMandatory(form) {
  const errors = buildEmptyErrors();
  let isValid = true;

  if (!String(form.department || "").trim()) {
    errors.department = "Department is required.";
    isValid = false;
  }

  if (!String(form.position || "").trim()) {
    errors.position = "Position title is required.";
    isValid = false;
  }

  if (!String(form.grade || "").trim()) {
    errors.grade = "Grade is required.";
    isValid = false;
  }

  const headcount = Number(form.headcount);
  if (!String(form.headcount ?? "").trim()) {
    errors.headcount = "Headcount is required.";
    isValid = false;
  } else if (!Number.isInteger(headcount) || headcount < 1) {
    errors.headcount = "Headcount must be a whole number of at least 1.";
    isValid = false;
  }

  const budget = Number(form.proposed_budget);
  if (!String(form.proposed_budget ?? "").trim()) {
    errors.proposed_budget = "Proposed budget is required.";
    isValid = false;
  } else if (!Number.isFinite(budget) || budget <= 0) {
    errors.proposed_budget = "Proposed budget must be greater than 0.";
    isValid = false;
  }

  if (!String(form.justification || "").trim()) {
    errors.justification = "Business justification is required.";
    isValid = false;
  }

  return { isValid, errors };
}

function toPayload(form, meta) {
  return {
    id: meta.id || null,
    department: String(form.department || "").trim(),
    position: String(form.position || "").trim(),
    grade: String(form.grade || "").trim(),
    headcount: Number(form.headcount) || 1,
    proposed_budget: Number(form.proposed_budget) || 0,
    justification: String(form.justification || "").trim(),
    priority: form.priority || "Medium",
    status: meta.status || "Draft",
    submitted_by: meta.submitted_by || null,
    submitted_on: meta.submitted_on || null
  };
}

function requestToFormState(request) {
  return {
    department: request.department || "",
    position: request.position || "",
    grade: request.grade || "",
    headcount: String(request.headcount ?? 1),
    proposed_budget:
      request.proposed_budget === 0 || request.proposed_budget
        ? String(request.proposed_budget)
        : "",
    justification: request.justification || "",
    priority: request.priority || "Medium"
  };
}

function requestToMetaState(request) {
  return {
    id: request.id || "",
    status: request.status || "Draft",
    submitted_by: request.submitted_by || "",
    submitted_on: request.submitted_on || ""
  };
}

/**
 * Production V1 Budget Request form.
 * Create or edit Draft only — Save Draft reuses POST .../budget-requests with id.
 * Parent remounts via `key` when switching New vs Edit so initial values load cleanly.
 */
function BudgetRequestFormDialog({
  open,
  onClose,
  onSaveDraft,
  onSubmitRequest,
  initialRequest = null
}) {
  const isEditMode =
    Boolean(initialRequest?.id) && initialRequest?.status === "Draft";

  const [form, setForm] = useState(() =>
    isEditMode ? requestToFormState(initialRequest) : { ...EMPTY_FORM }
  );
  const [meta, setMeta] = useState(() =>
    isEditMode ? requestToMetaState(initialRequest) : { ...EMPTY_META }
  );
  const [errors, setErrors] = useState(buildEmptyErrors);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    const loadMasters = async () => {
      setLoadingMasters(true);
      try {
        const bundle = await masterDataClient.getAll();
        if (cancelled) return;

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
      } catch {
        if (!cancelled) {
          setDepartmentOptions([]);
          setDesignationOptions([]);
          setGradeOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingMasters(false);
      }
    };

    loadMasters();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedDepartment = useMemo(
    () => departmentOptions.find((o) => o.value === form.department) || null,
    [departmentOptions, form.department]
  );

  const selectedDesignation = useMemo(() => {
    const position = String(form.position || "").trim();
    if (!position) return null;

    const match = designationOptions.find(
      (o) => o.value.toLowerCase() === position.toLowerCase()
    );
    if (match) return match;
    // Existing drafts may hold a legacy free-text title — keep it visible.
    return { value: position, label: position };
  }, [designationOptions, form.position]);

  const selectedGrade = useMemo(() => {
    const byCode = gradeOptions.find((o) => o.value === form.grade);
    if (byCode) return byCode;
    // Seed / legacy grades may store name instead of code
    return (
      gradeOptions.find(
        (o) =>
          o.name === form.grade ||
          o.label === form.grade ||
          o.code === form.grade
      ) || null
    );
  }, [gradeOptions, form.grade]);

  const resetAndClose = () => {
    setForm({ ...EMPTY_FORM });
    setMeta({ ...EMPTY_META });
    setErrors(buildEmptyErrors());
    setSubmitConfirmOpen(false);
    onClose?.();
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // When editing, payload.id is set so createBudgetRequest updates the same draft.
  const handleSaveDraft = async () => {
    const { isValid, errors: nextErrors } = validateMandatory(form);
    setErrors(nextErrors);
    if (!isValid || saving || submitting) return null;

    setSaving(true);
    try {
      const result = await onSaveDraft?.(toPayload(form, meta));
      if (result?.request) {
        setMeta({
          id: result.request.id,
          status: result.request.status || "Draft",
          submitted_by: result.request.submitted_by || "",
          submitted_on: result.request.submitted_on || ""
        });
      }
      return result || null;
    } finally {
      setSaving(false);
    }
  };

  const runSaveThenSubmit = async () => {
    if (saving || submitting) return;

    setSubmitting(true);
    try {
      const saved = await onSaveDraft?.(toPayload(form, meta));
      const requestId = saved?.request?.id;
      if (!requestId) {
        return;
      }

      setMeta({
        id: saved.request.id,
        status: saved.request.status || "Draft",
        submitted_by: saved.request.submitted_by || "",
        submitted_on: saved.request.submitted_on || ""
      });

      const submitted = await onSubmitRequest?.(requestId);
      if (submitted?.request) {
        setForm({ ...EMPTY_FORM });
        setMeta({ ...EMPTY_META });
        setErrors(buildEmptyErrors());
        setSubmitConfirmOpen(false);
        onClose?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    const { isValid, errors: nextErrors } = validateMandatory(form);
    setErrors(nextErrors);
    if (!isValid || saving || submitting) return;

    // Always confirm before submitting (both existing Draft and never-saved requests).
    setSubmitConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    runSaveThenSubmit();
  };

  const busy = saving || submitting;

  return (
    <>
    <Dialog open={open} onClose={busy ? undefined : resetAndClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
          {isEditMode ? "Edit budget request" : "New budget request"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
          {isEditMode
            ? "Update this draft and save. Non-draft requests cannot be edited here."
            : "Submit manpower budget before recruitment can begin."}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "action.hover"
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Request ID
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                {meta.id || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Status
              </Typography>
              <Box mt={0.25}>
                {meta.status ? (
                  <WorkforceStatusChip status={meta.status} />
                ) : (
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                    —
                  </Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Requested By
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                {meta.submitted_by || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Requested On
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                {meta.submitted_on || "—"}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size="small"
                options={departmentOptions}
                loading={loadingMasters}
                value={selectedDepartment}
                onChange={(_, option) => updateField("department", option?.value || "")}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    required
                    error={Boolean(errors.department)}
                    helperText={errors.department || " "}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size="small"
                options={designationOptions}
                loading={loadingMasters}
                value={selectedDesignation}
                onChange={(_, option) => updateField("position", option?.value || "")}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Position title"
                    required
                    error={Boolean(errors.position)}
                    helperText={errors.position || " "}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                size="small"
                options={gradeOptions}
                loading={loadingMasters}
                value={selectedGrade}
                onChange={(_, option) => updateField("grade", option?.value || "")}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Grade"
                    required
                    error={Boolean(errors.grade)}
                    helperText={errors.grade || " "}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                required
                type="number"
                label="Headcount"
                value={form.headcount}
                onChange={(e) => updateField("headcount", e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                error={Boolean(errors.headcount)}
                helperText={errors.headcount || " "}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Priority"
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                helperText=" "
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                required
                type="number"
                label="Proposed budget (INR)"
                value={form.proposed_budget}
                onChange={(e) => updateField("proposed_budget", e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                error={Boolean(errors.proposed_budget)}
                helperText={errors.proposed_budget || " "}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                required
                multiline
                minRows={3}
                label="Business justification"
                value={form.justification}
                onChange={(e) => updateField("justification", e.target.value)}
                error={Boolean(errors.justification)}
                helperText={errors.justification || " "}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button onClick={resetAndClose} color="inherit" size="small" disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={busy}
          onClick={handleSaveDraft}
          sx={{ fontWeight: 600 }}
        >
          {saving ? "Saving…" : "Save Draft"}
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={busy}
          onClick={handleSubmitClick}
          sx={{ fontWeight: 600 }}
        >
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>

    <EnterpriseConfirmationDialog
      open={submitConfirmOpen}
      title="Submit Budget Request?"
      message="This Budget Request will be submitted for approval."
      confirmLabel="Submit"
      loading={submitting}
      onConfirm={handleConfirmSubmit}
      onClose={() => setSubmitConfirmOpen(false)}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
        You will not be able to edit the Budget while it is under approval.
      </Typography>
    </EnterpriseConfirmationDialog>
    </>
  );
}

export default BudgetRequestFormDialog;

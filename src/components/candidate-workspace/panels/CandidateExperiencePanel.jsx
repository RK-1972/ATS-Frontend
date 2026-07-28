import { useCallback, useEffect, useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import { EmptyState, EnterpriseSurface, LoadingState } from "@/components/enterprise";
import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import candidateRepository from "@/repositories/candidateRepository";

const emptyForm = {
  company_name: "",
  designation: "",
  joining_date: "",
  relieving_date: "",
  technology: "",
  reason_for_change: "",
  role_summary: ""
};

const dateFieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 40
  },
  "& input[type='date']": {
    minWidth: 0,
    width: "100%",
    py: 1,
    boxSizing: "border-box"
  }
};

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  return String(value);
}

function AddExperienceDialog({
  open,
  onClose,
  onSubmit,
  isSaving = false,
  error = "",
  initialValue = null
}) {
  const [form, setForm] = useState(() => ({ ...emptyForm }));
  const isEdit = Boolean(initialValue?.experience_id || initialValue?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValue) {
      setForm({
        company_name: initialValue.company_name || "",
        designation: initialValue.designation || "",
        joining_date: toDateInputValue(initialValue.joining_date),
        relieving_date: toDateInputValue(initialValue.relieving_date),
        technology: initialValue.technology || "",
        reason_for_change: initialValue.reason_for_change || "",
        role_summary: initialValue.role_summary || ""
      });
      return;
    }

    setForm({ ...emptyForm });
  }, [open, initialValue]);

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    setForm({ ...emptyForm });
    onClose?.();
  };

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const canSubmit = Boolean(
    form.company_name.trim() &&
      form.designation.trim() &&
      form.joining_date.trim()
  );

  const handleSubmit = async () => {
    if (!canSubmit || isSaving) {
      return;
    }

    await onSubmit?.(form);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Edit Experience" : "Add Experience"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              required
              label="Company Name"
              value={form.company_name}
              onChange={updateField("company_name")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              required
              label="Designation"
              value={form.designation}
              onChange={updateField("designation")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              required
              label="Joining Date"
              type="date"
              value={form.joining_date}
              onChange={updateField("joining_date")}
              disabled={isSaving}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={dateFieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Relieving Date"
              type="date"
              value={form.relieving_date}
              onChange={updateField("relieving_date")}
              disabled={isSaving}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={dateFieldSx}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Technology"
              value={form.technology}
              onChange={updateField("technology")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Reason for Change"
              value={form.reason_for_change}
              onChange={updateField("reason_for_change")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Role Summary"
              value={form.role_summary}
              onChange={updateField("role_summary")}
              disabled={isSaving}
              multiline
              minRows={4}
            />
          </Grid>

          {error ? (
            <Grid item xs={12}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving || !canSubmit}
        >
          {isSaving
            ? "Saving..."
            : isEdit
              ? "Update Experience"
              : "Add Experience"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExperienceCompanyCard({ record, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const title = record.company_name || record.company || "Company";
  const designation = record.designation || record.role_title || "Role";
  const joining = formatDisplayDate(
    record.joining_date || record.start_date
  );
  const relieving = formatDisplayDate(
    record.relieving_date || record.end_date
  );
  const duration =
    record.duration ||
    [joining, relieving || (joining ? "Present" : "")]
      .filter(Boolean)
      .join(" – ");

  return (
    <EnterpriseSurface padding={false}>
      <Accordion
        expanded={expanded}
        onChange={(_, value) => setExpanded(value)}
        disableGutters
        elevation={0}
        sx={{ bgcolor: "transparent" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            minWidth={0}
            width="100%"
            pr={1}
          >
            <BusinessOutlinedIcon color="primary" />
            <BoxMeta
              title={title}
              designation={designation}
              duration={duration}
            />
            <Stack
              direction="row"
              spacing={0.25}
              sx={{ ml: "auto", flexShrink: 0 }}
            >
              <IconButton
                size="small"
                aria-label="Edit experience"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.(record);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Delete experience"
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(record);
                }}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {record.reason_for_change ? (
            <Typography variant="body2" color="text.secondary" mb={1}>
              Reason for change: {record.reason_for_change}
            </Typography>
          ) : null}
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            {record.role_summary ||
              record.summary ||
              "Role summary will appear here."}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {(record.technologies || record.technology || "")
              .split(/[,;/|]+/)
              .map((item) => item.trim())
              .filter(Boolean)
              .map((tech) => (
                <Chip key={tech} label={tech} size="small" variant="outlined" />
              ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </EnterpriseSurface>
  );
}

function BoxMeta({ title, designation, duration }) {
  return (
    <Stack minWidth={0} flex={1}>
      <Typography variant="subtitle1" fontWeight={700} noWrap>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {designation} · {duration || "Duration not set"}
      </Typography>
    </Stack>
  );
}

function CandidateExperiencePanel({
  candidate = {},
  forceOpenDialog = false,
  onDialogClose
}) {
  const candidateId = candidate.candidate_id;
  const [records, setRecords] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const loadExperience = useCallback(
    async ({ silent = false } = {}) => {
      if (!candidateId) {
        setRecords([]);
        return;
      }

      if (!silent) {
        setIsLoading(true);
        setError("");
      }

      try {
        const rows = await candidateRepository.listExperience(candidateId);
        setRecords(rows);
      } catch (loadError) {
        setError(loadError.message || "Failed to load experience records");

        if (!silent) {
          setRecords([]);
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [candidateId]
  );

  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  useEffect(() => {
    if (forceOpenDialog) {
      setError("");
      setEditingRecord(null);
      setDialogOpen(true);
      onDialogClose?.();
    }
  }, [forceOpenDialog, onDialogClose]);

  const handleAddExperience = () => {
    setError("");
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setError("");
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isSaving) {
      return;
    }

    setDialogOpen(false);
    setEditingRecord(null);
  };

  const handleDeleteRequest = (record) => {
    setError("");
    setDeleteTarget(record);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!candidateId || !deleteTarget) {
      return;
    }

    const experienceId = deleteTarget.experience_id || deleteTarget.id;

    if (!experienceId) {
      setError("Experience record is invalid.");
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await candidateRepository.deleteExperience(candidateId, experienceId);
      setDeleteTarget(null);
      await loadExperience({ silent: true });
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete experience record");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitExperience = async (form) => {
    if (!candidateId) {
      setError("Candidate is required to save experience.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (editingRecord?.experience_id || editingRecord?.id) {
        await candidateRepository.updateExperience(
          candidateId,
          editingRecord.experience_id || editingRecord.id,
          form
        );
      } else {
        await candidateRepository.createExperience(candidateId, form);
      }

      setDialogOpen(false);
      setEditingRecord(null);
      await loadExperience({ silent: true });
    } catch (saveError) {
      setError(saveError.message || "Failed to save experience record");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <EnterpriseCard
        title="Experience"
        subtitle="Candidate work history and role details"
        actions={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddOutlinedIcon />}
            onClick={handleAddExperience}
          >
            Add Experience
          </Button>
        }
      >
        {isLoading ? (
          <LoadingState message="Loading experience..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={WorkOutlineOutlinedIcon}
            title="No experience records"
            description="Company cards with expandable role details will appear here."
            actionLabel="Add Experience"
            onAction={handleAddExperience}
          />
        ) : (
          <Stack spacing={2}>
            {records.map((record) => (
              <ExperienceCompanyCard
                key={record.experience_id || record.id}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
          </Stack>
        )}

        {error && !dialogOpen && !deleteTarget ? (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        ) : null}
      </EnterpriseCard>

      <AddExperienceDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitExperience}
        isSaving={isSaving}
        error={dialogOpen ? error : ""}
        initialValue={editingRecord}
      />

      <EnterpriseConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete this experience record?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteDialog}
      />
    </Stack>
  );
}

export default CandidateExperiencePanel;

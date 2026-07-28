import { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

const QUALIFICATION_OPTIONS = [
  "SSLC",
  "PUC / XII",
  "Diploma",
  "B.Sc",
  "B.Com",
  "B.A",
  "BCA",
  "B.E",
  "B.Tech",
  "M.Sc",
  "MCA",
  "M.Tech",
  "MBA",
  "PhD",
  "Other"
];

const SCORE_TYPE_OPTIONS = ["CGPA", "Percentage"];

const emptyForm = {
  qualification: "",
  institution: "",
  university_board: "",
  specialization: "",
  from_date: "",
  to_date: "",
  score_type: "",
  score: ""
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

  if (/^\d{4}$/.test(raw)) {
    return `${raw}-01-01`;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function CandidateAddEducationDialog({
  open,
  onClose,
  onSubmit,
  isSaving = false,
  error = "",
  initialValue = null
}) {
  const [form, setForm] = useState(() => ({ ...emptyForm }));
  const isEdit = Boolean(initialValue?.education_id || initialValue?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValue) {
      setForm({
        qualification: initialValue.qualification || "",
        institution: initialValue.institution || "",
        university_board: initialValue.university_board || "",
        specialization: initialValue.specialization || "",
        from_date: toDateInputValue(initialValue.from_date),
        to_date: toDateInputValue(initialValue.to_date),
        score_type: initialValue.score_type || "",
        score:
          initialValue.score !== null && initialValue.score !== undefined
            ? String(initialValue.score)
            : ""
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

  const handleSubmit = async () => {
    if (!form.qualification || isSaving) {
      return;
    }

    await onSubmit?.(form);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Education" : "Add Education"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Qualification"
              value={form.qualification}
              onChange={updateField("qualification")}
              disabled={isSaving}
            >
              <MenuItem value="">
                <em>Select qualification</em>
              </MenuItem>
              {QUALIFICATION_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Institution"
              value={form.institution}
              onChange={updateField("institution")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="University / Board"
              value={form.university_board}
              onChange={updateField("university_board")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Specialization"
              value={form.specialization}
              onChange={updateField("specialization")}
              disabled={isSaving}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={form.from_date}
              onChange={updateField("from_date")}
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
              label="To Date"
              type="date"
              value={form.to_date}
              onChange={updateField("to_date")}
              disabled={isSaving}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={dateFieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Score Type"
              value={form.score_type}
              onChange={updateField("score_type")}
              disabled={isSaving}
            >
              <MenuItem value="">
                <em>Select score type</em>
              </MenuItem>
              {SCORE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Score"
              value={form.score}
              onChange={updateField("score")}
              disabled={isSaving}
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
          disabled={isSaving || !form.qualification}
        >
          {isSaving
            ? "Saving..."
            : isEdit
              ? "Update Education"
              : "Add Education"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CandidateAddEducationDialog;

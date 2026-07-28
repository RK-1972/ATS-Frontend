import { useState, useEffect } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField
} from "@mui/material";

import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

const PROFICIENCY_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
];

const emptyForm = {
  skill_code: "",
  years: "",
  months: "",
  proficiency_code: "",
  last_used_on: ""
};

function CandidateAddSkillDialog({
  open,
  onClose,
  masterData,
  onSave,
  initialValue = null
}) {
  const [form, setForm] = useState(emptyForm);

  const skillOptions = getPublishedRecords(masterData, "skills");
  const isEdit = Boolean(initialValue);

  useEffect(() => {
    if (open && initialValue) {
      setForm({
        skill_code: initialValue.skill_code || "",
        years: initialValue.years ?? "",
        months: initialValue.months ?? "",
        proficiency_code: initialValue.proficiency_code || "",
        last_used_on: initialValue.last_used_on
          ? String(initialValue.last_used_on).slice(0, 10)
          : ""
      });
    } else if (open) {
      setForm(emptyForm);
    }
  }, [open, initialValue]);

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleSave = () => {
    if (!form.skill_code) {
      return;
    }

    onSave?.(form);
    setForm(emptyForm);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Skill" : "Add Skill"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Skill"
              value={form.skill_code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, skill_code: event.target.value }))
              }
            >
              {skillOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Years"
              type="number"
              value={form.years}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, years: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Months"
              type="number"
              value={form.months}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, months: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Proficiency"
              value={form.proficiency_code}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  proficiency_code: event.target.value
                }))
              }
            >
              <MenuItem value="">
                <em>Select proficiency</em>
              </MenuItem>
              {PROFICIENCY_OPTIONS.map((option) => (
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
              label="Last Updated"
              type="date"
              value={form.last_used_on}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, last_used_on: event.target.value }))
              }
              slotProps={{
                inputLabel: { shrink: true }
              }}
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: 40
                },
                "& input[type='date']": {
                  minWidth: 0,
                  width: "100%",
                  py: 1,
                  boxSizing: "border-box"
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? "Update Skill" : "Add Skill"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CandidateAddSkillDialog;

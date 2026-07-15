import { useState } from "react";

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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const LEGACY_SOURCE_OPTIONS = [
  "LinkedIn",
  "Naukri",
  "Referral",
  "Career Portal"
];

const initialForm = {
  first_name: "",
  last_name: "",
  mobile_number: "",
  email_id: "",
  pan_number: "",
  primary_skill: "",
  total_experience: "",
  source_type: "LinkedIn"
};

function toLegacyFormData(form) {
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email_id: form.email_id.trim(),
    pan_number: form.pan_number.trim().toUpperCase(),
    mobile_number: form.mobile_number.trim(),
    primary_skill: form.primary_skill.trim(),
    total_experience: form.total_experience,
    candidate_status: "Applied",
    req_id: "",
    source_type: form.source_type || "LinkedIn",
    ats_stage: "Applied",
    remarks: ""
  };
}

function CandidateNewDialog({
  open,
  onClose,
  onCreate,
  isSaving = false
}) {
  const [form, setForm] = useState(initialForm);
  const [resumeFile, setResumeFile] = useState(null);

  const handleClose = () => {
    setForm(initialForm);
    setResumeFile(null);
    onClose();
  };

  const handleCreate = async () => {
    const created = await onCreate?.(toLegacyFormData(form), resumeFile);

    if (created) {
      setForm(initialForm);
      setResumeFile(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New Candidate</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Register a candidate using the same workflow as the legacy registration page.
          Full profile editing continues in the Candidate Workspace.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="First Name"
              value={form.first_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, first_name: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Last Name"
              value={form.last_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, last_name: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Mobile"
              value={form.mobile_number}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, mobile_number: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              value={form.email_id}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email_id: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="PAN Number"
              value={form.pan_number}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  pan_number: event.target.value.toUpperCase()
                }))
              }
              placeholder="ABCDE1234F"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Primary Skill"
              value={form.primary_skill}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, primary_skill: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Experience (years)"
              type="number"
              value={form.total_experience}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, total_experience: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Source Type"
              value={form.source_type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, source_type: event.target.value }))
              }
            >
              {LEGACY_SOURCE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadOutlinedIcon />}
              fullWidth
            >
              {resumeFile ? resumeFile.name : "Upload Resume (optional)"}
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
              />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={isSaving}>
          Create Candidate
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CandidateNewDialog;

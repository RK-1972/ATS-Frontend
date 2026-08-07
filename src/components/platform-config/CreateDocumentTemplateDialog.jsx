import { useState } from "react";

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

import {
  DOCUMENT_CATEGORIES,
  toTemplateCode
} from "@/utils/documentTemplateUtils";

const INITIAL_FORM = {
  templateName: "",
  templateCode: "",
  documentCategory: "Offer Letter",
  version: "1.0",
  effectiveFrom: ""
};

function CreateDocumentTemplateDialog({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleClose = () => {
    if (loading) {
      return;
    }

    setForm(INITIAL_FORM);
    onClose?.();
  };

  const handleSubmit = async () => {
    await onSubmit?.({
      template_name: form.templateName.trim(),
      template_code: toTemplateCode(form.templateCode || form.templateName),
      document_category: form.documentCategory,
      version: form.version.trim() || "1.0",
      effective_from: form.effectiveFrom || null
    });
    setForm(INITIAL_FORM);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Create Document Template</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={form.templateName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  templateName: event.target.value,
                  templateCode: prev.templateCode || toTemplateCode(event.target.value)
                }))
              }
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Template Code"
              value={form.templateCode}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  templateCode: toTemplateCode(event.target.value)
                }))
              }
              helperText="Auto-generated from name; editable before save"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label="Document Category"
              value={form.documentCategory}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  documentCategory: event.target.value
                }))
              }
            >
              {DOCUMENT_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Version"
              value={form.version}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, version: event.target.value }))
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Effective From"
              value={form.effectiveFrom}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.templateName.trim()}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Create Template
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateDocumentTemplateDialog;

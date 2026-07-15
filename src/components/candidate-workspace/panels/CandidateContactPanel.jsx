import { useState } from "react";

import { Grid, Stack, TextField, Typography } from "@mui/material";

import CandidateEditableCard from "../CandidateEditableCard";

function FieldBlock({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

function CandidateContactPanel({
  candidate = {},
  onSave,
  isSaving = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const startEdit = () => {
    setIsEditing(true);
    setDraft({ ...candidate });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({});
  };

  const saveCard = async (fields) => {
    const payload = fields.reduce((acc, field) => {
      acc[field] = draft[field];
      return acc;
    }, {});

    await onSave?.(payload);
    setIsEditing(false);
    setDraft({});
  };

  return (
    <CandidateEditableCard
      title="Contact Information"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={startEdit}
      onCancel={cancelEdit}
      onSave={() =>
        saveCard([
          "email_id",
          "mobile_number",
          "alternate_phone",
          "linkedin_url"
        ])
      }
      editContent={
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              type="email"
              label="Email"
              value={draft.email_id || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, email_id: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Mobile"
              value={draft.mobile_number || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, mobile_number: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Alternate Phone"
              value={draft.alternate_phone || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, alternate_phone: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              type="url"
              label="LinkedIn"
              value={draft.linkedin_url || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, linkedin_url: e.target.value }))
              }
            />
          </Grid>
        </Grid>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FieldBlock label="Email">
            <Typography variant="body2">{candidate.email_id || "—"}</Typography>
          </FieldBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldBlock label="Mobile">
            <Typography variant="body2">
              {candidate.mobile_number || "—"}
            </Typography>
          </FieldBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldBlock label="Alternate Phone">
            <Typography variant="body2">
              {candidate.alternate_phone || "—"}
            </Typography>
          </FieldBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldBlock label="LinkedIn">
            <Typography variant="body2">
              {candidate.linkedin_url || "—"}
            </Typography>
          </FieldBlock>
        </Grid>
      </Grid>
    </CandidateEditableCard>
  );
}

export default CandidateContactPanel;

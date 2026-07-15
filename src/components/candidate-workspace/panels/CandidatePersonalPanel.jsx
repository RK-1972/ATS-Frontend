import { useState } from "react";

import { FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";

import CandidateEditableCard from "../CandidateEditableCard";
import CandidateContactPanel from "./CandidateContactPanel";
import CandidateAddressPanel from "./CandidateAddressPanel";

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
  "Other"
];

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

function CandidatePersonalPanel({
  candidate = {},
  masterData,
  onSave,
  isSaving = false
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [draft, setDraft] = useState({});

  const startEdit = (cardKey) => {
    setEditingCard(cardKey);
    setDraft({ ...candidate });
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setDraft({});
  };

  const saveCard = async (fields) => {
    const payload = fields.reduce((acc, field) => {
      acc[field] = draft[field];
      return acc;
    }, {});

    await onSave?.(payload);
    setEditingCard(null);
    setDraft({});
  };

  return (
    <Stack spacing={2}>
      <CandidateEditableCard
        title="Personal Information"
        isEditing={editingCard === "personal"}
        isSaving={isSaving}
        onEdit={() => startEdit("personal")}
        onCancel={cancelEdit}
        onSave={() =>
          saveCard([
            "first_name",
            "middle_name",
            "last_name",
            "preferred_name",
            "gender"
          ])
        }
        editContent={
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={draft.first_name || ""}
                onChange={(e) => setDraft((p) => ({ ...p, first_name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Middle Name"
                value={draft.middle_name || ""}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    middle_name: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={draft.last_name || ""}
                onChange={(e) => setDraft((p) => ({ ...p, last_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Preferred Name"
                value={draft.preferred_name || ""}
                onChange={(e) => setDraft((p) => ({ ...p, preferred_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="candidate-gender-label">Gender</InputLabel>
                <Select
                  labelId="candidate-gender-label"
                  label="Gender"
                  value={draft.gender || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, gender: e.target.value }))}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FieldBlock label="First Name">
              <Typography variant="body2">{candidate.first_name || "—"}</Typography>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Middle Name">
              <Typography variant="body2">{candidate.middle_name || "—"}</Typography>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Last Name">
              <Typography variant="body2">{candidate.last_name || "—"}</Typography>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Preferred Name">
              <Typography variant="body2">{candidate.preferred_name || "—"}</Typography>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Gender">
              <Typography variant="body2">{candidate.gender || "—"}</Typography>
            </FieldBlock>
          </Grid>
        </Grid>
      </CandidateEditableCard>

      <CandidateContactPanel
        candidate={candidate}
        onSave={onSave}
        isSaving={isSaving}
      />

      <CandidateAddressPanel
        candidate={candidate}
        masterData={masterData}
        onSave={onSave}
        isSaving={isSaving}
      />
    </Stack>
  );
}

export default CandidatePersonalPanel;

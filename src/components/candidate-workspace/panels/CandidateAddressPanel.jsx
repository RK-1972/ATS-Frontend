import { useState } from "react";

import { Grid, Stack, TextField, Typography } from "@mui/material";

import CandidateEditableCard from "../CandidateEditableCard";
import CandidateEmSelect from "../CandidateEmSelect";

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

function CandidateAddressPanel({
  candidate = {},
  masterData,
  onSave,
  isSaving = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const startEdit = () => {
    setIsEditing(true);
    setDraft({
      ...candidate,
      country_code: candidate.country_code || candidate.current_country || "",
      state_code: candidate.state_code || candidate.current_state || "",
      city_code: candidate.city_code || candidate.current_city || "",
      current_location: candidate.current_location || "",
      address_line: candidate.address_line || ""
    });
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
      title="Address"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={startEdit}
      onCancel={cancelEdit}
      onSave={() =>
        saveCard([
          "country_code",
          "state_code",
          "city_code",
          "current_location",
          "address_line"
        ])
      }
      editContent={
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CandidateEmSelect
              label="Country"
              entityType="countries"
              masterData={masterData}
              value={draft.country_code || ""}
              readOnly={false}
              onChange={(e) =>
                setDraft((p) => ({ ...p, country_code: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CandidateEmSelect
              label="State"
              entityType="states"
              masterData={masterData}
              value={draft.state_code || ""}
              readOnly={false}
              onChange={(e) =>
                setDraft((p) => ({ ...p, state_code: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CandidateEmSelect
              label="City"
              entityType="cities"
              masterData={masterData}
              value={draft.city_code || ""}
              readOnly={false}
              onChange={(e) =>
                setDraft((p) => ({ ...p, city_code: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Current Location"
              value={draft.current_location || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, current_location: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Address Line"
              multiline
              minRows={2}
              value={draft.address_line || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, address_line: e.target.value }))
              }
            />
          </Grid>
        </Grid>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FieldBlock label="Country">
            <CandidateEmSelect
              label="Country"
              entityType="countries"
              masterData={masterData}
              value={candidate.country_code || candidate.current_country}
            />
          </FieldBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldBlock label="State">
            <CandidateEmSelect
              label="State"
              entityType="states"
              masterData={masterData}
              value={candidate.state_code || candidate.current_state}
            />
          </FieldBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldBlock label="City">
            <CandidateEmSelect
              label="City"
              entityType="cities"
              masterData={masterData}
              value={candidate.city_code || candidate.current_city}
            />
          </FieldBlock>
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldBlock label="Current Location">
            <Typography variant="body2">
              {candidate.current_location || "—"}
            </Typography>
          </FieldBlock>
        </Grid>
        <Grid item xs={12}>
          <FieldBlock label="Address Line">
            <Typography variant="body2">
              {candidate.address_line || "—"}
            </Typography>
          </FieldBlock>
        </Grid>
      </Grid>
    </CandidateEditableCard>
  );
}

export default CandidateAddressPanel;

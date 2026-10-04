import { useMemo, useState } from "react";

import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

import { getPublishedRecords } from "@/enterprise/masterDataHelpers";
import {
  validateSkillExperienceMonths,
  validateSkillExperienceYears
} from "@/enterprise/candidateWorkspaceUtils";

const PROFICIENCY_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
];

const emptyMetadata = {
  years: "",
  months: "",
  proficiency_code: "",
  last_used_on: ""
};

function CandidateAddSkillDialog({
  open,
  onClose,
  masterData,
  onSaveAdd,
  onSaveEdit,
  initialValue = null,
  assignedSkillCodes = [],
  isSaving = false
}) {
  const skillOptions = getPublishedRecords(masterData, "skills");
  const isEdit = Boolean(initialValue);

  const [metadata, setMetadata] = useState(() =>
    initialValue
      ? {
          years: initialValue.years ?? "",
          months: initialValue.months ?? "",
          proficiency_code: initialValue.proficiency_code || "",
          last_used_on: initialValue.last_used_on
            ? String(initialValue.last_used_on).slice(0, 10)
            : ""
        }
      : emptyMetadata
  );
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [editSkillCode, setEditSkillCode] = useState(
    () => initialValue?.skill_code || ""
  );

  const assignedSet = useMemo(
    () => new Set(assignedSkillCodes.map((code) => String(code).toLowerCase())),
    [assignedSkillCodes]
  );

  const selectableOptions = useMemo(
    () =>
      skillOptions.filter(
        (option) => !assignedSet.has(String(option.code).toLowerCase())
      ),
    [skillOptions, assignedSet]
  );

  const handleClose = () => {
    setMetadata(emptyMetadata);
    setSelectedCodes([]);
    setEditSkillCode("");
    onClose();
  };

  const handleSave = async () => {
    if (isEdit) {
      if (!editSkillCode) {
        return;
      }

      await onSaveEdit?.({
        skill_code: editSkillCode,
        ...metadata
      });
    } else {
      if (!selectedCodes.length) {
        return;
      }

      await onSaveAdd?.({
        skillCodes: selectedCodes,
        ...metadata
      });
    }

    setMetadata(emptyMetadata);
    setSelectedCodes([]);
    setEditSkillCode("");
  };

  const selectedSkillLabels = useMemo(
    () =>
      selectedCodes.map((code) => {
        const match = skillOptions.find((option) => option.code === code);
        return match?.name || code;
      }),
    [selectedCodes, skillOptions]
  );

  const yearsValidation = validateSkillExperienceYears(metadata.years);
  const monthsValidation = validateSkillExperienceMonths(metadata.months);
  const experienceFieldsValid = yearsValidation.valid && monthsValidation.valid;

  const saveDisabled =
    isSaving ||
    !experienceFieldsValid ||
    (isEdit ? !editSkillCode : selectedCodes.length === 0);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Skill" : "Add Skill"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid item xs={12}>
            {isEdit ? (
              <TextField
                select
                fullWidth
                size="small"
                label="Skill"
                value={editSkillCode}
                onChange={(event) => setEditSkillCode(event.target.value)}
                disabled={isSaving}
              >
                {skillOptions.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Autocomplete
                multiple
                size="small"
                options={selectableOptions}
                getOptionLabel={(option) => option.name || option.code}
                value={selectableOptions.filter((option) =>
                  selectedCodes.includes(option.code)
                )}
                onChange={(_event, newValue) => {
                  setSelectedCodes(newValue.map((option) => option.code));
                }}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                disabled={isSaving}
                renderInput={(params) => (
                  <TextField {...params} label="Search skills" placeholder="Type to search" />
                )}
              />
            )}
          </Grid>

          {!isEdit && selectedSkillLabels.length > 0 ? (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Selected skills
              </Typography>
              <Chip
                size="small"
                label={selectedSkillLabels.join(", ")}
                sx={{ height: "auto", py: 0.5, "& .MuiChip-label": { whiteSpace: "normal" } }}
              />
            </Grid>
          ) : null}

          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Years"
              type="number"
              value={metadata.years}
              onChange={(event) =>
                setMetadata((prev) => ({ ...prev, years: event.target.value }))
              }
              disabled={isSaving}
              error={!yearsValidation.valid}
              helperText={yearsValidation.error || " "}
              slotProps={{
                htmlInput: { min: 0, step: 1 }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Months"
              type="number"
              value={metadata.months}
              onChange={(event) =>
                setMetadata((prev) => ({ ...prev, months: event.target.value }))
              }
              disabled={isSaving}
              error={!monthsValidation.valid}
              helperText={monthsValidation.error || " "}
              slotProps={{
                htmlInput: { min: 0, max: 11, step: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Proficiency"
              value={metadata.proficiency_code}
              onChange={(event) =>
                setMetadata((prev) => ({
                  ...prev,
                  proficiency_code: event.target.value
                }))
              }
              disabled={isSaving}
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
              value={metadata.last_used_on}
              onChange={(event) =>
                setMetadata((prev) => ({ ...prev, last_used_on: event.target.value }))
              }
              disabled={isSaving}
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
        <Button onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saveDisabled}>
          {isSaving ? "Saving..." : isEdit ? "Update Skill" : "Add Skill"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CandidateAddSkillDialog;

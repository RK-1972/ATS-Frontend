import { useState } from "react";

import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";

import useAtsStageCatalog from "@/hooks/useAtsStageCatalog";
import { buildStageSelectOptions } from "@/enterprise/atsStageCatalogUtils";

function CandidateStageControl({
  mapping = {},
  onUpdateStage,
  isSaving = false
}) {
  const mapId = mapping?.map_id;
  const { stages, isLoading, error, isEmpty } = useAtsStageCatalog();
  const stageOptions = buildStageSelectOptions(stages, mapping?.stage_name);

  const [stageName, setStageName] = useState(mapping?.stage_name || "");
  const [remarks, setRemarks] = useState("");

  if (!mapId) {
    return null;
  }

  const handleSubmit = async () => {
    const nextStage = stageName.trim();

    if (!nextStage) {
      return;
    }

    await onUpdateStage?.(mapId, nextStage, remarks.trim());
    setRemarks("");
  };

  const selectDisabled = isSaving || isLoading || isEmpty;
  const submitDisabled = isSaving || isLoading || isEmpty || !stageName.trim();

  return (
    <Stack spacing={1} mt={1.5}>
      {error ? (
        <Alert severity="warning" sx={{ py: 0 }}>
          {error}
        </Alert>
      ) : null}
      {isEmpty ? (
        <Alert severity="info" sx={{ py: 0 }}>
          No active ATS stages are available.
        </Alert>
      ) : null}
      <FormControl fullWidth size="small">
        <InputLabel id="candidate-stage-select-label">Pipeline stage</InputLabel>
        <Select
          labelId="candidate-stage-select-label"
          label="Pipeline stage"
          value={stageName}
          onChange={(event) => setStageName(event.target.value)}
          disabled={selectDisabled}
        >
          {isLoading ? (
            <MenuItem value="" disabled>
              Loading stages...
            </MenuItem>
          ) : null}
          {stageOptions.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="Remarks"
        value={remarks}
        onChange={(event) => setRemarks(event.target.value)}
        disabled={isSaving}
        fullWidth
        multiline
        minRows={2}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<TimelineOutlinedIcon />}
        onClick={handleSubmit}
        disabled={submitDisabled}
        sx={{ alignSelf: "flex-start", textTransform: "none" }}
      >
        {isSaving ? "Updating..." : "Update Stage"}
      </Button>
    </Stack>
  );
}

export default CandidateStageControl;

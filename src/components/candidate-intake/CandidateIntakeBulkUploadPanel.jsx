import { useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import useCandidateSources from "@/hooks/useCandidateSources";
import useBulkCandidateIntake from "@/hooks/useBulkCandidateIntake";
import {
  BULK_INTAKE_ACCEPT,
  BULK_INTAKE_MAX_FILES,
  validateBulkIntakeSelection
} from "@/utils/candidateBulkIntakeUtils";

const STATUS_META = {
  queued: {
    label: "Queued",
    color: "default"
  },
  processing: {
    label: "Processing",
    color: "info"
  },
  parsed: {
    label: "Ready for Review",
    color: "success"
  },
  duplicate: {
    label: "Duplicate",
    color: "warning"
  },
  failed: {
    label: "Failed",
    color: "error"
  }
};

function BulkResultRow({
  item,
  disabled = false,
  onRetry
}) {
  const statusMeta = STATUS_META[item.status] || STATUS_META.queued;
  const candidateLabel = [item.candidateName, item.candidateCode]
    .filter(Boolean)
    .join(item.candidateName && item.candidateCode ? " · " : "")
    .trim();

  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >
      <Stack spacing={0.75}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {item.fileName}
            </Typography>
            {candidateLabel ? (
              <Typography variant="caption" color="text.secondary" display="block">
                {candidateLabel}
              </Typography>
            ) : null}
          </Box>

          <Stack direction="row" spacing={0.75} alignItems="center">
            {item.status === "processing" ? (
              <CircularProgress size={16} />
            ) : null}
            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color}
              variant={item.status === "queued" ? "outlined" : "filled"}
            />
          </Stack>
        </Stack>

        {item.message ? (
          <Typography variant="caption" color="text.secondary">
            {item.message}
          </Typography>
        ) : null}

        {item.status === "failed" ? (
          <Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ReplayOutlinedIcon />}
              disabled={disabled}
              onClick={() => onRetry?.(item)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Retry
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

function CandidateIntakeBulkUploadPanel({ onBatchComplete }) {
  const inputRef = useRef(null);
  const { candidateSources, loading: sourcesLoading } = useCandidateSources();
  const {
    items,
    processing,
    runSequentialBatch,
    retryFailedItem,
    resetBulkSession
  } = useBulkCandidateIntake();

  const [selectedSource, setSelectedSource] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectionError, setSelectionError] = useState("");
  const [batchError, setBatchError] = useState("");

  const summary = useMemo(() => {
    return items.reduce(
      (accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] || 0) + 1;
        return accumulator;
      },
      {}
    );
  }, [items]);

  const completedCount = items.filter(
    (item) => item.status !== "queued" && item.status !== "processing"
  ).length;

  const progressValue =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const { validFiles, error } = validateBulkIntakeSelection(
      event.target.files
    );

    event.target.value = "";
    setSelectionError(error || "");
    setSelectedFiles(validFiles);
    setBatchError("");
    resetBulkSession();
  };

  const handleStartBatch = async () => {
    if (!selectedSource) {
      setBatchError("Select a candidate source before starting bulk upload.");
      return;
    }

    if (selectedFiles.length === 0) {
      setBatchError("Select at least one PDF resume.");
      return;
    }

    setBatchError("");

    try {
      await runSequentialBatch({
        files: selectedFiles,
        sourceId: selectedSource,
        onFileComplete: () => {
          onBatchComplete?.();
        }
      });
      onBatchComplete?.();
    } catch (error) {
      setBatchError(error.message || "Bulk upload failed.");
    }
  };

  const handleRetry = async (item) => {
    if (!selectedSource) {
      setBatchError("Select a candidate source before retrying.");
      return;
    }

    setBatchError("");

    try {
      await retryFailedItem({
        item,
        sourceId: selectedSource,
        onFileComplete: () => {
          onBatchComplete?.();
        }
      });
      onBatchComplete?.();
    } catch (error) {
      setBatchError(error.message || "Retry failed.");
    }
  };

  const canStart =
    Boolean(selectedSource) &&
    selectedFiles.length > 0 &&
    !processing &&
    !selectionError;

  return (
    <Stack spacing={1.5} sx={{ p: 1.5, minHeight: 0 }}>
      <EnterpriseCard
        title="Bulk Upload CVs"
        subtitle={`Upload up to ${BULK_INTAKE_MAX_FILES} PDF resumes sequentially`}
      >
        <Stack spacing={1.5}>
          <FormControl fullWidth size="small" disabled={sourcesLoading || processing}>
            <InputLabel id="bulk-candidate-intake-source-label">
              Source
            </InputLabel>
            <Select
              labelId="bulk-candidate-intake-source-label"
              label="Source"
              value={selectedSource}
              onChange={(event) => setSelectedSource(event.target.value)}
            >
              {candidateSources.map((source) => (
                <MenuItem
                  key={source.source_id}
                  value={source.source_id}
                >
                  {source.source_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              border: 1,
              borderStyle: "dashed",
              borderColor: "divider",
              borderRadius: 2,
              px: 1.5,
              py: 2,
              textAlign: "center",
              bgcolor: "background.default"
            }}
          >
            <CloudUploadOutlinedIcon
              color="action"
              sx={{ fontSize: 32, mb: 0.5 }}
            />
            <Typography variant="body2" fontWeight={600}>
              Select PDF resumes
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ my: 0.75 }}
            >
              PDF only · Max {BULK_INTAKE_MAX_FILES} files · 5 MB each
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<FolderOpenOutlinedIcon />}
              disabled={processing}
              onClick={handleBrowseClick}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Browse Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={BULK_INTAKE_ACCEPT}
              multiple
              hidden
              onChange={handleFileChange}
            />
          </Box>

          {selectedFiles.length > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {selectedFiles.length} file
              {selectedFiles.length === 1 ? "" : "s"} selected
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No files selected
            </Typography>
          )}

          {selectionError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {selectionError}
            </Alert>
          ) : null}

          {batchError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {batchError}
            </Alert>
          ) : null}

          <Button
            variant="contained"
            fullWidth
            disabled={!canStart}
            onClick={handleStartBatch}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {processing ? "Processing Batch..." : "Start Bulk Upload"}
          </Button>
        </Stack>
      </EnterpriseCard>

      {items.length > 0 ? (
        <EnterpriseCard title="Batch Results" subtitle="Per-file processing outcomes">
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {summary.parsed ? (
                <Chip
                  size="small"
                  color="success"
                  label={`Ready for Review: ${summary.parsed}`}
                />
              ) : null}
              {summary.duplicate ? (
                <Chip
                  size="small"
                  color="warning"
                  label={`Duplicate: ${summary.duplicate}`}
                />
              ) : null}
              {summary.failed ? (
                <Chip
                  size="small"
                  color="error"
                  label={`Failed: ${summary.failed}`}
                />
              ) : null}
            </Stack>

            {processing ? (
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{ borderRadius: 999, mb: 0.75 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {completedCount} of {items.length} completed
                </Typography>
              </Box>
            ) : null}

            <Stack spacing={1}>
              {items.map((item) => (
                <BulkResultRow
                  key={item.id}
                  item={item}
                  disabled={processing}
                  onRetry={handleRetry}
                />
              ))}
            </Stack>
          </Stack>
        </EnterpriseCard>
      ) : null}
    </Stack>
  );
}

export default CandidateIntakeBulkUploadPanel;

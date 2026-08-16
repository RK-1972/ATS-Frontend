import {
  Box,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { buildInterviewProgressPreviewStages } from "@/utils/interviewProgressPreviewUtils";

function StageIcon({ phase }) {
  if (phase === "completed") {
    return (
      <CheckCircleOutlineOutlinedIcon
        sx={{ fontSize: 16, color: "success.main" }}
      />
    );
  }

  if (phase === "current") {
    return (
      <TripOriginOutlinedIcon
        sx={{ fontSize: 16, color: "primary.main" }}
      />
    );
  }

  if (phase === "special") {
    return (
      <ErrorOutlineOutlinedIcon
        sx={{ fontSize: 16, color: "warning.main" }}
      />
    );
  }

  return (
    <RadioButtonUncheckedOutlinedIcon
      sx={{ fontSize: 16, color: "text.disabled" }}
    />
  );
}

function ProgressStageItem({ stage, isLast }) {
  const isCurrent = stage.phase === "current";
  const isSpecial = stage.phase === "special";

  return (
    <Box sx={{ display: "flex", gap: 1.25 }}>
      <Stack alignItems="center" spacing={0} sx={{ pt: 0.15 }}>
        <StageIcon phase={stage.phase} />
        {!isLast ? (
          <Box
            sx={{
              width: "1px",
              flex: 1,
              minHeight: 16,
              bgcolor: "divider",
              my: 0.35
            }}
          />
        ) : null}
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0, pb: isLast ? 0 : 1 }}>
        <Typography
          variant="body2"
          fontWeight={isCurrent ? 700 : 600}
          color={isCurrent ? "primary.main" : "text.primary"}
          sx={{ fontSize: 13, lineHeight: 1.3 }}
        >
          {stage.title}
        </Typography>

        <Typography
          variant="caption"
          color={
            isSpecial
              ? "warning.main"
              : isCurrent
                ? "primary.main"
                : "text.secondary"
          }
          sx={{ display: "block", fontWeight: 600, mt: 0.15, lineHeight: 1.3 }}
        >
          {stage.statusLabel}
        </Typography>

        {stage.detailLine ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.15, lineHeight: 1.35 }}
          >
            {stage.detailLine}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function InterviewProgressPreview({
  context,
  loading = false,
  error = ""
}) {
  const stages = buildInterviewProgressPreviewStages(context);
  const headerCode =
    context?.candidateCode
    || context?.candidateName
    || context?.requisitionCode
    || "Interview";

  return (
    <Box sx={{ width: 320, p: 1.75 }}>
      <Stack spacing={1}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {headerCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Interview Progress
          </Typography>
        </Box>

        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Loading interview progress…
            </Typography>
          </Stack>
        ) : null}

        {!loading && error ? (
          <Typography variant="caption" color="error.main">
            {error}
          </Typography>
        ) : null}

        {!loading && !error && stages.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No interview rounds scheduled yet.
          </Typography>
        ) : null}

        {!loading && !error && stages.length > 0 ? (
          <Stack
            spacing={0}
            sx={{
              maxHeight: 280,
              overflowY: "auto",
              pr: 0.25,
              mr: -0.25
            }}
          >
            {stages.map((stage, index) => (
              <ProgressStageItem
                key={stage.key}
                stage={stage}
                isLast={index === stages.length - 1}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export default InterviewProgressPreview;

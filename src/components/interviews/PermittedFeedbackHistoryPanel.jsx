import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Chip,
  Link,
  Stack,
  Typography
} from "@mui/material";

function formatSubmittedOn(value) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function PermittedFeedbackHistoryPanel({
  title = "Submitted feedback history",
  description,
  items = [],
  emptyMessage = "No submitted feedback records are available for your access scope."
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper"
      }}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {items.map((item) => (
              <Box
                key={`${item.interviewId || item.scheduleId}-${item.feedbackId || "pending"}`}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: 1.25
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.sessionLabel || item.roundType || "Interview session"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {[
                        item.stageBucket || null,
                        item.roundType || null,
                        item.candidateName
                          ? `${item.candidateCode || ""} ${item.candidateName}`.trim()
                          : null,
                        item.reqCode || null
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Submitted: {formatSubmittedOn(item.submittedOn)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {item.sessionOutcome ? (
                      <Chip
                        size="small"
                        label={item.sessionOutcome}
                        color={item.sessionOutcome === "Rejected" ? "warning" : "success"}
                        variant="outlined"
                      />
                    ) : (
                      <Chip size="small" label="Pending" variant="outlined" />
                    )}

                    {item.viewFeedbackPath ? (
                      <Link
                        component={RouterLink}
                        to={item.viewFeedbackPath}
                        variant="body2"
                        underline="hover"
                        sx={{ fontWeight: 600 }}
                      >
                        View feedback
                      </Link>
                    ) : null}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default PermittedFeedbackHistoryPanel;

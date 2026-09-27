import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { useTheme } from "@mui/material/styles";

import {
  EnterpriseModuleIcon,
  EnterpriseSurface
} from "@/components/enterprise";
import recruitmentClient from "@/api/clients/recruitmentClient";

const STATUS_COLORS = {
  Meets: "success",
  Partial: "warning",
  Unclear: "default",
  "Not Evidenced": "default"
};

function RequirementRow({ row }) {
  return (
    <Box sx={{ py: 0.75 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="body2" fontWeight={600}>
          {row.requirement}
        </Typography>
        <Chip
          label={row.status}
          size="small"
          color={STATUS_COLORS[row.status] || "default"}
          variant="outlined"
        />
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {row.supporting_evidence}
      </Typography>
    </Box>
  );
}

function CandidateAiInsightsPanel({
  open,
  onToggle,
  candidateId,
  requisitionCode
}) {
  const theme = useTheme();
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [reviewPayload, setReviewPayload] = useState(null);

  const loadAvailability = useCallback(async () => {
    setLoadingAvailability(true);
    try {
      const response = await recruitmentClient.getAiReviewAvailability();
      setAvailability(response?.data || null);
    } catch {
      setAvailability({
        ai_module_enabled: false,
        feature_enabled: false,
        available: false
      });
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    setReviewPayload(null);
    setError("");
  }, [candidateId, requisitionCode]);

  const handleGenerate = async () => {
    if (!candidateId || !requisitionCode) {
      setError("Map this candidate to a requisition before generating an AI review.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await recruitmentClient.generateAiCandidateReview(
        candidateId,
        requisitionCode
      );

      if (!response?.success) {
        throw new Error(response?.message || "AI review could not be generated.");
      }

      setReviewPayload(response.data);
    } catch (generateError) {
      const message =
        generateError?.response?.data?.message ||
        generateError.message ||
        "AI review could not be generated.";
      setError(message);
      setReviewPayload(null);
    } finally {
      setGenerating(false);
    }
  };

  const showPanel = open;
  const aiAvailable = Boolean(availability?.available);
  const review = reviewPayload?.review;

  if (!showPanel) {
    return (
      <Box
        sx={{
          width: 44,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          pt: 0.5
        }}
      >
        <IconButton onClick={onToggle} aria-label="Expand AI insights" size="small">
          <AutoAwesomeOutlinedIcon color="primary" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", lg: 320 },
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        maxHeight: { lg: "calc(100vh - 160px)" },
        overflow: "auto",
        position: { lg: "sticky" },
        top: { lg: 12 }
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <EnterpriseModuleIcon
            icon={AutoAwesomeOutlinedIcon}
            module="team"
            density="sm"
            size={28}
            iconSize={16}
          />
          <Typography variant="subtitle2" fontWeight={700}>
            AI Candidate Review
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onToggle} sx={{ display: { xs: "none", lg: "inline-flex" } }}>
          <ChevronRightOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Advisory only. Does not change candidate status or make hiring decisions.
      </Typography>

      {loadingAvailability ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      ) : null}

      {!loadingAvailability && !aiAvailable ? (
        <Alert severity="info" sx={{ py: 0.5 }}>
          AI Candidate Review is disabled. Enable the AI module and AI Candidate Review in Platform
          Configuration.
        </Alert>
      ) : null}

      {!loadingAvailability && aiAvailable ? (
        <>
          {!requisitionCode ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Map this candidate to a requisition to generate a review against role requirements.
            </Alert>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={handleGenerate}
              disabled={generating || !candidateId}
              startIcon={
                generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeOutlinedIcon />
              }
            >
              {generating ? "Generating…" : "Generate AI Review"}
            </Button>
          )}

          {error ? (
            <Alert severity="error" sx={{ py: 0.5 }}>
              {error}
            </Alert>
          ) : null}

          {review ? (
            <Stack spacing={1.25}>
              {reviewPayload.generated_at ? (
                <Typography variant="caption" color="text.secondary">
                  Generated {new Date(reviewPayload.generated_at).toLocaleString()}
                </Typography>
              ) : null}

              <EnterpriseSurface sx={{ p: 1.25 }}>
                <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                  Candidate Summary
                </Typography>
                <Typography variant="body2">{review.candidate_summary}</Typography>
              </EnterpriseSurface>

              <EnterpriseSurface sx={{ p: 1.25 }}>
                <Typography variant="caption" fontWeight={700} display="block" mb={0.75}>
                  Requirement Analysis
                </Typography>
                {review.requirement_analysis?.map((row, index) => (
                  <RequirementRow key={`${row.requirement}-${index}`} row={row} />
                ))}
              </EnterpriseSurface>

              <EnterpriseSurface sx={{ p: 1.25 }}>
                <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                  Strengths
                </Typography>
                <List dense disablePadding>
                  {review.strengths?.map((item) => (
                    <ListItem key={item} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
                    </ListItem>
                  ))}
                </List>
              </EnterpriseSurface>

              <EnterpriseSurface sx={{ p: 1.25 }}>
                <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                  Areas to Validate
                </Typography>
                <List dense disablePadding>
                  {review.areas_to_validate?.map((item) => (
                    <ListItem key={item} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
                    </ListItem>
                  ))}
                </List>
              </EnterpriseSurface>

              <EnterpriseSurface
                sx={{
                  p: 1.25,
                  borderColor: "primary.main",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.background.paper} 100%)`
                }}
              >
                <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                  Suggested Recruiter Questions
                </Typography>
                <List dense disablePadding>
                  {review.suggested_recruiter_questions?.map((item) => (
                    <ListItem key={item} disablePadding sx={{ py: 0.25 }}>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
                    </ListItem>
                  ))}
                </List>
              </EnterpriseSurface>

              <Divider />
              <Typography variant="caption" color="text.secondary">
                {reviewPayload.advisory_notice}
              </Typography>
            </Stack>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}

export default CandidateAiInsightsPanel;

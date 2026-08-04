import { useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActionArea,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import ScheduleInterviewCandidatePicker from "@/copilot/conversations/ScheduleInterviewCandidatePicker";
import ScheduleInterviewInterviewerPicker from "@/copilot/conversations/ScheduleInterviewInterviewerPicker";
import ScheduleInterviewLevelPicker from "@/copilot/conversations/ScheduleInterviewLevelPicker";
import AssignRecruiterRequisitionPicker from "@/copilot/conversations/AssignRecruiterRequisitionPicker";
import AssignRecruiterRecruiterPicker from "@/copilot/conversations/AssignRecruiterRecruiterPicker";
import MapCandidateRequisitionPicker from "@/copilot/conversations/MapCandidateRequisitionPicker";
import ConductInterviewPicker from "@/copilot/conversations/ConductInterviewPicker";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";

const ACTION_CARDS = [
  {
    id: "requisitions",
    title: "My Requisitions",
    description: "View and manage assigned requisitions",
    inputText: "Show My Requisitions",
    Icon: AssignmentOutlinedIcon,
    accent: "#1f3b63",
    module: "requisitions"
  },
  {
    id: "candidates",
    title: "Candidates",
    description: "Search and manage candidates",
    inputText: "Show Java Candidates",
    Icon: PeopleAltOutlinedIcon,
    accent: "#1967d2",
    module: "candidates"
  },
  {
    id: "interview",
    title: "Schedule Interview",
    description: "Create or manage interviews",
    inputText: "Schedule Interview",
    Icon: EventAvailableOutlinedIcon,
    accent: "#f39c12",
    module: "interviews"
  },
  {
    id: "todays-interviews",
    title: "Today's Interviews",
    description: "View interviews scheduled for today",
    inputText: "Show Today's Interviews",
    Icon: TodayOutlinedIcon,
    accent: "#b06000",
    module: "interviews"
  },
  {
    id: "assign-recruiter",
    title: "Assign Recruiter",
    description: "Assign a recruiter to a requisition",
    inputText: "Assign Recruiter",
    Icon: PersonAddAlt1OutlinedIcon,
    accent: "#137333",
    module: "recruitment"
  },
  {
    id: "map-candidate",
    title: "Map Candidate",
    description: "Map a candidate to a requisition",
    inputText: "Map Candidate",
    Icon: LinkOutlinedIcon,
    accent: "#0b57d0",
    module: "candidates"
  },
  {
    id: "conduct-interview",
    title: "Conduct Interview",
    description: "Open an assigned interview in your workspace",
    inputText: "Conduct Interview",
    Icon: RateReviewOutlinedIcon,
    accent: "#7b1fa2",
    module: "approvals"
  }
];

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function ActionCard({ title, description, Icon, accent, module = "recruitment", onSelect }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: `0 1px 2px ${alpha("#000", 0.04)}, 0 1px 3px ${alpha(theme.palette.primary.main, 0.06)}`,
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: alpha(accent, 0.35),
          boxShadow: `0 4px 12px ${alpha(accent, 0.14)}, 0 1px 3px ${alpha("#000", 0.06)}`
        }
      }}
    >
      <CardActionArea
        onClick={onSelect}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.25,
          py: 1,
          textAlign: "left"
        }}
      >
        <EnterpriseModuleIcon
          icon={Icon}
          module={module}
          density="sm"
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.25 }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.15, lineHeight: 1.35 }}
          >
            {description}
          </Typography>
        </Box>

        <ArrowForwardIosOutlinedIcon
          sx={{ fontSize: 12, color: "text.disabled", flexShrink: 0 }}
        />
      </CardActionArea>
    </Paper>
  );
}

function ConversationFieldInput({
  prompt,
  disabled,
  onAnswer
}) {
  const initialDate =
    typeof prompt?.currentValue === "string" ? prompt.currentValue : "";
  const initialTime =
    typeof prompt?.currentValue === "string" ? prompt.currentValue : "";
  const [dateValue, setDateValue] = useState(initialDate);
  const [timeValue, setTimeValue] = useState(initialTime);
  const hasCurrentValue = prompt?.currentValue != null && prompt.currentValue !== "";

  if (!prompt || prompt.kind !== "question") {
    return null;
  }

  if (prompt.inputType === "candidate") {
    return (
      <Stack spacing={1}>
        <ScheduleInterviewCandidatePicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(candidate) => onAnswer?.(prompt.fieldKey, candidate)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "interview") {
    return (
      <Stack spacing={1}>
        <ConductInterviewPicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(interview) => onAnswer?.(prompt.fieldKey, interview)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "interviewer") {
    return (
      <Stack spacing={1}>
        <ScheduleInterviewInterviewerPicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(interviewer) => onAnswer?.(prompt.fieldKey, interviewer)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "interview_level") {
    return (
      <Stack spacing={1}>
        <ScheduleInterviewLevelPicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(level) => onAnswer?.(prompt.fieldKey, level)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "requisition") {
    return (
      <Stack spacing={1}>
        <AssignRecruiterRequisitionPicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(requisition) => onAnswer?.(prompt.fieldKey, requisition)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "my_requisition") {
    return (
      <Stack spacing={1}>
        <MapCandidateRequisitionPicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(requisition) => onAnswer?.(prompt.fieldKey, requisition)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "recruiter") {
    return (
      <Stack spacing={1}>
        <AssignRecruiterRecruiterPicker
          disabled={disabled}
          initialValue={prompt.currentValue || null}
          onSelect={(recruiter) => onAnswer?.(prompt.fieldKey, recruiter)}
        />
        {hasCurrentValue ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              disabled={disabled}
              onClick={() => onAnswer?.(prompt.fieldKey, prompt.currentValue)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Continue
            </Button>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (prompt.inputType === "date") {
    return (
      <Stack spacing={1}>
        <TextField
          size="small"
          type="date"
          label="Interview Date"
          value={dateValue}
          disabled={disabled}
          onChange={(event) => setDateValue(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            variant="contained"
            disabled={disabled || !dateValue}
            onClick={() => onAnswer?.(prompt.fieldKey, dateValue)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Continue
          </Button>
        </Box>
      </Stack>
    );
  }

  if (prompt.inputType === "time") {
    return (
      <Stack spacing={1}>
        <TextField
          size="small"
          type="time"
          label="Interview Time"
          value={timeValue}
          disabled={disabled}
          onChange={(event) => setTimeValue(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            variant="contained"
            disabled={disabled || !timeValue}
            onClick={() => onAnswer?.(prompt.fieldKey, timeValue)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Continue
          </Button>
        </Box>
      </Stack>
    );
  }

  return null;
}

/**
 * Right-side Copilot drawer shell.
 */
function OptalynxCopilotDrawer({
  open,
  onClose,
  inputValue,
  onInputChange,
  onSend,
  onSuggestionSelect,
  feedbackMessage,
  userName,
  conversationPrompt = null,
  conversationBusy = false,
  onConversationFieldAnswer,
  onConversationBack,
  canGoBack = false,
  conversationProgress = null,
  onConfirmAssignRecruiter,
  onCancelAssignRecruiter,
  onConfirmMapCandidate,
  onCancelMapCandidate,
  onOpenConductInterview,
  onPreviousConductInterview,
  outcomeAction = null,
  onOutcomeAction
}) {
  const theme = useTheme();
  const greeting = getTimeGreeting();
  const displayName = userName || "there";
  const inQuestion = conversationPrompt?.kind === "question";
  const inConfirm = conversationPrompt?.kind === "confirm";
  const inConversation = inQuestion || inConfirm;
  const outcomeCardRef = useRef(null);

  // Scroll the outcome into view after it exists in the drawer DOM (success or failure).
  useLayoutEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const outcomeNode = outcomeCardRef.current;
    if (!outcomeNode) {
      return;
    }

    outcomeNode.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [feedbackMessage, outcomeAction]);

  const handleSend = () => {
    onSend?.(inputValue);
  };

  const confirmWorkflow = inConfirm ? conversationPrompt.workflow : null;
  const confirmContext = inConfirm ? conversationPrompt.context || {} : null;
  const interviewReview = confirmContext?.interview || {};

  const confirmCard =
    confirmWorkflow === "CONDUCT_INTERVIEW"
      ? {
          title: "Conduct Interview",
          badge: "Review",
          question: "Would you like to open this interview?",
          confirmLabel: "Open Interview",
          cancelLabel: "Previous",
          cancelStartIcon: true,
          rows: [
            {
              label: "CANDIDATE",
              value:
                interviewReview.candidateName ||
                interviewReview.label ||
                "—"
            },
            {
              label: "POSITION",
              value: interviewReview.jobTitle || "—"
            },
            {
              label: "ROUND",
              value: interviewReview.roundType || "—"
            },
            {
              label: "INTERVIEW DATE",
              value: interviewReview.interviewDate || "—"
            },
            {
              label: "INTERVIEW TIME",
              value: interviewReview.interviewTime || "—"
            },
            {
              label: "INTERVIEWER",
              value: interviewReview.interviewerName || "—"
            }
          ],
          onConfirm: onOpenConductInterview,
          onCancel: onPreviousConductInterview
        }
      : confirmWorkflow === "MAP_CANDIDATE"
        ? {
            title: "Map Candidate to Requisition",
            badge: "Confirm",
            question: "Would you like me to complete this mapping?",
            confirmLabel: "Confirm",
            cancelLabel: "Cancel",
            cancelStartIcon: false,
            rows: [
              {
                label: "CANDIDATE",
                value:
                  confirmContext?.candidate?.candidateName ||
                  confirmContext?.candidate?.label ||
                  confirmContext?.candidate?.candidateCode ||
                  "—"
              },
              {
                label: "REQUISITION",
                value:
                  confirmContext?.requisition?.jobTitle ||
                  confirmContext?.requisition?.label ||
                  confirmContext?.requisition?.reqCode ||
                  "—"
              }
            ],
            onConfirm: onConfirmMapCandidate,
            onCancel: onCancelMapCandidate
          }
        : {
            title: "Assign Recruiter",
            badge: "Confirm",
            question: "Would you like me to complete this assignment?",
            confirmLabel: "Confirm",
            cancelLabel: "Cancel",
            cancelStartIcon: false,
            rows: [
              {
                label: "REQUISITION",
                value:
                  confirmContext?.requisition?.jobTitle ||
                  confirmContext?.requisition?.label ||
                  confirmContext?.requisition?.reqCode ||
                  "—"
              },
              {
                label: "RECRUITER",
                value:
                  confirmContext?.recruiter?.fullName ||
                  confirmContext?.recruiter?.label ||
                  confirmContext?.recruiter?.employeeCode ||
                  "—"
              }
            ],
            onConfirm: onConfirmAssignRecruiter,
            onCancel: onCancelAssignRecruiter
          };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default"
        }
      }}
    >
      <Box
        sx={{
          position: "relative",
          px: 2,
          pt: 1.75,
          pb: inConversation ? 1.5 : 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.primary.light} 100%)`,
          color: "#FFFFFF"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 1.5
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha("#FFFFFF", 0.16),
                border: `1px solid ${alpha("#FFFFFF", 0.22)}`
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, letterSpacing: "-0.01em", color: "#FFFFFF" }}
            >
              Optalynx Copilot
            </Typography>
          </Stack>

          <IconButton
            aria-label="Close Copilot"
            onClick={onClose}
            size="small"
            sx={{
              color: alpha("#FFFFFF", 0.9),
              "&:hover": { bgcolor: alpha("#FFFFFF", 0.12) }
            }}
          >
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            color: "#FFFFFF",
            fontSize: 18
          }}
        >
          {greeting}, {displayName}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.35, color: alpha("#FFFFFF", 0.82), fontSize: 13 }}
        >
          How can I help you today?
        </Typography>

        {inConversation ? (
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              minHeight: 32
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                transition: "opacity 160ms ease, transform 160ms ease",
                opacity: inQuestion && canGoBack ? 1 : 0,
                transform:
                  inQuestion && canGoBack ? "translateX(0)" : "translateX(-4px)",
                pointerEvents: inQuestion && canGoBack ? "auto" : "none"
              }}
            >
              {inQuestion && canGoBack ? (
                <Button
                  variant="tonal"
                  color="primary"
                  size="small"
                  startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onConversationBack?.()}
                  disabled={conversationBusy}
                  aria-label="Previous conversation step"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                    minHeight: 28,
                    px: 1.25,
                    bgcolor: alpha("#FFFFFF", 0.94),
                    color: "primary.main",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#FFFFFF",
                      boxShadow: `0 1px 3px ${alpha("#000", 0.12)}`
                    },
                    "&.Mui-disabled": {
                      bgcolor: alpha("#FFFFFF", 0.55),
                      color: alpha(theme.palette.primary.main, 0.5)
                    }
                  }}
                >
                  Previous
                </Button>
              ) : null}
            </Box>

            {inQuestion && conversationProgress ? (
              <Typography
                variant="caption"
                sx={{
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.02em",
                  color: alpha("#FFFFFF", 0.92),
                  bgcolor: alpha("#FFFFFF", 0.14),
                  border: `1px solid ${alpha("#FFFFFF", 0.2)}`,
                  borderRadius: 1,
                  px: 1,
                  py: 0.4,
                  transition: "opacity 160ms ease"
                }}
                aria-live="polite"
              >
                Step {conversationProgress.step} of {conversationProgress.total}
              </Typography>
            ) : inConfirm ? (
              <Typography
                variant="caption"
                sx={{
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.02em",
                  color: alpha("#FFFFFF", 0.92),
                  bgcolor: alpha("#FFFFFF", 0.14),
                  border: `1px solid ${alpha("#FFFFFF", 0.2)}`,
                  borderRadius: 1,
                  px: 1,
                  py: 0.4
                }}
              >
                {confirmCard.badge || "Confirm"}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 1.75,
          py: 1.5
        }}
      >
        {inQuestion ? (
          <Box
            key={conversationPrompt.fieldKey}
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              boxShadow: `0 1px 2px ${alpha("#000", 0.04)}`,
              "@keyframes copilotQuestionIn": {
                from: { opacity: 0, transform: "translateY(4px)" },
                to: { opacity: 1, transform: "translateY(0)" }
              },
              animation: "copilotQuestionIn 180ms ease"
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1.25, color: "text.primary" }}
            >
              {conversationPrompt.question}
            </Typography>
            <ConversationFieldInput
              key={conversationPrompt.fieldKey}
              prompt={conversationPrompt}
              disabled={conversationBusy}
              onAnswer={onConversationFieldAnswer}
            />
          </Box>
        ) : inConfirm ? (
          <Box
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              boxShadow: `0 1px 2px ${alpha("#000", 0.04)}`
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1.25, color: "text.primary" }}
            >
              {confirmCard.title}
            </Typography>

            {confirmCard.rows.map((row) => (
              <Box key={row.label}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    display: "block"
                  }}
                >
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.25, fontWeight: 600 }}>
                  {row.value}
                </Typography>
              </Box>
            ))}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {confirmCard.question}
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                disabled={conversationBusy}
                startIcon={
                  confirmCard.cancelStartIcon ? (
                    <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />
                  ) : undefined
                }
                onClick={() => confirmCard.onCancel?.()}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {confirmCard.cancelLabel || "Cancel"}
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={conversationBusy}
                onClick={() => confirmCard.onConfirm?.()}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {confirmCard.confirmLabel || "Confirm"}
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
              <FlashOnOutlinedIcon
                sx={{ fontSize: 15, color: "primary.main" }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                Quick Actions
              </Typography>
            </Stack>

            <Stack spacing={0.85}>
              {ACTION_CARDS.map((action) => (
                <ActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  Icon={action.Icon}
                  accent={action.accent}
                  module={action.module}
                  onSelect={() => onSuggestionSelect?.(action.inputText)}
                />
              ))}
            </Stack>
          </>
        )}

        {feedbackMessage ? (
          <Box
            ref={outcomeCardRef}
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              boxShadow: `0 1px 2px ${alpha("#000", 0.04)}`
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line", lineHeight: 1.55, fontSize: 13 }}
            >
              {feedbackMessage}
            </Typography>
            {outcomeAction?.label ? (
              <Box sx={{ mt: 1.25, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  variant="tonal"
                  color="primary"
                  disabled={conversationBusy}
                  onClick={() => onOutcomeAction?.()}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {outcomeAction.label}
                </Button>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          px: 1.75,
          py: 1.5,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider"
        }}
      >
        <Stack spacing={1}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={onInputChange}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.default",
                alignItems: "flex-start",
                fontSize: 13
              }
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SendOutlinedIcon />}
              onClick={handleSend}
              disabled={conversationBusy}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                borderRadius: 2
              }}
            >
              Send
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default OptalynxCopilotDrawer;

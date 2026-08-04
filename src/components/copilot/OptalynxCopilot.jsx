import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import OptalynxCopilotDrawer from "./OptalynxCopilotDrawer";
import { useCopilotContext } from "./CopilotContext";
import { createActionDispatcher, resolveIntent } from "@/copilot/core";
import {
  bootstrapConversationEngine,
  createConversationEngine,
  getConversationDefinitionById
} from "@/copilot/conversation-engine";
import { launchScheduleInterviewFromConversation } from "@/copilot/conversations/ScheduleInterviewOrchestrator";
import { executeAssignRecruiterFromConversation } from "@/copilot/conversations/AssignRecruiterOrchestrator";
import { executeMapCandidateFromConversation } from "@/copilot/conversations/MapCandidateOrchestrator";
import { launchConductInterviewFromConversation } from "@/copilot/conversations/ConductInterviewOrchestrator";

// ---------------------------------------------------------------------------
// LEGACY — Command Registry (backward compatibility only)
// ---------------------------------------------------------------------------
import {
  createCopilotCommandRegistry,
  findCopilotCommand
} from "./commandRegistry";

const UNKNOWN_COMMAND_MESSAGE =
  "Sorry, I don't understand that command yet.";

const ASSIGN_RECRUITERS_PATH = "/requisitions/assign-recruiters";

/** Phrase match only — Intent Engine is not extended for this workflow. */
function isMapCandidatePhrase(message) {
  const normalized = String(message || "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "");

  return (
    normalized === "map candidate" ||
    normalized === "map candidate to requisition" ||
    normalized === "map a candidate"
  );
}

/** Phrase match only — Intent Engine is not extended for this workflow. */
function isConductInterviewPhrase(message) {
  const normalized = String(message || "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "");

  return (
    normalized === "conduct interview" ||
    normalized === "conduct an interview" ||
    normalized === "start interview"
  );
}

/** Standalone ack phrases that add no information — skip in the drawer UX. */
const ACKNOWLEDGEMENT_ONLY_PATTERN =
  /^(certainly|sure|okay|ok|got it|alright|all right|sounds good|great)[.!]?$/i;

function isAcknowledgementOnlyMessage(message) {
  return ACKNOWLEDGEMENT_ONLY_PATTERN.test(String(message || "").trim());
}

/**
 * Derive Step X of Y from the active Conversation Definition (presentation only).
 * Works for any registered workflow — no hardcoded step counts.
 */
function getConversationProgress(engine, prompt) {
  if (!prompt || prompt.kind !== "question" || !prompt.fieldKey) {
    return null;
  }

  const session = engine.getSession?.();
  if (!session?.definitionId) {
    return null;
  }

  const definition = getConversationDefinitionById(session.definitionId);
  const fields = definition?.fields;

  if (!Array.isArray(fields) || fields.length === 0) {
    return null;
  }

  const index = fields.findIndex((field) => field.key === prompt.fieldKey);

  if (index < 0) {
    return null;
  }

  return {
    step: index + 1,
    total: fields.length,
    title: definition.title || ""
  };
}

bootstrapConversationEngine();

/**
 * Copilot entry point: header trigger + drawer.
 */
function OptalynxCopilot({ iconButtonSx }) {
  const navigate = useNavigate();
  const { currentCandidate } = useCopilotContext();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [conversationPrompt, setConversationPrompt] = useState(null);
  const [conversationBusy, setConversationBusy] = useState(false);
  const [outcomeAction, setOutcomeAction] = useState(null);
  const activeWorkflowIntentRef = useRef(null);

  const conversationEngine = useMemo(() => createConversationEngine(), []);

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (_error) {
      return null;
    }
  })();
  const userName = loggedInUser?.full_name || "there";

  const currentCandidateRef = useRef(currentCandidate);
  currentCandidateRef.current = currentCandidate;

  const actionDispatcher = useMemo(
    () => createActionDispatcher({ navigate }),
    [navigate]
  );

  const legacyCommandRegistry = useMemo(
    () =>
      createCopilotCommandRegistry({
        navigate,
        getCurrentCandidate: () => currentCandidateRef.current
      }),
    [navigate]
  );

  const resetConversation = () => {
    conversationEngine.reset();
    activeWorkflowIntentRef.current = null;
    setConversationPrompt(null);
    setConversationBusy(false);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    resetConversation();
    setOutcomeAction(null);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSuggestionSelect = (label) => {
    setInputValue(label);
  };

  const handleScheduleInterviewComplete = async (context) => {
    setConversationBusy(true);
    setFeedbackMessage("");
    setOutcomeAction(null);

    const result = await launchScheduleInterviewFromConversation(navigate, {
      candidate: context.candidate || null,
      interviewer: context.interviewer || null,
      interviewLevel: context.interviewLevel || null,
      interviewDate: context.interviewDate || null,
      interviewTime: context.interviewTime || null
    });

    setConversationBusy(false);

    if (!result.ok) {
      setFeedbackMessage(result.message);
      return;
    }

    resetConversation();
    setOpen(false);
  };

  const handleConductInterviewComplete = async (context) => {
    setConversationBusy(true);
    setFeedbackMessage("");
    setOutcomeAction(null);

    const result = launchConductInterviewFromConversation(navigate, {
      interview: context.interview || null
    });

    setConversationBusy(false);

    if (!result.ok) {
      setFeedbackMessage(result.message);
      return;
    }

    resetConversation();
    setOpen(false);
  };

  const handleConductInterviewOpen = async () => {
    if (conversationPrompt?.kind !== "confirm") {
      return;
    }

    const context = conversationPrompt.context || {};
    await handleConductInterviewComplete(context);
  };

  const handleConductInterviewPrevious = async () => {
    const prompt = conversationEngine.back();
    await applyConversationPrompt(prompt);
  };

  const handleAssignRecruiterConfirm = async () => {
    if (conversationPrompt?.kind !== "confirm") {
      return;
    }

    const context = conversationPrompt.context || {};
    setConversationBusy(true);
    setFeedbackMessage("");
    setOutcomeAction(null);

    const result = await executeAssignRecruiterFromConversation({
      requisition: context.requisition || null,
      recruiter: context.recruiter || null
    });

    setConversationBusy(false);

    if (!result.ok) {
      setFeedbackMessage(result.message);
      return;
    }

    resetConversation();
    setFeedbackMessage(
      `✅ Recruiter assigned successfully.\n\n${result.recruiterLabel}\n\nhas been assigned to\n\n${result.requisitionLabel}\n\nYou can verify this assignment by opening\nAssign Recruiters\nand selecting\nManage\nfor this requisition.`
    );
    setOutcomeAction({
      label: "View Assigned Recruiters",
      path: ASSIGN_RECRUITERS_PATH
    });
  };

  const handleAssignRecruiterCancel = () => {
    resetConversation();
    setFeedbackMessage("");
    setOutcomeAction(null);
  };

  const handleMapCandidateConfirm = async () => {
    if (conversationPrompt?.kind !== "confirm") {
      return;
    }

    const context = conversationPrompt.context || {};
    setConversationBusy(true);
    setFeedbackMessage("");
    setOutcomeAction(null);

    const result = await executeMapCandidateFromConversation({
      candidate: context.candidate || null,
      requisition: context.requisition || null
    });

    setConversationBusy(false);

    if (!result.ok) {
      setFeedbackMessage(result.message);
      return;
    }

    resetConversation();
    setFeedbackMessage(
      `✅ Candidate mapped successfully.\n\nCandidate\n\n${result.candidateLabel}\n\nRequisition\n\n${result.requisitionLabel}\n\nYou can verify this mapping from\nMy Requisitions\n↓\nOpen the requisition\n↓\nView mapped candidates.`
    );

    if (result.requisitionCode) {
      setOutcomeAction({
        label: "View Requisition",
        path: `/recruiter/my-requisitions/${encodeURIComponent(result.requisitionCode)}`
      });
    } else {
      setOutcomeAction({
        label: "View Requisition",
        path: "/recruiter/my-requisitions"
      });
    }
  };

  const handleMapCandidateCancel = () => {
    resetConversation();
    setFeedbackMessage("");
    setOutcomeAction(null);
  };

  const applyConversationPrompt = async (prompt) => {
    if (!prompt) {
      return;
    }

    if (prompt.kind === "intro") {
      if (!isAcknowledgementOnlyMessage(prompt.message)) {
        setFeedbackMessage(prompt.message);
      }
      const next = conversationEngine.acknowledgeIntro();
      await applyConversationPrompt(next);
      return;
    }

    if (prompt.kind === "complete") {
      if (
        activeWorkflowIntentRef.current === "ASSIGN_RECRUITER" ||
        activeWorkflowIntentRef.current === "MAP_CANDIDATE" ||
        activeWorkflowIntentRef.current === "CONDUCT_INTERVIEW"
      ) {
        setConversationPrompt({
          kind: "confirm",
          workflow: activeWorkflowIntentRef.current,
          context: prompt.context || {}
        });
        return;
      }

      setConversationPrompt(prompt);
      await handleScheduleInterviewComplete(prompt.context);
      return;
    }

    if (prompt.kind === "question") {
      setFeedbackMessage((prev) =>
        isAcknowledgementOnlyMessage(prev) ? "" : prev
      );
      setOutcomeAction(null);
      setConversationPrompt(prompt);
    }
  };

  const startScheduleInterviewConversation = async () => {
    activeWorkflowIntentRef.current = "SCHEDULE_INTERVIEW";
    setOutcomeAction(null);
    setFeedbackMessage("");

    const seed = {};

    if (currentCandidate?.id) {
      seed.candidate = {
        id: currentCandidate.id,
        candidateCode: currentCandidate.candidateCode,
        candidateName: currentCandidate.candidateName,
        mapId: currentCandidate.mapId ?? null,
        reqId: currentCandidate.reqId ?? null
      };
    }

    const prompt = conversationEngine.start({
      intent: "SCHEDULE_INTERVIEW",
      seed
    });

    if (!prompt) {
      setFeedbackMessage(UNKNOWN_COMMAND_MESSAGE);
      return;
    }

    await applyConversationPrompt(prompt);
  };

  const startAssignRecruiterConversation = async () => {
    activeWorkflowIntentRef.current = "ASSIGN_RECRUITER";
    setOutcomeAction(null);
    setFeedbackMessage("");

    const prompt = conversationEngine.start({
      intent: "ASSIGN_RECRUITER"
    });

    if (!prompt) {
      setFeedbackMessage(UNKNOWN_COMMAND_MESSAGE);
      return;
    }

    await applyConversationPrompt(prompt);
  };

  const startMapCandidateConversation = async () => {
    activeWorkflowIntentRef.current = "MAP_CANDIDATE";
    setOutcomeAction(null);
    setFeedbackMessage("");

    const seed = {};

    if (currentCandidate?.id) {
      seed.candidate = {
        id: currentCandidate.id,
        candidateCode: currentCandidate.candidateCode,
        candidateName: currentCandidate.candidateName,
        label: currentCandidate.candidateName
      };
    }

    const prompt = conversationEngine.start({
      intent: "MAP_CANDIDATE",
      seed
    });

    if (!prompt) {
      setFeedbackMessage(UNKNOWN_COMMAND_MESSAGE);
      return;
    }

    await applyConversationPrompt(prompt);
  };

  const startConductInterviewConversation = async () => {
    activeWorkflowIntentRef.current = "CONDUCT_INTERVIEW";
    setOutcomeAction(null);
    setFeedbackMessage("");

    const prompt = conversationEngine.start({
      intent: "CONDUCT_INTERVIEW"
    });

    if (!prompt) {
      setFeedbackMessage(UNKNOWN_COMMAND_MESSAGE);
      return;
    }

    await applyConversationPrompt(prompt);
  };

  const handleConversationFieldAnswer = async (fieldKey, value) => {
    const prompt = conversationEngine.answer(fieldKey, value);
    await applyConversationPrompt(prompt);
  };

  const handleConversationBack = async () => {
    const prompt = conversationEngine.back();
    await applyConversationPrompt(prompt);
  };

  const handleOutcomeAction = () => {
    if (!outcomeAction?.path) {
      return;
    }

    navigate(outcomeAction.path);
    setOpen(false);
    resetConversation();
    setOutcomeAction(null);
  };

  const handleSend = async (enteredText) => {
    if (isMapCandidatePhrase(enteredText)) {
      setInputValue("");
      await startMapCandidateConversation();
      return;
    }

    if (isConductInterviewPhrase(enteredText)) {
      setInputValue("");
      await startConductInterviewConversation();
      return;
    }

    const intent = resolveIntent(enteredText);

    if (intent?.intent === "SCHEDULE_INTERVIEW") {
      setInputValue("");
      await startScheduleInterviewConversation();
      return;
    }

    if (intent?.intent === "ASSIGN_RECRUITER") {
      setInputValue("");
      await startAssignRecruiterConversation();
      return;
    }

    if (intent) {
      resetConversation();
      setFeedbackMessage("");
      setOutcomeAction(null);
      actionDispatcher.dispatch(intent);
      setInputValue("");
      return;
    }

    const matched = findCopilotCommand(legacyCommandRegistry, enteredText);

    if (matched) {
      resetConversation();
      setOutcomeAction(null);
      if (matched.type === "response") {
        setFeedbackMessage(matched.execute() || "");
      } else {
        setFeedbackMessage("");
        matched.execute();
      }
    } else {
      setFeedbackMessage(UNKNOWN_COMMAND_MESSAGE);
    }

    setInputValue("");
  };

  return (
    <>
      <Tooltip title="Optalynx Copilot">
        <IconButton
          aria-label="Open Optalynx Copilot"
          onClick={handleOpen}
          sx={iconButtonSx}
        >
          <AutoAwesomeOutlinedIcon />
        </IconButton>
      </Tooltip>

      <OptalynxCopilotDrawer
        open={open}
        onClose={handleClose}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSuggestionSelect={handleSuggestionSelect}
        onSend={handleSend}
        feedbackMessage={feedbackMessage}
        userName={userName}
        conversationPrompt={conversationPrompt}
        conversationBusy={conversationBusy}
        onConversationFieldAnswer={handleConversationFieldAnswer}
        onConversationBack={handleConversationBack}
        canGoBack={Boolean(conversationPrompt?.canGoBack)}
        conversationProgress={getConversationProgress(
          conversationEngine,
          conversationPrompt
        )}
        onConfirmAssignRecruiter={handleAssignRecruiterConfirm}
        onCancelAssignRecruiter={handleAssignRecruiterCancel}
        onConfirmMapCandidate={handleMapCandidateConfirm}
        onCancelMapCandidate={handleMapCandidateCancel}
        onOpenConductInterview={handleConductInterviewOpen}
        onPreviousConductInterview={handleConductInterviewPrevious}
        outcomeAction={outcomeAction}
        onOutcomeAction={handleOutcomeAction}
      />
    </>
  );
}

export default OptalynxCopilot;

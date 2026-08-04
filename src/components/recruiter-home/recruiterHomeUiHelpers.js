import {
  MdCalendarToday,
  MdChatBubbleOutline,
  MdForward,
  MdLocalOffer,
  MdWarningAmber
} from "react-icons/md";

/**
 * Attention / action row meta — glyph + semantic module colour role.
 * Colours come from EnterpriseModuleIcon / theme.tokens.moduleColors.
 */
const TYPE_META = {
  "Interview feedback": {
    displayType: "Interview Feedback Pending",
    icon: MdChatBubbleOutline,
    module: "notifications"
  },
  "Interview today": {
    displayType: "Interview Today",
    icon: MdCalendarToday,
    module: "interviews"
  },
  "Offer approval": {
    displayType: "Offer Approval Required",
    icon: MdLocalOffer,
    module: "approvals"
  },
  "Candidate overdue": {
    displayType: "Candidate Overdue",
    icon: MdWarningAmber,
    module: "reports"
  }
};

const DEFAULT_META = {
  displayType: "Action Required",
  icon: MdForward,
  module: "settings"
};

export function getAttentionItemMeta(type) {
  return TYPE_META[type] || { ...DEFAULT_META, displayType: type };
}

export function priorityLabelFromScore(score = 0) {
  if (score >= 85) return "High";
  if (score >= 65) return "Medium";
  return "Low";
}

export const PRIORITY_CHIP = {
  High: { bgcolor: "#FEF3F2", color: "#B42318", border: "#FECDCA" },
  Medium: { bgcolor: "#FFFAEB", color: "#B54708", border: "#FEDF89" },
  Low: { bgcolor: "#EFF8FF", color: "#175CD3", border: "#B2DDFF" }
};

export function candidateInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const STAGE_NEXT_ACTION = {
  Applied: "Schedule L1 Interview",
  Screening: "Schedule L1 Interview",
  "L1 Interview": "Schedule L2 Interview",
  "L2 Interview": "Schedule Client Interview",
  "Client Interview": "Ready to Create Offer",
  Offer: "Ready to Create Offer",
  Joined: "Monitor Joiner Onboarding"
};

const ACTION_TYPE_NEXT = {
  "Interview feedback": "Awaiting Interview Feedback",
  "Interview today": "Conduct Interview Today",
  "Offer approval": "Ready to Create Offer",
  "Candidate overdue": "Follow Up on Overdue Candidate"
};

export function resolveTodaysNextAction({ mode, candidate, actionItem, requisition }) {
  if (actionItem?.type) {
    return ACTION_TYPE_NEXT[actionItem.type] || "Take Action Today";
  }

  if (mode === "candidate" && candidate) {
    const stage = candidate.stage || candidate.context || "";
    if (candidate.pendingFeedback) return "Awaiting Interview Feedback";
    return STAGE_NEXT_ACTION[stage] || candidate.nextStep || "Review and advance";
  }

  if (mode === "requisition" && requisition) {
    return requisition.nextAction || "Review requisition workload";
  }

  return null;
}

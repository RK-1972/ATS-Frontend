import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

/**
 * Presentation metadata for Copilot quick actions (ids match backend suggestions).
 * `navigatesDirectly: true` — quick-action click runs navigation handler (orchestrator phrases unchanged).
 */
export const COPILOT_QUICK_ACTION_CATALOG = {
  "my-interviews-today": {
    id: "my-interviews-today",
    title: "My Interviews Today",
    description: "Interviews assigned to you for today",
    inputText: "Open My Interviews Today",
    navigatesDirectly: true,
    Icon: CalendarTodayOutlinedIcon,
    accent: "#1565c0",
    module: "interviews"
  },
  "my-pending-interview-feedback": {
    id: "my-pending-interview-feedback",
    title: "Pending Interview Feedback",
    description: "Interviews awaiting your feedback",
    inputText: "Open My Pending Interview Feedback",
    navigatesDirectly: true,
    Icon: PendingActionsOutlinedIcon,
    accent: "#6a1b9a",
    module: "interviews"
  },
  "my-upcoming-interviews": {
    id: "my-upcoming-interviews",
    title: "My Upcoming Interviews",
    description: "Your upcoming assigned interviews",
    inputText: "Open My Upcoming Interviews",
    navigatesDirectly: true,
    Icon: EventOutlinedIcon,
    accent: "#00838f",
    module: "interviews"
  },
  "ta-lead-team-requisitions": {
    id: "ta-lead-team-requisitions",
    title: "My Team's Requisitions",
    description: "Requisitions in your TA Lead oversight scope",
    inputText: "Open My Team Requisitions",
    navigatesDirectly: true,
    Icon: GroupsOutlinedIcon,
    accent: "#1f3b63",
    module: "recruitment"
  },
  "ta-lead-recruiter-workload": {
    id: "ta-lead-recruiter-workload",
    title: "Recruiter Workload",
    description: "Recruiter assignments and workload in your scope",
    inputText: "Open Recruiter Workload",
    navigatesDirectly: true,
    Icon: AssignmentIndOutlinedIcon,
    accent: "#137333",
    module: "recruitment"
  },
  "ta-lead-recruitment-bottlenecks": {
    id: "ta-lead-recruitment-bottlenecks",
    title: "Recruitment Bottlenecks",
    description: "Pipeline bottlenecks and attention queues",
    inputText: "Open Recruitment Bottlenecks",
    navigatesDirectly: true,
    Icon: TimelineOutlinedIcon,
    accent: "#b06000",
    module: "recruitment"
  },
  "admin-employee-responsibility-clearance": {
    id: "admin-employee-responsibility-clearance",
    title: "Employee Responsibility Clearance",
    description: "Employee lifecycle responsibility clearance queue",
    inputText: "Open Employee Responsibility Clearance",
    navigatesDirectly: true,
    Icon: FactCheckOutlinedIcon,
    accent: "#1f3b63",
    module: "configuration"
  },
  "admin-manage-compensation-structures": {
    id: "admin-manage-compensation-structures",
    title: "Manage Compensation Structures",
    description: "Platform compensation structure configuration",
    inputText: "Open Manage Compensation Structures",
    navigatesDirectly: true,
    Icon: PaymentsOutlinedIcon,
    accent: "#f39c12",
    module: "configuration"
  },
  "admin-operational-exceptions": {
    id: "admin-operational-exceptions",
    title: "Operational Exceptions",
    description: "Hiring Control Tower operational oversight",
    inputText: "Open Operational Exceptions",
    navigatesDirectly: true,
    Icon: WarningAmberOutlinedIcon,
    accent: "#c62828",
    module: "configuration"
  },
  requisitions: {
    id: "requisitions",
    title: "My Requisitions",
    description: "View and manage assigned requisitions",
    inputText: "Show My Requisitions",
    Icon: AssignmentOutlinedIcon,
    accent: "#1f3b63",
    module: "requisitions"
  },
  candidates: {
    id: "candidates",
    title: "Candidates",
    description: "Search and manage candidates",
    inputText: "Show Java Candidates",
    Icon: PeopleAltOutlinedIcon,
    accent: "#1967d2",
    module: "candidates"
  },
  interview: {
    id: "interview",
    title: "Schedule Interview",
    description: "Create or manage interviews",
    inputText: "Schedule Interview",
    Icon: EventAvailableOutlinedIcon,
    accent: "#f39c12",
    module: "interviews"
  },
  "todays-interviews": {
    id: "todays-interviews",
    title: "Today's Interviews",
    description: "View interviews scheduled for today",
    inputText: "Show Today's Interviews",
    Icon: TodayOutlinedIcon,
    accent: "#b06000",
    module: "interviews"
  },
  "assign-recruiter": {
    id: "assign-recruiter",
    title: "Assign Recruiter",
    description: "Assign a recruiter to a requisition",
    inputText: "Assign Recruiter",
    Icon: PersonAddAlt1OutlinedIcon,
    accent: "#137333",
    module: "recruitment"
  },
  "map-candidate": {
    id: "map-candidate",
    title: "Map Candidate",
    description: "Map a candidate to a requisition",
    inputText: "Map Candidate",
    Icon: LinkOutlinedIcon,
    accent: "#0b57d0",
    module: "candidates"
  },
  "conduct-interview": {
    id: "conduct-interview",
    title: "Conduct Interview",
    description: "Open an assigned interview in your workspace",
    inputText: "Conduct Interview",
    Icon: RateReviewOutlinedIcon,
    accent: "#7b1fa2",
    module: "approvals"
  }
};

export function mapSuggestionIdsToActionCards(suggestionIds) {
  const ids = Array.isArray(suggestionIds) ? suggestionIds : [];

  return ids
    .map((id) => COPILOT_QUICK_ACTION_CATALOG[id])
    .filter(Boolean);
}

export function resolveDirectNavigationActionIdFromMessage(message) {
  const normalized = String(message ?? "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "");

  if (!normalized) {
    return null;
  }

  for (const entry of Object.values(COPILOT_QUICK_ACTION_CATALOG)) {
    if (!entry?.navigatesDirectly || !entry.inputText) {
      continue;
    }

    const phrase = String(entry.inputText)
      .trim()
      .toLowerCase()
      .replace(/['']/g, "");

    if (phrase === normalized) {
      return entry.id;
    }
  }

  return null;
}

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

/**
 * Presentation metadata for Copilot quick actions (ids match backend suggestions).
 */
export const COPILOT_QUICK_ACTION_CATALOG = {
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

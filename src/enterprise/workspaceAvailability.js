import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

const WORKSPACE_CATALOG = [
  {
    id: "admin",
    visibleForAdmin: true,
    title: "Admin Workspace",
    description: "Enterprise administration, governance, configuration and access management.",
    path: "/",
    icon: AdminPanelSettingsOutlinedIcon,
    module: "configuration"
  },
  {
    id: "recruiter",
    flag: "showRecruitmentWorkspace",
    title: "Recruitment Workspace",
    description: "What work requires my attention today?",
    path: "/recruiter",
    icon: DashboardOutlinedIcon,
    module: "recruitment"
  },
  {
    id: "interviewer",
    flag: "showInterviewWorkspace",
    title: "Interview Workspace",
    description: "What interviews must I conduct today?",
    path: "/interviewer",
    icon: WorkOutlineOutlinedIcon,
    module: "interviews"
  },
  {
    id: "approvals",
    flag: "showApprovalWorkspace",
    title: "My Approvals",
    description: "What approvals require my decision today?",
    path: "/my-approvals",
    icon: FactCheckOutlinedIcon,
    module: "approvals"
  },
  {
    id: "request",
    flag: "showRequestWorkspace",
    title: "Requisitions / Request Workspace",
    description: "What requisitions do I need to raise or track?",
    path: "/workforce-planning/catalogue",
    icon: DescriptionOutlinedIcon,
    module: "requisitions"
  },
  {
    id: "offers",
    flag: "showOfferWorkspace",
    title: "Offer Workspace",
    description: "What offers need action today?",
    path: "/offers",
    icon: LocalOfferOutlinedIcon,
    module: "offers"
  }
];

function isWorkspaceEntryEnabled(entry, user, workspaceFlags) {
  if (entry.visibleForAdmin) {
    return user?.role_name === "Admin";
  }

  return Boolean(workspaceFlags?.[entry.flag]);
}

export function readWorkspaceFlags() {
  try {
    return JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch {
    return {};
  }
}

export function readLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

/**
 * Workspaces the current user may open — same rules as Choose Workspace and login redirect.
 */
export function getAvailableWorkspaces({
  user = readLoggedInUser(),
  workspaceFlags = readWorkspaceFlags()
} = {}) {
  return WORKSPACE_CATALOG.filter((entry) =>
    isWorkspaceEntryEnabled(entry, user, workspaceFlags)
  );
}

export function hasMultipleWorkspaces(options) {
  return getAvailableWorkspaces(options).length > 1;
}

export function shouldShowWorkspaceSwitcher(options) {
  return hasMultipleWorkspaces(options);
}

export { WORKSPACE_CATALOG, isWorkspaceEntryEnabled };

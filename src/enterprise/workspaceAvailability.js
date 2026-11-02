import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RadarOutlinedIcon from "@mui/icons-material/RadarOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";

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
    id: "application-audit",
    flag: "showApplicationAuditWorkspace",
    title: "Application Audit & Session History",
    description:
      "Review employee login sessions, screen activity, and business audit events.",
    path: "/application-audit",
    icon: HistoryOutlinedIcon,
    module: "configuration"
  },
  {
    id: "user-administration",
    flag: "showUserAdministrationWorkspace",
    title: "User Administration",
    description: "Create employee accounts and assign operational work assignments.",
    path: "/users",
    icon: PeopleAltOutlinedIcon,
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
    id: "hiring-manager",
    flag: "showHiringManagerWorkspace",
    title: "Hiring Manager Workspace",
    description: "Review requisitions and candidates assigned to you.",
    path: "/hiring-manager",
    icon: SupervisorAccountOutlinedIcon,
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
    id: "ta-lead",
    flag: "showTaLeadWorkspace",
    title: "TA Lead Workspace",
    description: "Recruiting operations overview, assignments, and oversight.",
    path: "/ta-lead",
    icon: ManageAccountsOutlinedIcon,
    module: "recruitment"
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
  },
  {
    id: "release-offer",
    flag: "showReleaseOfferWorkspace",
    title: "Release Offer",
    description: "Release generated offers to candidate portal accounts.",
    path: "/release-offer",
    icon: SendOutlinedIcon,
    module: "offers"
  },
  {
    id: "candidate-control-tower",
    flag: "showCandidateControlTowerWorkspace",
    title: "Candidate Control Tower",
    description: "Centralized candidate pipeline visibility within your authorized scope.",
    path: "/candidate-control-tower",
    icon: RadarOutlinedIcon,
    module: "recruitment"
  },
  {
    id: "talent-intelligence",
    flag: "showTalentIntelligenceWorkspace",
    title: "Talent Intelligence",
    description: "Discover internal candidates for open requisitions with transparent skill matching.",
    path: "/talent-intelligence",
    icon: PersonSearchOutlinedIcon,
    module: "recruitment"
  }
];

const OTI_WORKSPACE_NAV_ELIGIBLE_KEY = "oti_workspace_nav_eligible";

export function readOtiWorkspaceNavEligible() {
  // Nav visibility must not read sessionStorage; eligibility is confirmed via live server refresh only.
  return null;
}

export function writeOtiWorkspaceNavEligible(eligible) {
  try {
    sessionStorage.setItem(OTI_WORKSPACE_NAV_ELIGIBLE_KEY, eligible ? "1" : "0");
  } catch {
    // ignore
  }
}

export function hasTalentIntelligenceWorkAssignment(workspaceFlags = readWorkspaceFlags()) {
  return Boolean(workspaceFlags?.showTalentIntelligenceWorkspace);
}

export function isRecruiterRoleUser(user = readLoggedInUser()) {
  return String(user?.role_name || "").trim() === "Recruiter";
}

export function canShowTalentIntelligenceNav({
  user = readLoggedInUser(),
  workspaceFlags = readWorkspaceFlags(),
  serverNavEligible = null
} = {}) {
  if (user?.role_name === "Admin") {
    return true;
  }

  if (hasTalentIntelligenceWorkAssignment(workspaceFlags)) {
    return true;
  }

  if (isRecruiterRoleUser(user) && serverNavEligible === true) {
    return true;
  }

  return false;
}

export async function refreshOtiWorkspaceNavEligibility(fetchNavEligibility) {
  if (typeof fetchNavEligibility !== "function") {
    writeOtiWorkspaceNavEligible(false);
    return false;
  }

  try {
    const response = await fetchNavEligibility();
    const eligible = Boolean(response?.data?.eligible);
    writeOtiWorkspaceNavEligible(eligible);
    return eligible;
  } catch {
    writeOtiWorkspaceNavEligible(false);
    return false;
  }
}

function isWorkspaceEntryEnabled(entry, user, workspaceFlags) {
  if (entry.visibleForAdmin) {
    return user?.role_name === "Admin";
  }

  if (entry.id === "talent-intelligence") {
    return canShowTalentIntelligenceNav({ user, workspaceFlags });
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

export { WORKSPACE_CATALOG, isWorkspaceEntryEnabled, OTI_WORKSPACE_NAV_ELIGIBLE_KEY };

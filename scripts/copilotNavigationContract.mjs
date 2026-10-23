/** Shared contract for Copilot V2 direct-navigation quick actions. */
export const DIRECT_NAVIGATION_ACTION_IDS = [
  "my-interviews-today",
  "my-pending-interview-feedback",
  "my-upcoming-interviews",
  "ta-lead-team-requisitions",
  "ta-lead-recruiter-workload",
  "ta-lead-recruitment-bottlenecks",
  "admin-employee-responsibility-clearance",
  "admin-manage-compensation-structures",
  "admin-operational-exceptions"
];

export const DIRECT_NAVIGATION_PHRASES = {
  "my-interviews-today": "Open My Interviews Today",
  "my-pending-interview-feedback": "Open My Pending Interview Feedback",
  "my-upcoming-interviews": "Open My Upcoming Interviews",
  "ta-lead-team-requisitions": "Open My Team Requisitions",
  "ta-lead-recruiter-workload": "Open Recruiter Workload",
  "ta-lead-recruitment-bottlenecks": "Open Recruitment Bottlenecks",
  "admin-employee-responsibility-clearance": "Open Employee Responsibility Clearance",
  "admin-manage-compensation-structures": "Open Manage Compensation Structures",
  "admin-operational-exceptions": "Open Operational Exceptions"
};

export const DIRECT_NAVIGATION_ROUTES = {
  "my-interviews-today": {
    path: "/interviewer",
    filters: { interviewer_view: "today" }
  },
  "my-pending-interview-feedback": {
    path: "/interviewer",
    filters: { interviewer_view: "pending_feedback" }
  },
  "my-upcoming-interviews": {
    path: "/interviewer",
    filters: { interviewer_view: "upcoming" }
  },
  "ta-lead-team-requisitions": { path: "/ta-lead" },
  "ta-lead-recruiter-workload": { path: "/ta-lead" },
  "ta-lead-recruitment-bottlenecks": { path: "/ta-lead" },
  "admin-employee-responsibility-clearance": {
    path: "/responsibility-clearance"
  },
  "admin-manage-compensation-structures": {
    path: "/platform-configuration/compensation-structures"
  },
  "admin-operational-exceptions": { path: "/hiring-control-tower" }
};

export const LEGACY_ORCHESTRATOR_PHRASES = [
  "Show My Requisitions",
  "Show Java Candidates",
  "Schedule Interview",
  "Show Today's Interviews",
  "Assign Recruiter",
  "Map Candidate",
  "Conduct Interview"
];

import { WORKFORCE_PLANNING_HELP_TOPICS } from "./content/workforcePlanningHelpTopics.js";

/**
 * Static Help catalog. Module-specific content may live under help/content/.
 *
 * @typedef {"workforce-planning"|"requisitions"|"candidates"|"recruiter"|"interview"|"offers"|"hiring-manager"|"ta-lead"|"reports"|"administration"} HelpModuleKey
 *
 * @typedef {Object} HelpVideoMetadata
 * @property {string} [localAsset] Path under public/help/
 * @property {string} [watchUrl] Legacy external URL (non–Workforce Planning)
 * @property {string} [durationLabel]
 * @property {string} [provider]
 * @property {string} [publicUrl] Resolved at runtime (provider enrichment)
 * @property {boolean} [available] Set at runtime when asset exists
 *
 * @typedef {Object} HelpTopicManifestEntry
 * @property {HelpModuleKey} moduleKey
 * @property {string} topicId
 * @property {string} title
 * @property {string} summary
 * @property {string[]} [roles]
 * @property {number} displayOrder
 * @property {HelpVideoMetadata} [video]
 */

/** @type {HelpTopicManifestEntry[]} */
export const HELP_TOPIC_MANIFEST = [
  ...WORKFORCE_PLANNING_HELP_TOPICS,
  {
    moduleKey: "requisitions",
    topicId: "req-create-basics",
    title: "Creating a requisition",
    summary:
      "Key fields and approval expectations when raising a new requisition.",
    displayOrder: 10,
    roles: ["Admin", "Recruiter"],
    video: {
      localAsset: "requisitions/req-create-basics.mp4"
    }
  },
  {
    moduleKey: "candidates",
    topicId: "cand-workspace-tour",
    title: "Candidate workspace tour",
    summary:
      "Navigate the candidate profile, skills, pipeline, and activity areas.",
    displayOrder: 10,
    video: {
      title: "Candidate workspace (sample)",
      watchUrl: "https://www.example.com/help/candidates/workspace-tour",
      durationLabel: "5 min",
      provider: "static"
    }
  },
  {
    moduleKey: "recruiter",
    topicId: "rec-cockpit",
    title: "Recruiter cockpit",
    summary:
      "Use the recruiter home dashboard to prioritize requisitions and actions.",
    displayOrder: 10
  },
  {
    moduleKey: "interview",
    topicId: "int-schedule",
    title: "Scheduling interviews",
    summary:
      "Schedule panels, Teams meetings, and notify interviewers from Optalynx.",
    displayOrder: 10,
    roles: ["Recruiter", "Interviewer"]
  },
  {
    moduleKey: "offers",
    topicId: "offer-workspace",
    title: "Offer workspace",
    summary:
      "Raise offer requests, track approvals, and manage offer letters.",
    displayOrder: 10
  },
  {
    moduleKey: "hiring-manager",
    topicId: "hm-readonly",
    title: "Hiring Manager workspace",
    summary:
      "View requisition and pipeline status in the read-only hiring manager view.",
    displayOrder: 10
  },
  {
    moduleKey: "ta-lead",
    topicId: "ta-oversight",
    title: "TA Lead oversight",
    summary:
      "Monitor recruiter workload and requisition health from the TA Lead workspace.",
    displayOrder: 10,
    roles: ["TA Lead", "TA Leader", "Admin"]
  },
  {
    moduleKey: "reports",
    topicId: "reports-center",
    title: "Report center",
    summary:
      "Run standard reports and open the report builder for custom analytics.",
    displayOrder: 10
  },
  {
    moduleKey: "administration",
    topicId: "admin-users",
    title: "User administration",
    summary:
      "Provision users, manage roles, and review assignment capabilities.",
    displayOrder: 10,
    roles: ["Admin"]
  },
  {
    moduleKey: "administration",
    topicId: "admin-general",
    title: "Getting started with Optalynx",
    summary:
      "Orientation for administrators and power users across enterprise modules.",
    displayOrder: 5
  }
];

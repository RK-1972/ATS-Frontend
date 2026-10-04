/**
 * Workforce Planning video-help topics (static catalog).
 * MP4 files: public/help/workforce-planning/<filename>
 *
 * @typedef {import("../helpManifest.js").HelpTopicManifestEntry} HelpTopicManifestEntry
 */

/** @type {HelpTopicManifestEntry[]} */
export const WORKFORCE_PLANNING_HELP_TOPICS = [
  {
    moduleKey: "workforce-planning",
    topicId: "wp-overview",
    title: "Workforce Planning Overview",
    summary:
      "Business-level journey from budget demand through approval, approved positions, and monitoring.",
    displayOrder: 10,
    video: {
      localAsset: "workforce-planning/wp-overview.mp4"
    }
  },
  {
    moduleKey: "workforce-planning",
    topicId: "wp-budget-requests-exceptions",
    title: "Budget Requests & Budget Exceptions",
    summary:
      "Raise and track manpower budget requests and monitor offer-over-budget exceptions.",
    displayOrder: 20,
    video: {
      localAsset: "workforce-planning/wp-budget-requests-exceptions.mp4"
    }
  },
  {
    moduleKey: "workforce-planning",
    topicId: "wp-approval-position-requisition",
    title: "Approval → Approved Position → Requisition",
    summary:
      "Governed budget approval, approved position catalogue, and the path into Talent Demand Request.",
    displayOrder: 30,
    video: {
      localAsset: "workforce-planning/wp-approval-position-requisition.mp4"
    }
  },
  {
    moduleKey: "workforce-planning",
    topicId: "wp-dashboard-analytics",
    title: "Dashboard & Analytics",
    summary:
      "Monitor headcount, budget utilization, exceptions, upcoming hiring, and workforce analytics.",
    displayOrder: 40,
    video: {
      localAsset: "workforce-planning/wp-dashboard-analytics.mp4"
    }
  }
];

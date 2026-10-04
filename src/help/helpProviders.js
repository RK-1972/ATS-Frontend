import { HELP_TOPIC_MANIFEST } from "./helpManifest.js";
import { isHelpTopicVisibleForRoles, readHelpSessionContext } from "./helpSessionContext.js";
import { enrichHelpTopicsVideo } from "./helpVideoAssets.js";

/**
 * @typedef {import("./helpManifest.js").HelpModuleKey} HelpModuleKey
 * @typedef {import("./helpManifest.js").HelpTopicManifestEntry} HelpTopicManifestEntry
 *
 * @typedef {Object} HelpTopicsRequest
 * @property {HelpModuleKey} moduleKey
 * @property {object|null} [user]
 * @property {object} [workspace]
 * @property {string[]} [roleNames]
 *
 * @typedef {Object} HelpContentProvider
 * @property {(request: HelpTopicsRequest) => Promise<HelpTopicManifestEntry[]>} getTopicsForModule
 */

/**
 * Phase 1 — static manifest provider.
 * @type {HelpContentProvider}
 */
export const StaticHelpProvider = {
  async getTopicsForModule(request) {
    const moduleKey = request?.moduleKey;
    const roleNames =
      request?.roleNames ?? readHelpSessionContext().roleNames;

    const rows = HELP_TOPIC_MANIFEST.filter(
      (topic) => topic.moduleKey === moduleKey
    )
      .filter((topic) => isHelpTopicVisibleForRoles(topic, roleNames))
      .sort((left, right) => {
        const orderLeft = Number(left.displayOrder ?? 0);
        const orderRight = Number(right.displayOrder ?? 0);

        if (orderLeft !== orderRight) {
          return orderLeft - orderRight;
        }

        return String(left.title || "").localeCompare(String(right.title || ""));
      });

    return enrichHelpTopicsVideo(rows);
  }
};

/**
 * Future: ApiHelpProvider, SharePointHelpProvider — swap via setActiveHelpProvider.
 * @type {HelpContentProvider}
 */
let activeHelpProvider = StaticHelpProvider;

/** @returns {HelpContentProvider} */
export function getActiveHelpProvider() {
  return activeHelpProvider;
}

/**
 * @param {HelpContentProvider} provider
 */
export function setActiveHelpProvider(provider) {
  if (provider && typeof provider.getTopicsForModule === "function") {
    activeHelpProvider = provider;
  }
}

/**
 * @param {HelpTopicsRequest} request
 * @returns {Promise<HelpTopicManifestEntry[]>}
 */
export async function fetchHelpTopicsForModule(request) {
  return activeHelpProvider.getTopicsForModule(request);
}

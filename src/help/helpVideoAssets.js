/**
 * Public Help video assets live under ats-frontend/public/help/.
 * Paths are environment-independent (same origin as the SPA).
 */

/**
 * @param {string} localAsset Path relative to public/help/ (e.g. workforce-planning/wp-overview.mp4)
 * @returns {string}
 */
export function resolveHelpVideoPublicUrl(localAsset) {
  const normalized = String(localAsset || "")
    .trim()
    .replace(/^\/+/, "");

  if (!normalized) {
    return "";
  }

  const base = import.meta.env.BASE_URL || "/";
  const baseWithSlash = base.endsWith("/") ? base : `${base}/`;

  return `${baseWithSlash}help/${normalized}`;
}

/**
 * @param {string} publicUrl
 * @returns {Promise<boolean>}
 */
export async function isHelpVideoAssetAvailable(publicUrl) {
  const url = String(publicUrl || "").trim();

  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, { method: "HEAD" });

    if (response.ok) {
      return true;
    }

    const getResponse = await fetch(url, { method: "GET", headers: { Range: "bytes=0-1" } });
    return getResponse.ok;
  } catch {
    return false;
  }
}

/**
 * @param {import("./helpManifest.js").HelpTopicManifestEntry} topic
 * @returns {Promise<import("./helpManifest.js").HelpTopicManifestEntry>}
 */
export async function enrichHelpTopicVideo(topic) {
  const video = topic.video;

  if (!video) {
    return topic;
  }

  if (video.localAsset) {
    const publicUrl = resolveHelpVideoPublicUrl(video.localAsset);
    const available = await isHelpVideoAssetAvailable(publicUrl);

    return {
      ...topic,
      video: {
        ...video,
        publicUrl,
        available
      }
    };
  }

  if (video.watchUrl) {
    return {
      ...topic,
      video: {
        ...video,
        publicUrl: video.watchUrl,
        available: true
      }
    };
  }

  return {
    ...topic,
    video: {
      ...video,
      available: false
    }
  };
}

/**
 * @param {import("./helpManifest.js").HelpTopicManifestEntry[]} topics
 */
export async function enrichHelpTopicsVideo(topics) {
  return Promise.all(topics.map((topic) => enrichHelpTopicVideo(topic)));
}

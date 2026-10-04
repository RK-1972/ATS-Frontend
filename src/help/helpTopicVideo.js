/**
 * Presentation helpers for Help topic video (data-driven; no per-topic UI).
 */

/**
 * @param {import("./helpManifest.js").HelpTopicManifestEntry["video"]} video
 * @returns {boolean}
 */
export function isHelpVideoAvailable(video) {
  return Boolean(video?.available && video?.publicUrl);
}

/**
 * @param {import("./helpManifest.js").HelpTopicManifestEntry["video"]} video
 * @returns {"local"|"external"|null}
 */
export function getHelpVideoPlaybackMode(video) {
  if (!isHelpVideoAvailable(video)) {
    return null;
  }

  if (video?.localAsset) {
    return "local";
  }

  if (video?.watchUrl) {
    return "external";
  }

  return "local";
}

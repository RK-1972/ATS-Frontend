import { API_BASE_URL } from "../api/config";

/**
 * Builds an authenticated inline offer letter PDF URL for iframe preview.
 * Mirrors resolveResumeViewerUrl — token is passed as query param because
 * iframes cannot send Authorization headers.
 */
export function resolveOfferLetterViewerUrl(offerId, { download = false } = {}) {
  const id = offerId == null ? "" : String(offerId).trim();

  if (!id) {
    return "";
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return "";
  }

  const params = new URLSearchParams({
    token
  });

  if (download) {
    params.set("download", "1");
  }

  return `${API_BASE_URL}/api/v1/offer-letters/${encodeURIComponent(id)}/pdf?${params.toString()}`;
}

export default resolveOfferLetterViewerUrl;

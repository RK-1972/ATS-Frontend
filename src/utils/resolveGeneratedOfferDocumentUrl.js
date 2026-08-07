import { API_BASE_URL } from "../api/config";

/**
 * Builds an authenticated offer letter PDF URL for preview/download.
 * Token is passed as a query param because window.open cannot send Authorization headers.
 */
export function resolveGeneratedOfferDocumentUrl(offerId, { download = false } = {}) {
  const id = offerId == null ? "" : String(offerId).trim();

  if (!id) {
    return "";
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return "";
  }

  const params = new URLSearchParams({ token });

  if (download) {
    params.set("download", "1");
  }

  return `${API_BASE_URL}/api/v1/offer-letters/${encodeURIComponent(id)}/pdf?${params.toString()}`;
}

export default resolveGeneratedOfferDocumentUrl;

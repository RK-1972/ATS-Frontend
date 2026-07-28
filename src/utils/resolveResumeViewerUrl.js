import { API_BASE_URL } from "../api/config";

/**
 * Builds an authenticated inline resume URL for the preview iframe.
 *
 * Storage keys (and legacy absolute MinIO URLs) are never used as iframe src —
 * that caused the SPA fallback to render Optalynx inside the dialog.
 * The backend streams the object via GET /candidate-resume/:candidateId.
 *
 * Token is passed as a query param because iframes cannot send Authorization.
 */
export function resolveResumeViewerUrl({ candidateId, resumePath } = {}) {
  const id = candidateId == null ? "" : String(candidateId).trim();
  const pathValue = String(resumePath || "").trim();

  if (!id || !pathValue) {
    return "";
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return "";
  }

  return `${API_BASE_URL}/candidate-resume/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`;
}

export default resolveResumeViewerUrl;

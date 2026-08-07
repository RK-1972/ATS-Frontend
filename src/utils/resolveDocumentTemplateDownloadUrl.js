import { API_BASE_URL } from "../api/config";

export function resolveDocumentTemplateDownloadUrl(templateId, { download = true } = {}) {
  const id = templateId == null ? "" : String(templateId).trim();

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

  return `${API_BASE_URL}${"/api/v1/document-templates"}/${encodeURIComponent(id)}/download?${params.toString()}`;
}

export default resolveDocumentTemplateDownloadUrl;

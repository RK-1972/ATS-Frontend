import API from "../axios.jsx";
import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";

function liveRequiredResponse(message) {
  return {
    success: false,
    message,
    data: null
  };
}

const EXPORT_EXTENSIONS = {
  xlsx: "xlsx",
  csv: "csv",
  pdf: "pdf"
};

const EXPORT_CONTENT_TYPES = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv; charset=utf-8",
  pdf: "application/pdf"
};

function sanitizeFilenamePart(value) {
  return String(value || "Report")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "Report";
}

function buildFallbackFilename(payload) {
  const format = String(payload?.format || "")
    .trim()
    .toLowerCase();
  const extension = EXPORT_EXTENSIONS[format] || "csv";
  const datasetPart = sanitizeFilenamePart(payload?.dataset);
  const datePart = new Date().toISOString().slice(0, 10);

  return `Optalynx_${datasetPart}_${datePart}.${extension}`;
}

function parseFilename(contentDisposition = "", payload) {
  const match = /filename="([^"]+)"/i.exec(contentDisposition);

  if (match?.[1]) {
    return match[1];
  }

  const rfc5987Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);

  if (rfc5987Match?.[1]) {
    try {
      return decodeURIComponent(rfc5987Match[1]);
    } catch {
      return buildFallbackFilename(payload);
    }
  }

  return buildFallbackFilename(payload);
}

async function parseBlobError(error) {
  const blob = error?.response?.data;

  if (!(blob instanceof Blob)) {
    return error?.response?.data?.message || error.message || "Export failed.";
  }

  try {
    const text = await blob.text();
    const parsed = JSON.parse(text);
    return parsed?.message || "Export failed.";
  } catch {
    return "Export failed.";
  }
}

const reportsClient = {
  listDatasets() {
    return httpGet(
      `${ENDPOINTS.reports}/datasets`,
      () => liveRequiredResponse("Live API required for report datasets.")
    );
  },

  getDatasetMetadata(datasetCode) {
    return httpGet(
      `${ENDPOINTS.reports}/datasets/${encodeURIComponent(datasetCode)}`,
      () => liveRequiredResponse("Live API required for report dataset metadata.")
    );
  },

  executeQuery(payload) {
    return httpPost(
      `${ENDPOINTS.reports}/query`,
      payload,
      () => liveRequiredResponse("Live API required for report query execution.")
    );
  },

  async exportReport(payload) {
    try {
      const response = await API.post(`${ENDPOINTS.reports}/export`, payload, {
        responseType: "blob"
      });

      const contentType =
        response.headers["content-type"] ||
        EXPORT_CONTENT_TYPES[String(payload?.format || "").toLowerCase()] ||
        "application/octet-stream";

      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const parsed = JSON.parse(text);
        throw new Error(parsed?.message || "Export failed.");
      }

      const filename = parseFilename(response.headers["content-disposition"], payload);
      const blob =
        response.data instanceof Blob && response.data.type
          ? response.data
          : new Blob([response.data], { type: contentType });

      return {
        blob,
        filename,
        contentType
      };
    } catch (error) {
      const message = await parseBlobError(error);
      throw new Error(message, { cause: error });
    }
  }
};

export default reportsClient;

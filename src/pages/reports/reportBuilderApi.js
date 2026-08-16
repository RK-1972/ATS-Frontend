import reportsClient from "../../api/clients/reportsClient";

function assertSuccess(response, fallbackMessage) {
  if (!response?.success) {
    const error = new Error(response?.message || fallbackMessage);
    error.response = { data: response };
    throw error;
  }

  return response.data;
}

export async function fetchReportDatasets() {
  const response = await reportsClient.listDatasets();
  return assertSuccess(response, "Failed to load report datasets.");
}

export async function fetchReportDatasetMetadata(datasetCode) {
  const response = await reportsClient.getDatasetMetadata(datasetCode);
  return assertSuccess(response, "Failed to load report dataset metadata.");
}

export async function executeReportQuery(payload) {
  const response = await reportsClient.executeQuery(payload);
  return assertSuccess(response, "Failed to execute report query.");
}

export async function exportReport(payload) {
  return reportsClient.exportReport(payload);
}

export function downloadReportFile({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

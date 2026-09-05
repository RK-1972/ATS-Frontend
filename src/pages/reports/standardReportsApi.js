import reportsClient from "../../api/clients/reportsClient";
import { fetchReportDatasetMetadata } from "./reportBuilderApi";

function assertSuccess(response, fallbackMessage) {
  if (!response?.success) {
    const error = new Error(response?.message || fallbackMessage);
    error.response = { data: response };
    throw error;
  }

  return response.data;
}

export async function fetchStandardReports() {
  const response = await reportsClient.listStandardReports();
  return assertSuccess(response, "Failed to load standard reports.");
}

export async function fetchStandardReportDefinition(reportCode) {
  const response = await reportsClient.getStandardReportDefinition(reportCode);
  return assertSuccess(response, "Failed to load standard report definition.");
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

export { fetchReportDatasetMetadata };

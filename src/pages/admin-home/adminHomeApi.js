import adminCommandCenterClient from "@/api/clients/adminCommandCenterClient";

/**
 * Admin Command Center snapshot from live backend aggregation.
 */
export async function fetchAdminCommandCenter() {
  const response = await adminCommandCenterClient.getSnapshot();

  if (!response?.success) {
    const error = new Error(response?.message || "Failed to load admin command center.");
    error.response = { data: response };
    throw error;
  }

  return response.data;
}

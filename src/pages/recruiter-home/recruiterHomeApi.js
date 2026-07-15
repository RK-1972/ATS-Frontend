import recruitmentClient from "@/api/clients/recruitmentClient";
import { normalizeCockpitDashboard } from "./recruiterHomeDataAdapter";

export async function fetchRecruiterCockpitDashboard({ fromDate, toDate }) {
  const response = await recruitmentClient.getMyDashboard({ fromDate, toDate });
  return normalizeCockpitDashboard(response);
}

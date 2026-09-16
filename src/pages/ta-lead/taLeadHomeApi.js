import taLeadClient from "@/api/clients/taLeadClient";

function assertTaLeadSuccess(response, fallbackMessage) {
  if (!response?.success) {
    const error = new Error(response?.message || fallbackMessage);
    error.response = { data: response };
    throw error;
  }

  return response.data;
}

export async function fetchTaLeadOperationsSummary() {
  const response = await taLeadClient.getOperationsSummary();
  return assertTaLeadSuccess(response, "Failed to load TA Lead operations summary.");
}

export async function fetchTaLeadAttentionQueues() {
  const response = await taLeadClient.getAttentionQueues();
  return assertTaLeadSuccess(response, "Failed to load TA Lead attention queues.");
}

export async function fetchTaLeadRecruiterSummary(recruiterCode) {
  const response = await taLeadClient.getRecruiterSummary(recruiterCode);
  return assertTaLeadSuccess(response, "Failed to load recruiter oversight summary.");
}

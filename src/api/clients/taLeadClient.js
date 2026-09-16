import API from "../axios";

const taLeadClient = {
  async getOperationsSummary() {
    const response = await API.get("/api/v1/ta-lead/operations-summary");
    return response.data;
  },

  async getAttentionQueues() {
    const response = await API.get("/api/v1/ta-lead/attention-queues");
    return response.data;
  },

  async getRecruiterSummary(recruiterCode) {
    const response = await API.get(
      `/api/v1/ta-lead/recruiters/${encodeURIComponent(recruiterCode)}/summary`
    );
    return response.data;
  }
};

export default taLeadClient;

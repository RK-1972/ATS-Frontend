import API from "../axios";

const sessionTakeoverClient = {
  async fetchInbox() {
    const response = await API.get("/api/v1/auth/session-takeover/inbox");
    return response.data?.data?.pending ?? null;
  },

  async submitDecision(requestId, decision) {
    const response = await API.post(
      `/api/v1/auth/session-takeover/${requestId}/decision`,
      { decision }
    );
    return response.data;
  },

  async pollStatus(pollToken) {
    const response = await API.post("/api/v1/auth/session-takeover/poll", {
      poll_token: pollToken
    });
    return response.data;
  },

  async completeLogin({ pollToken, email_id, password }) {
    const response = await API.post("/api/v1/auth/session-takeover/complete", {
      poll_token: pollToken,
      email_id,
      password
    });
    return response.data;
  }
};

export default sessionTakeoverClient;

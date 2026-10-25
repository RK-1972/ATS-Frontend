import API from "../axios";

const employeeSessionClient = {
  async fetchIdleStatus() {
    const response = await API.get("/api/v1/auth/session/idle-status");
    return response.data?.data ?? null;
  },

  async recordActivity() {
    const response = await API.post("/api/v1/auth/session/activity");
    return response.data?.data ?? null;
  },

  async stayLoggedIn() {
    const response = await API.post("/api/v1/auth/session/stay-logged-in");
    return response.data?.data ?? null;
  },

  async completeIdleTimeout() {
    const response = await API.post("/api/v1/auth/session/idle-timeout");
    return response.data;
  }
};

export default employeeSessionClient;

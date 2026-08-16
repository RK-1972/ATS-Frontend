import { ENDPOINTS } from "../endpoints";
import { httpGet } from "../httpClient";

function emptySnapshot() {
  return {
    success: false,
    message: "Live API required for admin command center.",
    data: null
  };
}

const adminCommandCenterClient = {
  getSnapshot() {
    return httpGet(ENDPOINTS.adminCommandCenter, emptySnapshot);
  }
};

export default adminCommandCenterClient;

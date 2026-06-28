export const API_MODE = import.meta.env.VITE_API_MODE || "mock";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_VERSION = "v1";

export const isMockMode = () => API_MODE === "mock";

export const isLiveMode = () => API_MODE === "live";

export default {
  API_MODE,
  API_BASE_URL,
  API_VERSION,
  isMockMode,
  isLiveMode
};

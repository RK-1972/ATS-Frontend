const LOCAL_API_BASE_URL = "http://localhost:5000";
const PRODUCTION_API_BASE_URL = "https://optalynx-api.onrender.com";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";

function isLocalApiUrl(url) {
  return (
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.0.0.1")
  );
}

function resolveApiBaseUrl() {
  if (import.meta.env.PROD) {
    if (configuredApiBaseUrl && !isLocalApiUrl(configuredApiBaseUrl)) {
      return configuredApiBaseUrl;
    }

    return PRODUCTION_API_BASE_URL;
  }

  return configuredApiBaseUrl || LOCAL_API_BASE_URL;
}

export const API_MODE =
  import.meta.env.VITE_API_MODE || (import.meta.env.PROD ? "live" : "mock");

export const API_BASE_URL = resolveApiBaseUrl();

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

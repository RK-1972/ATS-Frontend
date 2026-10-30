import ENDPOINTS from "../endpoints";
import { httpGet } from "../httpClient";

const emptySummary = () => ({
  unique_candidates: 0,
  active_applications: 0,
  unassigned_applications: 0,
  upcoming_interviews: 0,
  active_offers: 0
});

const emptyApplications = () => ({
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1
});

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const candidateControlTowerClient = {
  getSummary() {
    return httpGet(
      `${ENDPOINTS.candidateControlTower}/summary`,
      () => ({ success: true, data: emptySummary() })
    );
  },

  searchApplications(params = {}) {
    return httpGet(
      `${ENDPOINTS.candidateControlTower}/applications${buildQuery(params)}`,
      () => ({ success: true, data: emptyApplications() })
    );
  },

  getApplication(mappingId) {
    return httpGet(
      `${ENDPOINTS.candidateControlTower}/applications/${encodeURIComponent(mappingId)}`,
      () => ({ success: true, data: null })
    );
  }
};

export default candidateControlTowerClient;

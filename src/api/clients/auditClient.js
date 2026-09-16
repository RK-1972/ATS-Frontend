import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";
import { cloneData } from "@/utils/cloneData";

function buildAuditUrl(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${ENDPOINTS.audit}?${queryString}` : ENDPOINTS.audit;
}

const auditClient = {

  getAll(params = {}, currentEvents = []) {
    return httpGet(buildAuditUrl(params), () => cloneData(currentEvents));
  },

  getById(id, currentEvents = []) {
    return httpGet(
      `${ENDPOINTS.audit}/${id}`,
      () => cloneData(currentEvents.find((item) => item.id === id) || null)
    );
  },

  create(record) {
    return httpPost(ENDPOINTS.audit, record, () => cloneData(record));
  }

};

export default auditClient;

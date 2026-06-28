import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";
import { cloneData } from "@/utils/cloneData";

const auditClient = {

  getAll(currentEvents = []) {
    return httpGet(ENDPOINTS.audit, () => cloneData(currentEvents));
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

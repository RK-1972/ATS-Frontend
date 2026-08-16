import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import hiringControlTowerMock from "@/data/mock/hiringControlTower.mock";
import { cloneData } from "@/utils/cloneData";

const emptySearchResult = () => ({
  success: true,
  message: "Live API required for requisition lookup.",
  data: {
    items: [],
    page: 1,
    pageSize: 20,
    total: 0
  }
});

const emptyHeaderResult = () => ({
  success: false,
  message: "Live API required for requisition lookup.",
  data: null
});

const emptyLifecycleResult = () => ({
  success: false,
  message: "Live API required for requisition lifecycle.",
  data: null
});

const emptyKpiResult = () => ({
  success: false,
  message: "Live API required for executive KPIs.",
  data: null
});

const emptyStageInspectorResult = () => ({
  success: false,
  message: "Live API required for stage inspector.",
  data: null
});

const hiringControlTowerClient = {

  searchRequisitions({ q = "", page = 1, pageSize = 20 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const query = params.toString();

    return httpGet(
      `${ENDPOINTS.hiringControlTower}/requisitions?${query}`,
      emptySearchResult
    );
  },

  getRequisitionHeader(code) {
    const trimmedCode = String(code || "").trim();
    if (!trimmedCode) {
      return Promise.resolve(emptyHeaderResult());
    }

    return httpGet(
      `${ENDPOINTS.hiringControlTower}/requisitions/${encodeURIComponent(trimmedCode)}`,
      emptyHeaderResult
    );
  },

  getRequisitionLifecycle(code) {
    const trimmedCode = String(code || "").trim();
    if (!trimmedCode) {
      return Promise.resolve(emptyLifecycleResult());
    }

    return httpGet(
      `${ENDPOINTS.hiringControlTower}/requisitions/${encodeURIComponent(trimmedCode)}/lifecycle`,
      emptyLifecycleResult
    );
  },

  getExecutiveKpis() {
    return httpGet(
      `${ENDPOINTS.hiringControlTower}/kpis`,
      emptyKpiResult
    );
  },

  getStageInspector(code, milestoneKey) {
    const trimmedCode = String(code || "").trim();
    const trimmedKey = String(milestoneKey || "").trim();

    if (!trimmedCode || !trimmedKey) {
      return Promise.resolve(emptyStageInspectorResult());
    }

    return httpGet(
      `${ENDPOINTS.hiringControlTower}/requisitions/${encodeURIComponent(trimmedCode)}/stage-inspector/${encodeURIComponent(trimmedKey)}`,
      emptyStageInspectorResult
    );
  },

  getAll() {
    return httpGet(ENDPOINTS.hiringControlTower, () => cloneData(hiringControlTowerMock));
  },

  getById(id, currentData) {
    return httpGet(
      `${ENDPOINTS.hiringControlTower}/${id}`,
      () => cloneData(currentData)
    );
  },

  create(payload) {
    return httpPost(
      ENDPOINTS.hiringControlTower,
      payload,
      () => cloneData(payload)
    );
  },

  update(id, payload) {
    return httpPut(
      `${ENDPOINTS.hiringControlTower}/${id}`,
      payload,
      () => cloneData(payload)
    );
  },

  publish(id, payload) {
    return httpPost(
      `${ENDPOINTS.hiringControlTower}/${id}/publish`,
      payload,
      () => cloneData(payload)
    );
  },

  archive(id) {
    return httpPost(
      `${ENDPOINTS.hiringControlTower}/${id}/archive`,
      {},
      () => ({ id, archived: true })
    );
  },

  delete(id) {
    return httpDelete(
      `${ENDPOINTS.hiringControlTower}/${id}`,
      () => ({ id, deleted: true })
    );
  }

};

export default hiringControlTowerClient;

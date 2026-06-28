import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import hiringControlTowerMock from "@/data/mock/hiringControlTower.mock";
import { cloneData } from "@/utils/cloneData";

const hiringControlTowerClient = {

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

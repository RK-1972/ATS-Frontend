import { ENDPOINTS, masterEntityEndpoint } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import masterDataMock from "@/data/mock/masterData.mock";
import { cloneData } from "@/utils/cloneData";

const masterDataClient = {

  getAll() {
    return httpGet(ENDPOINTS.masterData, () => cloneData(masterDataMock));
  },

  getByEntityType(entityType, currentData) {
    return httpGet(
      masterEntityEndpoint(entityType),
      () => cloneData(currentData?.records?.[entityType] || [])
    );
  },

  getById(entityType, id, currentData) {
    return httpGet(
      `${masterEntityEndpoint(entityType)}/${id}`,
      () => {
        const records = currentData?.records?.[entityType] || [];
        return cloneData(records.find((item) => item.id === id) || null);
      }
    );
  },

  create(entityType, record) {
    return httpPost(
      masterEntityEndpoint(entityType),
      record,
      () => cloneData(record)
    );
  },

  update(entityType, id, record) {
    return httpPut(
      `${masterEntityEndpoint(entityType)}/${id}`,
      record,
      () => cloneData(record)
    );
  },

  publish(entityType, id, record) {
    return httpPost(
      `${masterEntityEndpoint(entityType)}/${id}/publish`,
      record,
      () => cloneData(record)
    );
  },

  archive(entityType, id, record) {
    return httpPost(
      `${masterEntityEndpoint(entityType)}/${id}/archive`,
      record,
      () => cloneData(record)
    );
  },

  rollback(entityType, id, payload) {
    return httpPost(
      `${masterEntityEndpoint(entityType)}/${id}/rollback`,
      payload,
      () => cloneData(payload)
    );
  },

  delete(entityType, id) {
    return httpDelete(
      `${masterEntityEndpoint(entityType)}/${id}`,
      () => ({ id, deleted: true })
    );
  },

  previewImport(entityType, rows) {
    return httpPost(
      `${masterEntityEndpoint(entityType)}/import/preview`,
      { rows },
      () => rows
    );
  },

  commitImport(entityType, rows, reason = "") {
    return httpPost(
      `${masterEntityEndpoint(entityType)}/import`,
      { rows, reason },
      () => ({ imported: rows.length, records: rows })
    );
  },

  exportEntity(entityType) {
    return httpGet(
      `${masterEntityEndpoint(entityType)}/export`,
      () => []
    );
  }

};

export default masterDataClient;

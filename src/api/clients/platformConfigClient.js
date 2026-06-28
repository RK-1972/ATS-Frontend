import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpPatch } from "../httpClient";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import { cloneData } from "@/utils/cloneData";

function mockBundle(config = platformConfigMock) {
  const baseline = cloneData(config);
  baseline.meta = {
    ...baseline.meta,
    draft_changes: 0
  };

  return {
    config: cloneData(config),
    baseline,
    isDirty: false,
    version: "1.0",
    versionStatus: "Published"
  };
}

const platformConfigClient = {

  getAll() {
    return httpGet(ENDPOINTS.platformConfig, () => mockBundle());
  },

  getById(id, currentData) {
    return httpGet(
      `${ENDPOINTS.platformConfig}/${id}`,
      () => cloneData(currentData)
    );
  },

  applyDraft(body) {
    return httpPatch(
      `${ENDPOINTS.platformConfig}/draft`,
      body,
      () => {
        const bundle = mockBundle();
        return bundle;
      }
    );
  },

  replaceDraft(payload) {
    return httpPut(
      `${ENDPOINTS.platformConfig}/draft`,
      payload,
      () => mockBundle(payload)
    );
  },

  publish(reason = "") {
    return httpPost(
      `${ENDPOINTS.platformConfig}/publish`,
      { reason },
      () => {
        const bundle = mockBundle();
        bundle.config.meta.last_published = new Date().toISOString();
        bundle.baseline = cloneData(bundle.config);
        bundle.isDirty = false;
        return bundle;
      }
    );
  },

  discard() {
    return httpPost(
      `${ENDPOINTS.platformConfig}/discard`,
      {},
      () => mockBundle()
    );
  },

  archive(reason = "") {
    return httpPost(
      `${ENDPOINTS.platformConfig}/archive`,
      { reason },
      () => ({ archived: true })
    );
  },

  restore(snapshotId, reason = "") {
    return httpPost(
      `${ENDPOINTS.platformConfig}/restore/${snapshotId}`,
      { reason },
      () => mockBundle()
    );
  },

  validate(payload) {
    return httpPost(
      `${ENDPOINTS.platformConfig}/validate`,
      { payload },
      () => ({ valid: true, errors: [], warnings: [] })
    );
  },

  exportConfig() {
    return httpGet(
      `${ENDPOINTS.platformConfig}/export`,
      () => ({
        exportedAt: new Date().toISOString(),
        version: "1.0",
        payload: cloneData(platformConfigMock)
      })
    );
  },

  previewImport(payload) {
    return httpPost(
      `${ENDPOINTS.platformConfig}/import/preview`,
      { payload },
      () => ({ valid: true, errors: [], warnings: [], summary: {} })
    );
  },

  commitImport(payload, reason = "") {
    return httpPost(
      `${ENDPOINTS.platformConfig}/import`,
      { payload, reason },
      () => mockBundle(payload)
    );
  },

  listSnapshots() {
    return httpGet(
      `${ENDPOINTS.platformConfig}/snapshots`,
      () => []
    );
  },

  update(id, payload) {
    return httpPut(
      `${ENDPOINTS.platformConfig}/${id}`,
      payload,
      () => cloneData(payload)
    );
  },

  delete(id) {
    return httpPut(
      `${ENDPOINTS.platformConfig}/${id}`,
      { deleted: true },
      () => ({ id, deleted: true })
    );
  }

};

export default platformConfigClient;

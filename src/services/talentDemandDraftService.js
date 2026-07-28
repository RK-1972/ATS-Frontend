import API from "../api/axios";

/**
 * Create a Talent Demand draft.
 * @param {object} draftPayload
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function createDraft(draftPayload) {
  const response = await API.post(
    "/api/v1/talent-demand/drafts",
    draftPayload
  );
  return response.data;
}

/**
 * Update an existing Talent Demand draft.
 * @param {string|number} draftId
 * @param {object} draftPayload
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function updateDraft(draftId, draftPayload) {
  const response = await API.put(
    `/api/v1/talent-demand/drafts/${encodeURIComponent(draftId)}`,
    draftPayload
  );
  return response.data;
}

/**
 * Load a Talent Demand draft by id.
 * @param {string|number} draftId
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function getDraft(draftId) {
  const response = await API.get(
    `/api/v1/talent-demand/drafts/${encodeURIComponent(draftId)}`
  );
  return response.data;
}

/**
 * List the current user's Talent Demand drafts.
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function listMyDrafts() {
  const response = await API.get("/api/v1/talent-demand/drafts");
  return response.data;
}

/**
 * Soft-delete a Talent Demand draft.
 * @param {string|number} draftId
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function deleteDraft(draftId) {
  const response = await API.delete(
    `/api/v1/talent-demand/drafts/${encodeURIComponent(draftId)}`
  );
  return response.data;
}

/**
 * Submit a Talent Demand draft to create an operational requisition.
 * @param {string|number} draftId
 * @param {number|null|undefined} rowVersion
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function submitDraft(draftId, rowVersion) {
  const response = await API.post(
    `/api/v1/talent-demand/drafts/${encodeURIComponent(draftId)}/submit`,
    { rowVersion: rowVersion ?? null }
  );
  return response.data;
}

const TalentDemandDraftService = {
  createDraft,
  updateDraft,
  getDraft,
  listMyDrafts,
  deleteDraft,
  submitDraft
};

export {
  createDraft,
  updateDraft,
  getDraft,
  listMyDrafts,
  deleteDraft,
  submitDraft
};
export default TalentDemandDraftService;

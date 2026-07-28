import API from "../api/axios";

/**
 * List Active approved positions for Talent Demand selection.
 * @returns {Promise<object>} API envelope { success, message, data }
 */
async function listApprovedPositions() {
  const response = await API.get("/api/v1/recruitment/approved-positions");
  return response.data;
}

const ApprovedPositionService = {
  listApprovedPositions
};

export default ApprovedPositionService;

import API from "../api/axios";

/**
 * Requestor-safe preview of server-resolved approved position and approval route.
 * @param {{ approved_position_id?: string, requisition_code?: string }} params
 */
async function getTalentDemandFieldResolution(params = {}) {
  const response = await API.get(
    "/api/v1/recruitment/talent-demand-field-resolution",
    { params }
  );
  return response.data;
}

const RequisitionFieldResolutionService = {
  getTalentDemandFieldResolution
};

export default RequisitionFieldResolutionService;

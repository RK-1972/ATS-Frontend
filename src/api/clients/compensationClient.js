import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";

const compensationClient = {
  getStructures() {
    return httpGet(`${ENDPOINTS.compensationStructures}`, () => ({
      success: true,
      data: []
    }));
  },

  getStructureComponents(structureId) {
    return httpGet(
      `${ENDPOINTS.compensationStructures}/${structureId}/components`,
      () => ({
        success: true,
        data: { structure: null, components: [] }
      })
    );
  },

  calculateCompensation(payload) {
    return httpPost(`${ENDPOINTS.compensation}/calculate`, payload, () => ({
      success: true,
      data: {
        gross: 0,
        totalCtc: payload?.annualCtc || 0,
        components: []
      }
    }));
  },

  getDefaultStructureComponents() {
    return httpGet(`${ENDPOINTS.compensationStructures}`, () => ({
      success: true,
      data: []
    })).then(async (response) => {
      const structures = response?.data || [];
      const defaultStructure =
        structures.find((item) => item.isDefault) || structures[0];

      if (!defaultStructure?.structureId) {
        return { structure: null, components: [] };
      }

      const detail = await compensationClient.getStructureComponents(
        defaultStructure.structureId
      );

      return detail?.data || { structure: defaultStructure, components: [] };
    });
  }
};

export default compensationClient;

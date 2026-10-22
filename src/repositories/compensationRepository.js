import compensationClient from "@/api/clients/compensationClient";

async function getActiveStructures() {
  const response = await compensationClient.getStructures();
  return response?.data || [];
}

async function getStructureComponents(structureId) {
  const response = await compensationClient.getStructureComponents(structureId);
  return response?.data || { structure: null, components: [] };
}

async function getDefaultStructureComponents() {
  return compensationClient.getDefaultStructureComponents();
}

async function calculateCompensation(offerId, annualCtc, options = {}) {
  const response = await compensationClient.calculateCompensation({
    offerId,
    annualCtc,
    recalculate: Boolean(options.recalculate)
  });
  return response?.data || null;
}

async function updateStructureComponent(structureId, structureComponentId, payload) {
  const response = await compensationClient.updateStructureComponent(
    structureId,
    structureComponentId,
    payload
  );
  return response?.data || null;
}

const compensationRepository = {
  getActiveStructures,
  getStructureComponents,
  getDefaultStructureComponents,
  calculateCompensation,
  updateStructureComponent
};

export default compensationRepository;

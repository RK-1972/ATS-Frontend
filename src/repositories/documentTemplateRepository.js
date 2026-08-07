import documentTemplateClient from "@/api/clients/documentTemplateClient";

async function getTemplates() {
  const response = await documentTemplateClient.getTemplates();
  return response?.data || [];
}

async function getTemplate(templateId) {
  const response = await documentTemplateClient.getTemplate(templateId);
  return response?.data || null;
}

async function createTemplate(payload) {
  const response = await documentTemplateClient.createTemplate(payload);
  return response?.data || null;
}

async function uploadDocument(templateId, file) {
  const response = await documentTemplateClient.uploadDocument(templateId, file);
  return response?.data || null;
}

async function activateTemplate(templateId) {
  const response = await documentTemplateClient.activateTemplate(templateId);
  return response?.data || null;
}

async function compileTemplate(templateId) {
  const response = await documentTemplateClient.compileTemplate(templateId);
  return response?.data || null;
}

async function getTemplatePlaceholders(templateId) {
  const response = await documentTemplateClient.getTemplatePlaceholders(templateId);
  return response?.data || null;
}

const documentTemplateRepository = {
  getTemplates,
  getTemplate,
  createTemplate,
  uploadDocument,
  activateTemplate,
  compileTemplate,
  getTemplatePlaceholders
};

export default documentTemplateRepository;

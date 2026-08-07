import { ENDPOINTS } from "../endpoints";
import API from "../axios";
import { httpGet, httpPost, httpPut } from "../httpClient";

const documentTemplateClient = {
  getTemplates() {
    return httpGet(`${ENDPOINTS.documentTemplates}`, () => ({
      success: true,
      data: []
    }));
  },

  getTemplate(templateId) {
    return httpGet(`${ENDPOINTS.documentTemplates}/${templateId}`, () => ({
      success: true,
      data: null
    }));
  },

  createTemplate(payload) {
    return httpPost(`${ENDPOINTS.documentTemplates}`, payload);
  },

  uploadDocument(templateId, file) {
    const formData = new FormData();
    formData.append("document", file);

    return API.post(
      `${ENDPOINTS.documentTemplates}/${templateId}/upload`,
      formData
    ).then((response) => response.data);
  },

  activateTemplate(templateId) {
    return httpPut(`${ENDPOINTS.documentTemplates}/${templateId}/activate`, {});
  },

  compileTemplate(templateId) {
    return httpPost(`${ENDPOINTS.documentTemplates}/${templateId}/compile`, {});
  },

  getTemplatePlaceholders(templateId) {
    return httpGet(`${ENDPOINTS.documentTemplates}/${templateId}/placeholders`, () => ({
      success: true,
      data: null
    }));
  }
};

export default documentTemplateClient;

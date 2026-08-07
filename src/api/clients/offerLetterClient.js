import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";

const offerLetterClient = {
  getPending() {
    return httpGet(`${ENDPOINTS.offerLetters}/pending`, () => ({
      success: true,
      data: []
    }));
  },

  getGenerated() {
    return httpGet(`${ENDPOINTS.offerLetters}/generated`, () => ({
      success: true,
      data: []
    }));
  },

  getDetail(offerId) {
    return httpGet(`${ENDPOINTS.offerLetters}/${offerId}`, () => ({
      success: true,
      data: null
    }));
  },

  generate(offerId, payload) {
    return httpPost(
      `${ENDPOINTS.offerLetters}/${offerId}/generate`,
      payload,
      () => ({
        success: true,
        message: "Offer letter generated successfully.",
        data: { offerId, status: "Letter Generated" }
      })
    );
  }
};

export default offerLetterClient;

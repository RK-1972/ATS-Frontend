import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";

function emptyOfferBundle() {
  return {
    offers: [],
    approvals: [],
    negotiations: [],
    summary: { draft: 0, pendingApproval: 0, released: 0, accepted: 0 }
  };
}

const offerClient = {
  getAll() {
    return httpGet(ENDPOINTS.offers, () => emptyOfferBundle());
  },

  getOffer(offerId) {
    return httpGet(`${ENDPOINTS.offers}/${offerId}`, () => ({ success: true, data: null }));
  },

  createOffer(payload) {
    return httpPost(`${ENDPOINTS.offers}`, payload, () => ({
      success: true,
      offer: { offerId: "OFF-2026-00482" },
      toastMessage: "Offer created."
    }));
  },

  submitOffer(offerId, comment = "") {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/submit`, { comment }, () => ({
      success: true,
      toastMessage: "Offer submitted."
    }));
  },

  approveOffer(offerId, approvalStep, comment = "") {
    return httpPost(
      `${ENDPOINTS.offers}/${offerId}/approve`,
      { approval_step: approvalStep, comment },
      () => ({ success: true, toastMessage: "Offer approved." })
    );
  },

  negotiateOffer(offerId, payload) {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/negotiate`, payload, () => ({
      success: true,
      toastMessage: "Negotiation recorded."
    }));
  },

  reviseOffer(offerId, payload) {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/revise`, payload, () => ({
      success: true,
      toastMessage: "Offer revised."
    }));
  },

  releaseOffer(offerId, payload = {}) {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/release`, payload, () => ({
      success: true,
      toastMessage: "Offer released."
    }));
  },

  acceptOffer(offerId) {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/accept`, {}, () => ({
      success: true,
      toastMessage: "Offer accepted."
    }));
  },

  rejectOffer(offerId, reason = "") {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/reject`, { reason }, () => ({
      success: true,
      toastMessage: "Offer declined."
    }));
  },

  withdrawOffer(offerId, reason = "") {
    return httpPost(`${ENDPOINTS.offers}/${offerId}/withdraw`, { reason }, () => ({
      success: true,
      toastMessage: "Offer withdrawn."
    }));
  }
};

export default offerClient;

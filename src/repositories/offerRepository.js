import { isLiveMode } from "@/api/config";
import offerClient from "@/api/clients/offerClient";
import { cloneData } from "@/utils/cloneData";

function getInitialState() {
  return {
    offers: [],
    approvals: [],
    negotiations: [],
    summary: { draft: 0, pendingApproval: 0, released: 0, accepted: 0 }
  };
}

function normalizeBundle(response) {
  if (response?.offers) {
    return cloneData(response);
  }

  return getInitialState();
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const response = await offerClient.getAll();
    return normalizeBundle(response);
  }

  return cloneData(currentData);
}

async function createOffer(offers, payload) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer created." };
  }

  const result = await offerClient.createOffer(payload);
  const bundle = await offerClient.getAll();

  return {
    offers: normalizeBundle(bundle),
    offer: result.offer,
    toastMessage: result.toastMessage
  };
}

async function submitOffer(offers, offerId, comment) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer submitted." };
  }

  const result = await offerClient.submitOffer(offerId, comment);
  const bundle = await offerClient.getAll();

  return {
    offers: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

async function approveOffer(offers, offerId, approvalStep, comment) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Approval recorded." };
  }

  const result = await offerClient.approveOffer(offerId, approvalStep, comment);
  const bundle = await offerClient.getAll();

  return {
    offers: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

async function releaseOffer(offers, offerId, payload) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer released." };
  }

  const result = await offerClient.releaseOffer(offerId, payload);
  const bundle = await offerClient.getAll();

  return {
    offers: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

async function acceptOffer(offers, offerId) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer accepted." };
  }

  const result = await offerClient.acceptOffer(offerId);
  const bundle = await offerClient.getAll();

  return {
    offers: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

const offerRepository = {
  getInitialState,
  getAll,
  createOffer,
  submitOffer,
  approveOffer,
  releaseOffer,
  acceptOffer
};

export default offerRepository;

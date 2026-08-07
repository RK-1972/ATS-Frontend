import { isLiveMode } from "@/api/config";
import offerClient from "@/api/clients/offerClient";
import offerLetterClient from "@/api/clients/offerLetterClient";
import { cloneData } from "@/utils/cloneData";

function getInitialState() {
  return {
    offers: [],
    approvals: [],
    negotiations: [],
    summary: { draft: 0, pendingApproval: 0, released: 0, accepted: 0 },
    awaitingLetters: [],
    generatedLetters: []
  };
}

function normalizeOfferBundle(response) {
  if (response?.offers) {
    return cloneData(response);
  }

  return {
    offers: [],
    approvals: [],
    negotiations: [],
    summary: { draft: 0, pendingApproval: 0, released: 0, accepted: 0 }
  };
}

async function fetchLetterQueues() {
  const [pendingResponse, generatedResponse] = await Promise.all([
    offerLetterClient.getPending(),
    offerLetterClient.getGenerated()
  ]);

  return {
    awaitingLetters: pendingResponse?.data || [],
    generatedLetters: generatedResponse?.data || []
  };
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const [offerResponse, letterQueues] = await Promise.all([
      offerClient.getAll(),
      fetchLetterQueues()
    ]);

    return {
      ...normalizeOfferBundle(offerResponse),
      ...letterQueues
    };
  }

  return cloneData(currentData);
}

async function createOffer(offers, payload) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer created." };
  }

  const result = await offerClient.createOffer(payload);
  const bundle = await getAll();

  return {
    offers: bundle,
    offer: result.offer,
    toastMessage: result.toastMessage
  };
}

async function submitOffer(offers, offerId, comment) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer submitted." };
  }

  const result = await offerClient.submitOffer(offerId, comment);
  const bundle = await getAll();

  return {
    offers: bundle,
    toastMessage: result.toastMessage
  };
}

async function approveOffer(offers, offerId, approvalStep, comment) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Approval recorded." };
  }

  const result = await offerClient.approveOffer(offerId, approvalStep, comment);
  const bundle = await getAll();

  return {
    offers: bundle,
    toastMessage: result.toastMessage
  };
}

async function releaseOffer(offers, offerId, payload) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer released." };
  }

  const result = await offerClient.releaseOffer(offerId, payload);
  const bundle = await getAll();

  return {
    offers: bundle,
    toastMessage: result.toastMessage
  };
}

async function acceptOffer(offers, offerId) {
  if (!isLiveMode()) {
    return { offers, toastMessage: "Offer accepted." };
  }

  const result = await offerClient.acceptOffer(offerId);
  const bundle = await getAll();

  return {
    offers: bundle,
    toastMessage: result.toastMessage
  };
}

async function generateOfferLetter(offerId, payload) {
  const response = await offerLetterClient.generate(offerId, payload);

  return {
    toastMessage: response?.message || "Offer letter generated successfully."
  };
}

function getDefaultSelectedOfferId(offersBundle) {
  const pending = (offersBundle?.offers || []).find(
    (offer) => offer.offerStatus === "Pending Approval"
  );
  return pending?.offerId ?? offersBundle?.offers?.[0]?.offerId ?? null;
}

const offerRepository = {
  getInitialState,
  getDefaultSelectedOfferId,
  getAll,
  createOffer,
  submitOffer,
  approveOffer,
  releaseOffer,
  acceptOffer,
  generateOfferLetter
};

export default offerRepository;

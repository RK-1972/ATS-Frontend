import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import {
  buildApprovedOffersList,
  buildAwaitingLettersList,
  buildGeneratedLettersList,
  buildMyOfferRequestsList,
  buildPendingApprovalQueue,
  buildRejectedOffersList,
  buildReleasedOffersList,
  buildWithdrawnOffersList
} from "@/utils/offerApprovalUtils";

function useOfferWorkspace() {
  const offers = useEnterpriseStore((state) => state.offers);
  const selectedOfferId = useEnterpriseStore((state) => state.offerUi.selectedOfferId);
  const toastMessage = useEnterpriseStore((state) => state.offerUi.toastMessage);

  const setOfferUi = useEnterpriseStore((state) => state.setOfferUi);
  const refreshOffers = useEnterpriseStore((state) => state.refreshOffers);
  const approveOfferStep = useEnterpriseStore((state) => state.approveOfferStep);
  const releaseOffer = useEnterpriseStore((state) => state.releaseOffer);
  const acceptOffer = useEnterpriseStore((state) => state.acceptOffer);
  const negotiateOffer = useEnterpriseStore((state) => state.negotiateOffer);
  const reviseOffer = useEnterpriseStore((state) => state.reviseOffer);
  const generateOfferDocument = useEnterpriseStore((state) => state.generateOfferDocument);

  let loggedInUser = {};
  try {
    loggedInUser = JSON.parse(localStorage.getItem("user") || "null") || {};
  } catch {
    loggedInUser = {};
  }

  const setSelectedOfferId = useCallback((id) => {
    setOfferUi((prev) => ({ ...prev, selectedOfferId: id }));
  }, [setOfferUi]);

  const setToastMessage = useCallback((message) => {
    setOfferUi((prev) => ({ ...prev, toastMessage: message }));
  }, [setOfferUi]);

  const queue = useMemo(() => buildPendingApprovalQueue(offers), [offers]);
  const approvedOffers = useMemo(() => buildApprovedOffersList(offers), [offers]);
  const myOfferRequests = useMemo(
    () => buildMyOfferRequestsList(offers, loggedInUser),
    [offers, loggedInUser]
  );
  const rejectedOffers = useMemo(() => buildRejectedOffersList(offers), [offers]);
  const withdrawnOffers = useMemo(() => buildWithdrawnOffersList(offers), [offers]);
  const releasedOffers = useMemo(() => buildReleasedOffersList(offers), [offers]);
  const awaitingLetters = useMemo(() => buildAwaitingLettersList(offers), [offers]);
  const generatedLetters = useMemo(() => buildGeneratedLettersList(offers), [offers]);

  const selectedOffer = useMemo(() => {
    const allOffers = [
      ...queue,
      ...approvedOffers,
      ...awaitingLetters,
      ...generatedLetters
    ];
    return allOffers.find((offer) => offer.offerId === selectedOfferId) || null;
  }, [queue, approvedOffers, awaitingLetters, generatedLetters, selectedOfferId]);

  const approveOffer = useCallback(
    (offerId, approvalStep, comment) =>
      approveOfferStep(offerId, approvalStep, comment),
    [approveOfferStep]
  );

  return {
    offers,
    queue,
    approvedOffers,
    myOfferRequests,
    rejectedOffers,
    withdrawnOffers,
    releasedOffers,
    awaitingLetters,
    generatedLetters,
    selectedOfferId,
    setSelectedOfferId,
    selectedOffer,
    approveOffer,
    releaseOffer,
    acceptOffer,
    negotiateOffer,
    reviseOffer,
    refreshOffers,
    generateOfferDocument,
    toastMessage,
    setToastMessage
  };
}

export default useOfferWorkspace;

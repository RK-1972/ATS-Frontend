import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import {
  buildApprovedOffersList,
  buildPendingApprovalQueue
} from "@/utils/offerApprovalUtils";

function useOfferWorkspace() {
  const offers = useEnterpriseStore((state) => state.offers);
  const selectedOfferId = useEnterpriseStore((state) => state.offerUi.selectedOfferId);
  const toastMessage = useEnterpriseStore((state) => state.offerUi.toastMessage);

  const setOfferUi = useEnterpriseStore((state) => state.setOfferUi);
  const refreshOffers = useEnterpriseStore((state) => state.refreshOffers);
  const approveOfferStep = useEnterpriseStore((state) => state.approveOfferStep);

  const setSelectedOfferId = useCallback((id) => {
    setOfferUi((prev) => ({ ...prev, selectedOfferId: id }));
  }, [setOfferUi]);

  const setToastMessage = useCallback((message) => {
    setOfferUi((prev) => ({ ...prev, toastMessage: message }));
  }, [setOfferUi]);

  const queue = useMemo(() => buildPendingApprovalQueue(offers), [offers]);
  const approvedOffers = useMemo(() => buildApprovedOffersList(offers), [offers]);

  const selectedOffer = useMemo(
    () => queue.find((offer) => offer.offerId === selectedOfferId) || null,
    [queue, selectedOfferId]
  );

  const approveOffer = useCallback(
    (offerId, approvalStep, comment) =>
      approveOfferStep(offerId, approvalStep, comment),
    [approveOfferStep]
  );

  return {
    offers,
    queue,
    approvedOffers,
    selectedOfferId,
    setSelectedOfferId,
    selectedOffer,
    approveOffer,
    refreshOffers,
    toastMessage,
    setToastMessage
  };
}

export default useOfferWorkspace;

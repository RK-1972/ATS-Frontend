import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import OfferStatusWorkspacePage from "@/components/offers/OfferStatusWorkspacePage";
import { buildMyOfferRequestsList } from "@/utils/offerApprovalUtils";

function MyOfferRequestsPage() {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const {
    offers,
    releaseOffer,
    acceptOffer,
    negotiateOffer,
    reviseOffer
  } = useOutletContext();
  const [busy, setBusy] = useState(false);

  const myOffers = useMemo(
    () => buildMyOfferRequestsList(offers, loggedInUser || {}),
    [offers, loggedInUser]
  );

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <OfferStatusWorkspacePage
      title="My Offer Requests"
      subtitle="Offers you have raised, including drafts, approvals, release, and acceptance."
      emptyTitle="No offer requests yet"
      emptyDescription="Raise an offer request to track it here through the full lifecycle."
      emptyIcon={AssignmentOutlinedIcon}
      statusChipLabel={(count) => `${count} request${count === 1 ? "" : "s"}`}
      offers={myOffers}
      busy={busy}
      onRelease={(offerId) => run(() => releaseOffer(offerId))}
      onAccept={(offerId) => run(() => acceptOffer(offerId))}
      onNegotiate={(offerId, payload) => run(() => negotiateOffer(offerId, payload))}
      onRevise={(offerId, payload) => run(() => reviseOffer(offerId, payload))}
    />
  );
}

export default MyOfferRequestsPage;

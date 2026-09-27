import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { Alert, Snackbar } from "@mui/material";
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
    reviseOffer,
    withdrawOffer,
    refreshOffers
  } = useOutletContext();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const myOffers = useMemo(
    () => buildMyOfferRequestsList(offers, loggedInUser || {}),
    [offers, loggedInUser]
  );

  const run = async (action, successMessage) => {
    setBusy(true);
    try {
      const result = await action();
      if (successMessage) {
        setToast({
          open: true,
          message: result?.toastMessage || successMessage,
          severity: "success"
        });
      }
      await refreshOffers?.();
    } catch (error) {
      setToast({
        open: true,
        message: error?.response?.data?.message || error.message || "Action failed.",
        severity: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
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
      onWithdraw={(offerId, reason) =>
        run(() => withdrawOffer(offerId, reason), "Offer withdrawn.")
      }
    />
    <Snackbar
      open={toast.open}
      autoHideDuration={5000}
      onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        variant="filled"
      >
        {toast.message}
      </Alert>
    </Snackbar>
    </>
  );
}

export default MyOfferRequestsPage;

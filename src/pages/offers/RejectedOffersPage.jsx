import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { Alert, Snackbar } from "@mui/material";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import OfferStatusWorkspacePage from "@/components/offers/OfferStatusWorkspacePage";
import { buildRejectedOffersList } from "@/utils/offerApprovalUtils";

function RejectedOffersPage() {
  const {
    offers,
    adminReleaseOfferToTalentPool,
    refreshOffers
  } = useOutletContext();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const rejectedOffers = useMemo(
    () => buildRejectedOffersList(offers),
    [offers]
  );

  const runAdminRelease = async (offerId, reason) => {
    setBusy(true);
    try {
      const result = await adminReleaseOfferToTalentPool(offerId, reason);
      setToast({
        open: true,
        message: result?.toastMessage || "Candidate released to the Talent Pool.",
        severity: "success"
      });
      await refreshOffers?.();
    } catch (error) {
      setToast({
        open: true,
        message: error?.response?.data?.message || error.message || "Release failed.",
        severity: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <OfferStatusWorkspacePage
        title="Rejected Offers"
        subtitle="Offers declined by candidates after release."
        emptyTitle="No rejected offers"
        emptyDescription="Declined offers will appear here once recorded in Offer Management."
        emptyIcon={HighlightOffOutlinedIcon}
        module="reports"
        statusChipLabel={(count) => `${count} declined`}
        offers={rejectedOffers}
        busy={busy}
        loggedInUser={loggedInUser}
        onAdminReleaseToTalentPool={runAdminRelease}
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

export default RejectedOffersPage;

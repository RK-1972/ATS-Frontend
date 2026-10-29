import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { Alert, Snackbar } from "@mui/material";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

import OfferStatusWorkspacePage from "@/components/offers/OfferStatusWorkspacePage";
import { buildWithdrawnOffersList } from "@/utils/offerApprovalUtils";

function WithdrawnOffersPage() {
  const {
    offers,
    adminReleaseOfferToTalentPool,
    refreshOffers
  } = useOutletContext();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const withdrawnOffers = useMemo(
    () => buildWithdrawnOffersList(offers),
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
        title="Withdrawn Offers"
        subtitle="Offers withdrawn before completion."
        emptyTitle="No withdrawn offers"
        emptyDescription="Withdrawn offers will appear here once recorded in Offer Management."
        emptyIcon={UndoOutlinedIcon}
        module="administration"
        statusChipLabel={(count) => `${count} withdrawn`}
        offers={withdrawnOffers}
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

export default WithdrawnOffersPage;

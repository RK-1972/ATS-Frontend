import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography,
  Alert
} from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferApprovalQueueCard from "@/components/offers/OfferApprovalQueueCard";
import OfferWorkspaceDetailPanel from "@/components/offers/OfferWorkspaceDetailPanel";

function ApprovedOffersPage() {
  const {
    approvedOffers,
    releaseOffer,
    negotiateOffer,
    reviseOffer
  } = useOutletContext();
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const activeOfferId = useMemo(() => {
    if (selectedOfferId && approvedOffers.some((item) => item.offerId === selectedOfferId)) {
      return selectedOfferId;
    }
    return approvedOffers[0]?.offerId || null;
  }, [approvedOffers, selectedOfferId]);

  const selectedOffer = useMemo(
    () => approvedOffers.find((item) => item.offerId === activeOfferId) || null,
    [approvedOffers, activeOfferId]
  );

  const run = async (action, message) => {
    setBusy(true);
    try {
      const result = await action();
      setToast({
        open: true,
        message: result?.toastMessage || message,
        severity: "success"
      });
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
      <WorkspaceHeader
        title="Approved Offers"
        subtitle="Offers that have completed the Enterprise approval workflow and are ready for release."
        statusChip={
          <Chip
            label={`${approvedOffers.length} approved`}
            color="success"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      {approvedOffers.length === 0 ? (
        <EmptyState
          icon={VerifiedOutlinedIcon}
          module="team"
          title="No approved offers"
          description="When offer requests complete all approval steps, they will appear here."
        />
      ) : (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
              Approved offers
            </Typography>
            <Stack spacing={1}>
              {approvedOffers.map((offer) => (
                <OfferApprovalQueueCard
                  key={offer.offerId}
                  offer={offer}
                  selected={offer.offerId === activeOfferId}
                  onClick={() => setSelectedOfferId(offer.offerId)}
                />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <OfferWorkspaceDetailPanel
              offer={selectedOffer}
              busy={busy}
              onRelease={(offerId) =>
                run(() => releaseOffer(offerId), "Offer released.")
              }
              onNegotiate={(offerId, payload) =>
                run(() => negotiateOffer(offerId, payload), "Negotiation recorded.")
              }
              onRevise={(offerId, payload) =>
                run(() => reviseOffer(offerId, payload), "Offer revised.")
              }
            />
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
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

export default ApprovedOffersPage;

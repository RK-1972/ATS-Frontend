import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import {
  Alert,
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";

import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferLetterQueueCard from "@/components/offer-letters/OfferLetterQueueCard";
import OfferLetterWorkspacePanel from "@/components/offer-letters/OfferLetterWorkspacePanel";
import { resolveOfferLetterQueueSelection } from "@/utils/offerLetterUtils";

function AwaitingLettersPage() {
  const navigate = useNavigate();
  const {
    awaitingLetters,
    selectedOfferId,
    setSelectedOfferId,
    generateOfferDocument
  } = useOutletContext();

  const [activeOfferId, setActiveOfferId] = useState(() =>
    resolveOfferLetterQueueSelection(selectedOfferId, awaitingLetters)
  );
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setActiveOfferId((prev) =>
      resolveOfferLetterQueueSelection(selectedOfferId, awaitingLetters, prev)
    );
  }, [awaitingLetters, selectedOfferId]);

  const handleOpen = (offerId) => {
    setActiveOfferId(offerId);
    setSelectedOfferId(offerId);
  };

  const handleGenerate = async (offerId) => {
    const result = await generateOfferDocument(offerId);
    setToast({
      open: true,
      message: result?.toastMessage || "Offer letter generated successfully.",
      severity: "success"
    });
    setActiveOfferId(null);
    setSelectedOfferId(null);
    navigate("/offers/generated-letters", {
      state: { offerId }
    });
    return result;
  };

  return (
    <>
      <WorkspaceHeader
        title="Awaiting Letters"
        subtitle="Approved offers ready for offer letter generation."
        statusChip={
          <Chip
            label={`${awaitingLetters.length} awaiting letter`}
            color="warning"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      {awaitingLetters.length === 0 ? (
        <EmptyState
          icon={MailOutlineOutlinedIcon}
          module="offers"
          title="No offers awaiting letters"
          description="When offers complete approval, they will appear here for letter generation."
        />
      ) : (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
              Awaiting letters queue
            </Typography>

            <Stack spacing={1}>
              {awaitingLetters.map((item) => (
                <OfferLetterQueueCard
                  key={item.offerId}
                  item={item}
                  selected={item.offerId === activeOfferId}
                  onOpen={handleOpen}
                />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <OfferLetterWorkspacePanel
              offerId={activeOfferId}
              onGenerate={handleGenerate}
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
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AwaitingLettersPage;

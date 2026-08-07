import { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";

import {
  Chip,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferLetterQueueCard from "@/components/offer-letters/OfferLetterQueueCard";
import OfferLetterWorkspacePanel from "@/components/offer-letters/OfferLetterWorkspacePanel";
import { resolveOfferLetterQueueSelection } from "@/utils/offerLetterUtils";

function GeneratedLettersPage() {
  const location = useLocation();
  const {
    generatedLetters,
    selectedOfferId,
    setSelectedOfferId
  } = useOutletContext();

  const [activeOfferId, setActiveOfferId] = useState(() =>
    resolveOfferLetterQueueSelection(selectedOfferId, generatedLetters)
  );

  useEffect(() => {
    if (location.state?.offerId) {
      setActiveOfferId(location.state.offerId);
      setSelectedOfferId(location.state.offerId);
      return;
    }

    setActiveOfferId((prev) =>
      resolveOfferLetterQueueSelection(selectedOfferId, generatedLetters, prev)
    );
  }, [generatedLetters, location.state?.offerId, selectedOfferId, setSelectedOfferId]);

  const handleOpen = (offerId) => {
    setActiveOfferId(offerId);
    setSelectedOfferId(offerId);
  };

  return (
    <>
      <WorkspaceHeader
        title="Generated Letters"
        subtitle="Offers with generated offer letter DOCX files."
        statusChip={
          <Chip
            label={`${generatedLetters.length} generated`}
            color="success"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      {generatedLetters.length === 0 ? (
        <EmptyState
          icon={MarkEmailReadOutlinedIcon}
          module="offers"
          title="No generated letters"
          description="Generated offer letter DOCX files will appear here after successful document merge."
        />
      ) : (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
              Generated letters queue
            </Typography>

            <Stack spacing={1}>
              {generatedLetters.map((item) => (
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
              readOnly
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default GeneratedLettersPage;

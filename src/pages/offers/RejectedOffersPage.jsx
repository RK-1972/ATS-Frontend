import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import OfferStatusWorkspacePage from "@/components/offers/OfferStatusWorkspacePage";
import { buildRejectedOffersList } from "@/utils/offerApprovalUtils";

function RejectedOffersPage() {
  const { offers } = useOutletContext();
  const rejectedOffers = useMemo(
    () => buildRejectedOffersList(offers),
    [offers]
  );

  return (
    <OfferStatusWorkspacePage
      title="Rejected Offers"
      subtitle="Offers declined by candidates after release."
      emptyTitle="No rejected offers"
      emptyDescription="Declined offers will appear here once recorded in Offer Management."
      emptyIcon={HighlightOffOutlinedIcon}
      module="reports"
      statusChipLabel={(count) => `${count} declined`}
      offers={rejectedOffers}
    />
  );
}

export default RejectedOffersPage;

import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

import OfferStatusWorkspacePage from "@/components/offers/OfferStatusWorkspacePage";
import { buildWithdrawnOffersList } from "@/utils/offerApprovalUtils";

function WithdrawnOffersPage() {
  const { offers } = useOutletContext();
  const withdrawnOffers = useMemo(
    () => buildWithdrawnOffersList(offers),
    [offers]
  );

  return (
    <OfferStatusWorkspacePage
      title="Withdrawn Offers"
      subtitle="Offers withdrawn before completion."
      emptyTitle="No withdrawn offers"
      emptyDescription="Withdrawn offers will appear here once recorded in Offer Management."
      emptyIcon={UndoOutlinedIcon}
      module="administration"
      statusChipLabel={(count) => `${count} withdrawn`}
      offers={withdrawnOffers}
    />
  );
}

export default WithdrawnOffersPage;

import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import OfferPlaceholderPage from "./OfferPlaceholderPage";

function WithdrawnOffersPage() {
  return (
    <OfferPlaceholderPage
      title="Withdrawn Offers"
      subtitle="Offers that were withdrawn after being raised."
      emptyTitle="No withdrawn offers"
      emptyDescription="Withdrawn offers will appear here once Offer Management is implemented."
      icon={UndoOutlinedIcon}
      module="administration"
    />
  );
}

export default WithdrawnOffersPage;

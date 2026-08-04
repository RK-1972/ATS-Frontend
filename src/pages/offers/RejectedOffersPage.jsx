import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import OfferPlaceholderPage from "./OfferPlaceholderPage";

function RejectedOffersPage() {
  return (
    <OfferPlaceholderPage
      title="Rejected Offers"
      subtitle="Offers that were rejected during approval."
      emptyTitle="No rejected offers"
      emptyDescription="Rejected offers will appear here once Offer Management is implemented."
      icon={HighlightOffOutlinedIcon}
      module="reports"
    />
  );
}

export default RejectedOffersPage;

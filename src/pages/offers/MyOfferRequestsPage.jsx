import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import OfferPlaceholderPage from "./OfferPlaceholderPage";

function MyOfferRequestsPage() {
  return (
    <OfferPlaceholderPage
      title="My Offer Requests"
      subtitle="Track offer requests you have raised."
      emptyTitle="No offer requests yet"
      emptyDescription="Your raised offer requests will appear here once Offer Management functionality is delivered."
      icon={AssignmentOutlinedIcon}
      module="offers"
    />
  );
}

export default MyOfferRequestsPage;

import { useNavigate } from "react-router-dom";

import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

import {
  EnterpriseModuleCard,
  EnterpriseModuleGrid,
  WorkspaceHeader
} from "@/components/enterprise";

const OFFER_HUB_CARDS = [
  {
    key: "raise",
    title: "Raise Offer Request",
    description: "Start a new offer request for a selected candidate.",
    path: "/offers/raise",
    icon: AddBusinessOutlinedIcon,
    module: "offers"
  },
  {
    key: "my-requests",
    title: "My Offer Requests",
    description: "Track offer requests you have raised.",
    path: "/offers/my-requests",
    icon: AssignmentOutlinedIcon,
    module: "offers"
  },
  {
    key: "pending-approvals",
    title: "Pending Offer Approvals",
    description: "Review offers awaiting an approval decision.",
    path: "/offers/pending-approvals",
    icon: PendingActionsOutlinedIcon,
    module: "approvals"
  },
  {
    key: "approved",
    title: "Approved Offers",
    description: "View offers that have been approved.",
    path: "/offers/approved",
    icon: VerifiedOutlinedIcon,
    module: "team"
  },
  {
    key: "rejected",
    title: "Rejected Offers",
    description: "View offers that were rejected.",
    path: "/offers/rejected",
    icon: HighlightOffOutlinedIcon,
    module: "reports"
  },
  {
    key: "withdrawn",
    title: "Withdrawn Offers",
    description: "View offers that were withdrawn.",
    path: "/offers/withdrawn",
    icon: UndoOutlinedIcon,
    module: "administration"
  }
];

/**
 * Offer Workspace hub — enterprise module cards only.
 * No raise/approve/letter business logic in Phase 10.0.
 */
function OfferWorkspaceHomePage() {
  const navigate = useNavigate();

  return (
    <>
      <WorkspaceHeader
        title="Offer Workspace"
        subtitle="Raise offer requests, review pending approvals, and track offer outcomes."
      />

      <EnterpriseModuleGrid>
        {OFFER_HUB_CARDS.map((card) => (
          <EnterpriseModuleCard
            key={card.key}
            title={card.title}
            description={card.description}
            icon={card.icon}
            module={card.module}
            actionLabel="Open"
            onAction={() => navigate(card.path)}
          />
        ))}
      </EnterpriseModuleGrid>
    </>
  );
}

export default OfferWorkspaceHomePage;

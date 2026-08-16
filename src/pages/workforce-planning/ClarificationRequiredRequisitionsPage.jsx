import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import WorkforceRequisitionQueueView from "../../components/workforce-planning/WorkforceRequisitionQueueView";

function ClarificationRequiredRequisitionsPage() {
  return (
    <WorkforceRequisitionQueueView
      queueKey="clarification"
      title="Requisition – Clarification Required"
      subtitle="Requisitions awaiting your clarification response before approval can continue."
      emptyTitle="No requisitions require clarification"
      emptyDescription="When an approver requests clarification, the requisition will appear here."
      emptyIcon={HelpOutlineOutlinedIcon}
      searchPlaceholder="Search by requisition, position, project, comment..."
      primaryActionLabel="Respond"
    />
  );
}

export default ClarificationRequiredRequisitionsPage;

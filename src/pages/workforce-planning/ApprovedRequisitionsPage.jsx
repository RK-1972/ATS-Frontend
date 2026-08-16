import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import WorkforceRequisitionQueueView from "../../components/workforce-planning/WorkforceRequisitionQueueView";

function ApprovedRequisitionsPage() {
  return (
    <WorkforceRequisitionQueueView
      queueKey="approved"
      title="Approved Requisitions"
      subtitle="Requisitions that have completed the approval workflow and can proceed to recruitment execution."
      emptyTitle="No approved requisitions"
      emptyDescription="When requisitions complete all approval steps, they will appear here."
      emptyIcon={VerifiedOutlinedIcon}
      searchPlaceholder="Search by requisition, position, project, requestor..."
    />
  );
}

export default ApprovedRequisitionsPage;

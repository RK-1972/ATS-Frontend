import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import WorkforceRequisitionQueueView from "../../components/workforce-planning/WorkforceRequisitionQueueView";

function RejectedRequisitionsPage() {
  return (
    <WorkforceRequisitionQueueView
      queueKey="rejected"
      title="Rejected Requisitions"
      subtitle="Requisitions whose approval workflow ended in rejection."
      emptyTitle="No rejected requisitions"
      emptyDescription="Rejected requisitions will appear here for traceability."
      emptyIcon={HighlightOffOutlinedIcon}
      searchPlaceholder="Search by requisition, position, project, comment..."
    />
  );
}

export default RejectedRequisitionsPage;

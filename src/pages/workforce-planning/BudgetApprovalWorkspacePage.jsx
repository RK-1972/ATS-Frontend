import { useOutletContext } from "react-router-dom";

import { Grid, Stack, Typography, Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import BudgetRequestCard from "../../components/workforce-planning/BudgetRequestCard";
import ApprovalWorkspacePanel from "../../components/workforce-planning/ApprovalWorkspacePanel";

function BudgetApprovalWorkspacePage() {

  const {
    data,
    selectedRequestId,
    setSelectedRequestId,
    selectedRequest,
    approveRequest,
    rejectRequest,
    sendBackRequest
  } = useOutletContext();

  const pendingCount = data.approval_queue.filter(
    (r) =>
      r.status !== "Approved" &&
      r.status !== "Rejected"
  ).length;

  return (

    <>

      <ConfigPageHeader
        title="Budget approval workspace"
        subtitle="Review, approve, reject, or send back budget requests with full audit trail."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Approval Workspace" }
        ]}
        statusChip={
          <Chip
            label={`${pendingCount} pending review`}
            color="warning"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      <Grid container spacing={1.5}>

        <Grid size={{ xs: 12, lg: 4 }}>

          <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
            Request queue
          </Typography>

          <Stack spacing={1}>

            {data.approval_queue.map((request) => (

              <BudgetRequestCard
                key={request.id}
                request={request}
                selected={request.id === selectedRequestId}
                onClick={() => setSelectedRequestId(request.id)}
              />

            ))}

          </Stack>

        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>

          <ApprovalWorkspacePanel
            request={selectedRequest}
            onApprove={approveRequest}
            onReject={rejectRequest}
            onSendBack={sendBackRequest}
          />

        </Grid>

      </Grid>

    </>

  );

}

export default BudgetApprovalWorkspacePage;

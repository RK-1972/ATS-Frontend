import { useEffect, useMemo } from "react";

import { useLocation, useOutletContext } from "react-router-dom";



import { Grid, Stack, Typography, Chip } from "@mui/material";



import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";

import BudgetRequestCard from "../../components/workforce-planning/BudgetRequestCard";

import ApprovalWorkspacePanel from "../../components/workforce-planning/ApprovalWorkspacePanel";

import { sortApprovalQueueByLatestActivity } from "@/utils/budgetApprovalHistoryUtils";



function BudgetApprovalWorkspacePage() {

  const location = useLocation();



  const {

    data,

    approvalQueueSortKey,

    selectedRequestId,

    setSelectedRequestId,

    selectedRequest,

    approveRequest,

    rejectRequest,

    clarifyRequest,

    resubmitClarification

  } = useOutletContext();



  // Render path: always sort the queue used by BudgetRequestCard.map() here.

  const approvalQueue = useMemo(

    () => sortApprovalQueueByLatestActivity(data?.approval_queue || []),

    [approvalQueueSortKey, data?.approval_queue]

  );



  const defaultRequestId = approvalQueue[0]?.id ?? null;



  const selectedExistsInQueue = useMemo(

    () => approvalQueue.some((item) => item.id === selectedRequestId),

    [approvalQueue, selectedRequestId]

  );



  useEffect(() => {

    const budgetRequestId = location.state?.budgetRequestId;

    if (!budgetRequestId) {

      return;

    }



    const exists = approvalQueue.some((item) => item.id === budgetRequestId);

    if (exists) {

      setSelectedRequestId(budgetRequestId);

    }

  }, [

    location.state?.budgetRequestId,

    approvalQueueSortKey,

    setSelectedRequestId,

    approvalQueue

  ]);



  useEffect(() => {

    if (!approvalQueue.length) {

      if (selectedRequestId) {

        setSelectedRequestId(null);

      }

      return;

    }



    if ((!selectedRequestId || !selectedExistsInQueue) && defaultRequestId) {

      setSelectedRequestId(defaultRequestId);

    }

  }, [

    approvalQueueSortKey,

    approvalQueue.length,

    defaultRequestId,

    selectedExistsInQueue,

    selectedRequestId,

    setSelectedRequestId

  ]);



  const pendingCount = approvalQueue.filter(

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



            {approvalQueue.map((request) => (



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

            key={selectedRequestId || "no-selection"}

            request={selectedRequest}

            onApprove={approveRequest}

            onReject={rejectRequest}

            onClarify={clarifyRequest}

            onResubmit={resubmitClarification}

          />



        </Grid>



      </Grid>



    </>



  );



}



export default BudgetApprovalWorkspacePage;


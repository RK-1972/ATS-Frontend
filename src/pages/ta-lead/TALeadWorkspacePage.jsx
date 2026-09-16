import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Box, Stack, Typography } from "@mui/material";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";



import {

  WorkspaceLayout,

  LoadingState,

  ErrorState,

  EnterpriseSurface

} from "@/components/enterprise";

import EnterpriseWorkspaceHeader from "@/components/enterprise/framework/EnterpriseWorkspaceHeader";

import TALeadNavRail from "@/components/layout/TALeadNavRail";

import TaLeadKpiStrip from "@/components/ta-lead/TaLeadKpiStrip";

import TaLeadPipelineFlow from "@/components/ta-lead/TaLeadPipelineFlow";

import TaLeadQuickActionsPanel from "@/components/ta-lead/TaLeadQuickActionsPanel";

import TaLeadWorkloadSummary from "@/components/ta-lead/TaLeadWorkloadSummary";
import TaLeadAttentionQueues from "@/components/ta-lead/TaLeadAttentionQueues";

import { getPipelineStageLabels } from "@/enterprise/atsStageCatalogUtils";

import useAtsStageCatalog from "@/hooks/useAtsStageCatalog";

import AuthorizationService from "@/services/authorizationService";

import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

import {
  fetchTaLeadAttentionQueues,
  fetchTaLeadOperationsSummary
} from "./taLeadHomeApi";



function TALeadWorkspacePage() {

  const navigate = useNavigate();

  const { stages: catalogStages } = useAtsStageCatalog();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);

  const [reloadToken, setReloadToken] = useState(0);

  const [canAssign, setCanAssign] = useState(false);

  const [canRequest, setCanRequest] = useState(false);

  const [canApprove, setCanApprove] = useState(false);
  const [attentionQueues, setAttentionQueues] = useState(null);



  const workspace = (() => {

    try {

      return JSON.parse(localStorage.getItem("workspace") || "{}") || {};

    } catch {

      return {};

    }

  })();



  useEffect(() => {

    let cancelled = false;



    Promise.all([

      AuthorizationService.canAssignRecruiters(),

      AuthorizationService.canRaiseRequisition(),

      Promise.resolve(Boolean(workspace.showApprovalWorkspace))

    ]).then(([assignAllowed, requestAllowed, approvalAllowed]) => {

      if (!cancelled) {

        setCanAssign(Boolean(assignAllowed));

        setCanRequest(Boolean(requestAllowed));

        setCanApprove(Boolean(approvalAllowed));

      }

    });



    return () => {

      cancelled = true;

    };

  }, [workspace.showApprovalWorkspace]);



  useEffect(() => {

    let active = true;



    Promise.all([
      fetchTaLeadOperationsSummary(),
      canAssign
        ? fetchTaLeadAttentionQueues().catch(() => null)
        : Promise.resolve(null)
    ])

      .then(([summaryData, queueData]) => {

        if (active) {

          setSummary(summaryData);
          setAttentionQueues(queueData);

          setError("");

          setLoading(false);

        }

      })

      .catch((loadError) => {

        if (active) {

          setSummary(null);

          setError(

            loadError.response?.data?.message

              || loadError.message

              || "Failed to load TA Lead workspace."

          );

          setLoading(false);

        }

      });



    return () => {

      active = false;

    };

  }, [reloadToken, canAssign]);



  const handleRetry = useCallback(() => {

    setLoading(true);

    setError("");

    setReloadToken((current) => current + 1);

  }, []);



  const workloadRows = useMemo(

    () => (summary?.recruiter_workload || []).map((row, index) => ({

      id: row.recruiter_code || `recruiter-${index}`,

      ...row

    })),

    [summary?.recruiter_workload]

  );



  const pipelineStages = summary?.pipeline_stages;
  const stageCounts = pipelineStages || {};
  const queueCounts = summary?.workforce?.requisition_queue_counts || null;

  const pipelineStageOrder = useMemo(() => {
    if (!pipelineStages) {
      return [];
    }

    const catalogOrder = getPipelineStageLabels(catalogStages);
    const apiStages = Object.keys(pipelineStages);

    return catalogOrder.filter((stage) => apiStages.includes(stage));
  }, [catalogStages, pipelineStages]);



  const navigateToAssignment = useCallback((requisitionCode) => {
    const code = String(requisitionCode || "").trim();
    const path = code
      ? `/requisitions/assign-recruiters?focus=${encodeURIComponent(code)}`
      : "/requisitions/assign-recruiters";
    navigate(path);
  }, [navigate]);

  const handleWorkloadRowClick = useCallback((row) => {
    const code = row?.recruiter_code;
    if (code) {
      navigate(`/ta-lead/recruiters/${encodeURIComponent(code)}`);
    }
  }, [navigate]);

  const handleKpiMetricClick = useCallback((metricKey) => {
    const targetId = metricKey === "without_recruiter"
      ? "ta-lead-attention-unassigned"
      : metricKey === "closure_eligible"
        ? "ta-lead-attention-closure"
        : null;

    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const quickActions = useMemo(() => {

    const actions = [];



    if (canAssign) {

      actions.push({

        key: "assign",

        label: "Recruiter Assignment",

        icon: AssignmentIndOutlinedIcon,

        onClick: () => navigateToAssignment()

      });

      actions.push({
        key: "recruiter-workload-report",
        label: "Recruiter Workload Report",
        icon: TableChartOutlinedIcon,
        onClick: () => navigate("/reports/standard/RECRUITER_WORKLOAD")
      });
    }



    if (canApprove) {

      actions.push({

        key: "approvals",

        label: "My Approvals",

        icon: FactCheckOutlinedIcon,

        onClick: () => navigate("/my-approvals")

      });

    }



    if (canRequest) {

      actions.push({

        key: "workforce",

        label: "Workforce Planning",

        icon: GroupsOutlinedIcon,

        onClick: () => navigate("/workforce-planning/catalogue")

      });

      actions.push({

        key: "queues",

        label: "Requisition Queues",

        icon: AssignmentTurnedInOutlinedIcon,

        onClick: () => navigate("/requisition-queues/approved")

      });

    }



    return actions;

  }, [canAssign, canApprove, canRequest, navigate, navigateToAssignment]);



  const showOperationalEmptyState = !summary?.requisitions
    && !pipelineStages
    && workloadRows.length === 0;



  if (loading && !summary) {

    return (

      <WorkspaceLayout navRail={<TALeadNavRail />}>

        <LoadingState message="Loading TA Lead workspace…" />

      </WorkspaceLayout>

    );

  }



  if (error && !summary) {

    return (

      <WorkspaceLayout navRail={<TALeadNavRail />}>

        <ErrorState

          title="Unable to load TA Lead workspace"

          message={error}

          onRetry={handleRetry}

        />

      </WorkspaceLayout>

    );

  }



  return (

    <WorkspaceLayout navRail={<TALeadNavRail />}>

      <Box sx={{ py: { xs: 1.5, sm: 2 }, width: "100%", minWidth: 0 }}>

        <EnterpriseWorkspaceHeader

          title="TA Lead Workspace"

          subtitle="Recruiting operations overview and actions requiring attention."

        />



        <Box sx={{ mt: 1, mb: 1.5 }}>

          <TaLeadKpiStrip

            requisitions={summary?.requisitions}

            approvals={summary?.approvals}

            queueCounts={queueCounts}

            onMetricClick={canAssign ? handleKpiMetricClick : undefined}

          />

        </Box>



        <Box

          sx={{

            display: "grid",

            gridTemplateColumns: {

              xs: "1fr",

              lg: quickActions.length > 0 ? "minmax(0, 1fr) 260px" : "1fr"

            },

            gap: 1.5,

            alignItems: "start"

          }}

        >

          <Stack spacing={1.5} minWidth={0}>

            {pipelineStages ? (
              <TaLeadPipelineFlow
                stageOrder={pipelineStageOrder}
                stageCounts={stageCounts}
              />
            ) : null}



            {canAssign && attentionQueues ? (
              <Box id="ta-lead-attention-unassigned">
                <TaLeadAttentionQueues
                  withoutRecruiter={attentionQueues.without_recruiter || []}
                  closureEligible={attentionQueues.closure_eligible || []}
                  onAssignRecruiter={(row) => navigateToAssignment(row.requisition_code)}
                  onManageClosure={(row) => navigateToAssignment(row.requisition_code)}
                />
              </Box>
            ) : null}

            {workloadRows.length > 0 ? (

              <TaLeadWorkloadSummary
                rows={workloadRows}
                onRowClick={canAssign ? handleWorkloadRowClick : undefined}
              />

            ) : null}



            {showOperationalEmptyState ? (

              <EnterpriseSurface sx={{ p: 1.75, borderRadius: 2 }}>

                <Stack direction="row" spacing={1} alignItems="center">

                  <PendingActionsOutlinedIcon color="action" fontSize="small" />

                  <Typography variant="body2" color="text.secondary">

                    Operational assignment metrics are available when recruiter assignment access is granted.

                  </Typography>

                </Stack>

              </EnterpriseSurface>

            ) : null}

          </Stack>



          {quickActions.length > 0 ? (

            <TaLeadQuickActionsPanel

              actions={quickActions}

              pendingApprovals={summary?.approvals?.pending ?? 0}

            />

          ) : null}

        </Box>

      </Box>

    </WorkspaceLayout>

  );

}



export default TALeadWorkspacePage;


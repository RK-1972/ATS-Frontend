import { useMemo } from "react";
import useEnterpriseStore from "@/store/enterpriseStore";
import {
  buildRecruiterWorkspaceData,
  buildEntityTasks,
  buildEntityAuditEvents
} from "@/enterprise/recruiterSelectors";

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function useRecruiterWorkspace() {
  const user = getLoggedInUser();

  const recruitment = useEnterpriseStore((state) => state.recruitment);
  const taskInbox = useEnterpriseStore((state) => state.taskInbox);
  const interviews = useEnterpriseStore((state) => state.interviews);
  const auditEvents = useEnterpriseStore((state) => state.auditEvents);
  const recruiterUi = useEnterpriseStore((state) => state.recruiterUi);
  const setRecruiterUi = useEnterpriseStore((state) => state.setRecruiterUi);
  const completeTask = useEnterpriseStore((state) => state.completeTask);
  const refreshRecruitment = useEnterpriseStore((state) => state.refreshRecruitment);
  const updateRecruitmentStage = useEnterpriseStore((state) => state.updateRecruitmentStage);

  const workspaceData = useMemo(
    () => buildRecruiterWorkspaceData({
      recruitment,
      taskInbox,
      interviews,
      auditEvents,
      filter: recruiterUi.searchQuery,
      statusFilter: recruiterUi.statusFilter,
      stageFilter: recruiterUi.stageFilter,
      kpiFilter: recruiterUi.kpiFilter
    }),
    [
      recruitment,
      taskInbox,
      interviews,
      auditEvents,
      recruiterUi.searchQuery,
      recruiterUi.statusFilter,
      recruiterUi.stageFilter,
      recruiterUi.kpiFilter
    ]
  );

  const selectedRequisition = workspaceData.requisitions.find(
    (req) => req.requisition_code === recruiterUi.selectedRequisitionCode
  ) || recruitment?.requisitions?.find(
    (req) => req.requisition_code === recruiterUi.selectedRequisitionCode
  ) || null;

  const selectedCandidate = workspaceData.pipeline.find(
    (row) => String(row.mapping_id || row.map_id) === String(recruiterUi.selectedCandidateMapId)
  ) || recruitment?.pipeline?.find(
    (row) => String(row.mapping_id || row.map_id) === String(recruiterUi.selectedCandidateMapId)
  ) || null;

  const entityTasks = useMemo(
    () => buildEntityTasks(workspaceData.tasks, {
      requisitionCode: recruiterUi.selectedRequisitionCode,
      candidateMapId: recruiterUi.selectedCandidateMapId
    }),
    [
      workspaceData.tasks,
      recruiterUi.selectedRequisitionCode,
      recruiterUi.selectedCandidateMapId
    ]
  );

  const entityAuditEvents = useMemo(
    () => buildEntityAuditEvents(auditEvents, {
      requisitionCode: recruiterUi.selectedRequisitionCode,
      candidateMapId: recruiterUi.selectedCandidateMapId
    }),
    [
      auditEvents,
      recruiterUi.selectedRequisitionCode,
      recruiterUi.selectedCandidateMapId
    ]
  );

  const handleKpiClick = (metricKey) => {
    if (metricKey === "requisitions") {
      setRecruiterUi({
        activeTab: "requisitions",
        kpiFilter: "requisitions",
        statusFilter: "all",
        stageFilter: "all"
      });
      return;
    }

    if (metricKey === "candidates") {
      setRecruiterUi({
        activeTab: "pipeline",
        kpiFilter: "candidates",
        statusFilter: "all",
        stageFilter: "all"
      });
      return;
    }

    if (metricKey === "interviews") {
      setRecruiterUi({
        activeTab: "pipeline",
        kpiFilter: null,
        stageFilter: "all"
      });
      return;
    }

    if (metricKey === "tasks") {
      setRecruiterUi({ inspectorTab: "tasks" });
      return;
    }

    if (workspaceData.pipelineStages?.includes(metricKey)) {
      setRecruiterUi({
        activeTab: "pipeline",
        stageFilter: metricKey,
        kpiFilter: metricKey
      });
    }
  };

  const handleAdvanceStage = (mapId, stageName) => {
    updateRecruitmentStage(mapId, stageName, "Updated from Recruiter Workspace inspector");
    setRecruiterUi({
      toastMessage: `Stage updated to ${stageName}.`,
      toastSeverity: "success"
    });
  };

  return {
    user,
    ...workspaceData,
    selectedRequisition,
    selectedCandidate,
    entityTasks,
    entityAuditEvents,
    recruiterUi,
    setRecruiterUi,
    completeTask,
    refreshRecruitment,
    updateRecruitmentStage,
    handleKpiClick,
    handleAdvanceStage,
    rawRequisitionCount: recruitment?.requisitions?.length || 0,
    rawPipelineCount: recruitment?.pipeline?.length || 0,
    isLoading: recruitment?.requisitions?.length === 0
      && recruitment?.pipeline?.length === 0
      && !recruiterUi.initialLoadComplete
  };
}

export default useRecruiterWorkspace;

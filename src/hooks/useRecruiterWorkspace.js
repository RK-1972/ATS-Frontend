import { useMemo } from "react";
import useEnterpriseStore from "@/store/enterpriseStore";
import { buildRecruiterWorkspaceData } from "@/enterprise/recruiterSelectors";

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
  const recruiterUi = useEnterpriseStore((state) => state.recruiterUi);
  const setRecruiterUi = useEnterpriseStore((state) => state.setRecruiterUi);
  const completeTask = useEnterpriseStore((state) => state.completeTask);
  const refreshRecruitment = useEnterpriseStore((state) => state.refreshRecruitment);

  const workspaceData = useMemo(
    () => buildRecruiterWorkspaceData({
      recruitment,
      taskInbox,
      interviews,
      filter: recruiterUi.searchQuery
    }),
    [
      recruitment,
      taskInbox,
      interviews,
      recruiterUi.searchQuery
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

  return {
    user,
    ...workspaceData,
    selectedRequisition,
    selectedCandidate,
    recruiterUi,
    setRecruiterUi,
    completeTask,
    refreshRecruitment,
    isLoading: recruitment?.requisitions?.length === 0
      && recruitment?.pipeline?.length === 0
      && !recruiterUi.initialLoadComplete
  };
}

export default useRecruiterWorkspace;

import { useEffect } from "react";
import useEnterpriseStore from "@/store/enterpriseStore";

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function useRequisitionManagement() {
  const loggedInUser = getLoggedInUser();

  const requisitions = useEnterpriseStore(
    (state) => state.requisitionManagement.requisitions
  );
  const assignedRecruiters = useEnterpriseStore(
    (state) => state.requisitionManagement.assignedRecruiters
  );
  const formOptions = useEnterpriseStore(
    (state) => state.requisitionManagement.formOptions
  );
  const ui = useEnterpriseStore((state) => state.requisitionManagementUi);

  const loadRequisitionManagementPage = useEnterpriseStore(
    (state) => state.loadRequisitionManagementPage
  );
  const loadRequisitionFormProjects = useEnterpriseStore(
    (state) => state.loadRequisitionFormProjects
  );
  const loadRequisitionFormHiringManagers = useEnterpriseStore(
    (state) => state.loadRequisitionFormHiringManagers
  );
  const loadAssignedRecruiters = useEnterpriseStore(
    (state) => state.loadAssignedRecruiters
  );
  const setRequisitionManagementUi = useEnterpriseStore(
    (state) => state.setRequisitionManagementUi
  );
  const createRequisitionFromForm = useEnterpriseStore(
    (state) => state.createRequisitionFromForm
  );
  const assignRecruiterOnRequisition = useEnterpriseStore(
    (state) => state.assignRecruiterOnRequisition
  );
  const removeRecruiterFromRequisition = useEnterpriseStore(
    (state) => state.removeRecruiterFromRequisition
  );
  const publishRequisitionToCandidatePortal = useEnterpriseStore(
    (state) => state.publishRequisitionToCandidatePortal
  );
  const unpublishRequisitionFromCandidatePortal = useEnterpriseStore(
    (state) => state.unpublishRequisitionFromCandidatePortal
  );
  const closeRequisitionAsFilled = useEnterpriseStore(
    (state) => state.closeRequisitionAsFilled
  );
  const closeRequisitionAsCancelled = useEnterpriseStore(
    (state) => state.closeRequisitionAsCancelled
  );

  useEffect(() => {
    loadRequisitionManagementPage();
  }, [loadRequisitionManagementPage]);

  return {
    loggedInUser,
    requisitions,
    clients: formOptions.clients,
    projects: formOptions.projects,
    hiringManagers: formOptions.hiringManagers,
    recruiters: formOptions.recruiters,
    assignedRecruiters,
    selectedReqId: ui.selectedReqId,
    selectedRecruiter: ui.selectedRecruiter,
    showAssignModal: ui.showAssignModal,
    initialLoadComplete: ui.initialLoadComplete,
    setRequisitionManagementUi,
    loadRequisitionFormProjects,
    loadRequisitionFormHiringManagers,
    loadAssignedRecruiters,
    createRequisitionFromForm,
    assignRecruiterOnRequisition,
    removeRecruiterFromRequisition,
    publishRequisitionToCandidatePortal,
    unpublishRequisitionFromCandidatePortal,
    closeRequisitionAsFilled,
    closeRequisitionAsCancelled
  };
}

export default useRequisitionManagement;

import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";

function useWorkforcePlanning() {

  const data = useEnterpriseStore((state) => state.workforce);
  const selectedRequestId = useEnterpriseStore(
    (state) => state.workforceUi.selectedRequestId
  );
  const toastMessage = useEnterpriseStore(
    (state) => state.workforceUi.toastMessage
  );

  const setWorkforceUi = useEnterpriseStore((state) => state.setWorkforceUi);
  const approveBudgetRequest = useEnterpriseStore(
    (state) => state.approveBudgetRequest
  );
  const rejectBudgetRequest = useEnterpriseStore(
    (state) => state.rejectBudgetRequest
  );
  const sendBackBudgetRequest = useEnterpriseStore(
    (state) => state.sendBackBudgetRequest
  );
  const createRequisition = useEnterpriseStore((state) => state.createRequisition);

  const setSelectedRequestId = useCallback((id) => {
    setWorkforceUi((prev) => ({ ...prev, selectedRequestId: id }));
  }, [setWorkforceUi]);

  const setToastMessage = useCallback((message) => {
    setWorkforceUi((prev) => ({ ...prev, toastMessage: message }));
  }, [setWorkforceUi]);

  const selectedRequest = useMemo(
    () => data.approval_queue.find((request) => request.id === selectedRequestId),
    [data.approval_queue, selectedRequestId]
  );

  const approveRequest = useCallback(
    (id, comment) => approveBudgetRequest(id, comment),
    [approveBudgetRequest]
  );

  const rejectRequest = useCallback(
    (id, comment) => rejectBudgetRequest(id, comment),
    [rejectBudgetRequest]
  );

  const sendBackRequest = useCallback(
    (id, comment) => sendBackBudgetRequest(id, comment),
    [sendBackBudgetRequest]
  );

  return {
    data,
    selectedRequestId,
    setSelectedRequestId,
    selectedRequest,
    approveRequest,
    rejectRequest,
    sendBackRequest,
    createRequisition,
    toastMessage,
    setToastMessage
  };

}

export default useWorkforcePlanning;

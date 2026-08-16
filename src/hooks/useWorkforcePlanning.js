import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import {
  buildApprovalQueueSortKey,
  sortApprovalQueueByLatestActivity
} from "@/utils/budgetApprovalHistoryUtils";

function useWorkforcePlanning() {
  const data = useEnterpriseStore((state) => state.workforce);
  const selectedRequestId = useEnterpriseStore(
    (state) => state.workforceUi.selectedRequestId
  );
  const toastMessage = useEnterpriseStore(
    (state) => state.workforceUi.toastMessage
  );

  const setWorkforceUi = useEnterpriseStore((state) => state.setWorkforceUi);
  const saveBudgetRequestDraft = useEnterpriseStore(
    (state) => state.saveBudgetRequestDraft
  );
  const submitBudgetRequest = useEnterpriseStore(
    (state) => state.submitBudgetRequest
  );
  const approveBudgetRequest = useEnterpriseStore(
    (state) => state.approveBudgetRequest
  );
  const rejectBudgetRequest = useEnterpriseStore(
    (state) => state.rejectBudgetRequest
  );
  const requestBudgetClarification = useEnterpriseStore(
    (state) => state.requestBudgetClarification
  );
  const submitBudgetClarification = useEnterpriseStore(
    (state) => state.submitBudgetClarification
  );
  const createRequisition = useEnterpriseStore((state) => state.createRequisition);
  const refreshWorkforce = useEnterpriseStore((state) => state.refreshWorkforce);

  const setSelectedRequestId = useCallback((id) => {
    setWorkforceUi((prev) => ({ ...prev, selectedRequestId: id }));
  }, [setWorkforceUi]);

  const setToastMessage = useCallback((message) => {
    setWorkforceUi((prev) => ({ ...prev, toastMessage: message }));
  }, [setWorkforceUi]);

  const approvalQueueSortKey = useMemo(
    () => buildApprovalQueueSortKey(data.approval_queue || []),
    [data.approval_queue]
  );

  const sortedApprovalQueue = useMemo(
    () => sortApprovalQueueByLatestActivity(data.approval_queue || []),
    [approvalQueueSortKey, data.approval_queue]
  );

  const selectedRequest = useMemo(
    () => sortedApprovalQueue.find((request) => request.id === selectedRequestId)
      || (data.approval_queue || []).find((request) => request.id === selectedRequestId)
      || null,
    [sortedApprovalQueue, data.approval_queue, selectedRequestId]
  );

  const saveDraftRequest = useCallback(
    (payload) => saveBudgetRequestDraft(payload),
    [saveBudgetRequestDraft]
  );

  const submitRequest = useCallback(
    (requestId) => submitBudgetRequest(requestId),
    [submitBudgetRequest]
  );

  const approveRequest = useCallback(
    (id, comment) => approveBudgetRequest(id, comment),
    [approveBudgetRequest]
  );

  const rejectRequest = useCallback(
    (id, comment) => rejectBudgetRequest(id, comment),
    [rejectBudgetRequest]
  );

  const clarifyRequest = useCallback(
    (id, comment) => requestBudgetClarification(id, comment),
    [requestBudgetClarification]
  );

  const resubmitClarification = useCallback(
    (id, comment) => submitBudgetClarification(id, comment),
    [submitBudgetClarification]
  );

  return {
    data,
    approvalQueueSortKey,
    sortedApprovalQueue,
    selectedRequestId,
    setSelectedRequestId,
    selectedRequest,
    saveDraftRequest,
    submitRequest,
    approveRequest,
    rejectRequest,
    clarifyRequest,
    resubmitClarification,
    createRequisition,
    refreshWorkforce,
    toastMessage,
    setToastMessage
  };
}

export default useWorkforcePlanning;

import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import { buildHiringControlTowerData } from "@/enterprise/selectors";

const STATUS_COMPLETED = "Completed";
const STATUS_IN_PROGRESS = "In Progress";
const STATUS_PENDING = "Pending";
const STATUS_WAITING_CLARIFICATION = "Waiting for Clarification";
const STATUS_CLARIFICATION_SUBMITTED = "Clarification Submitted";

function useHiringControlTower() {

  const platformConfig = useEnterpriseStore((state) => state.platformConfig);
  const businessRules = useEnterpriseStore((state) => state.businessRules);
  const workforce = useEnterpriseStore((state) => state.workforce);
  const hiringProcess = useEnterpriseStore((state) => state.hiringProcess);
  const auditEvents = useEnterpriseStore((state) => state.auditEvents);

  const selectedStageKey = useEnterpriseStore(
    (state) => state.hiringTowerUi.selectedStageKey
  );
  const showClarificationForm = useEnterpriseStore(
    (state) => state.hiringTowerUi.showClarificationForm
  );
  const clarificationDraft = useEnterpriseStore(
    (state) => state.hiringTowerUi.clarificationDraft
  );
  const toastMessage = useEnterpriseStore(
    (state) => state.hiringTowerUi.toastMessage
  );

  const setHiringTowerUi = useEnterpriseStore((state) => state.setHiringTowerUi);
  const approveHiringStage = useEnterpriseStore((state) => state.approveHiringStage);
  const rejectHiringStage = useEnterpriseStore((state) => state.rejectHiringStage);
  const requestHiringClarification = useEnterpriseStore(
    (state) => state.requestHiringClarification
  );
  const sendHiringClarification = useEnterpriseStore(
    (state) => state.sendHiringClarification
  );
  const submitHiringClarification = useEnterpriseStore(
    (state) => state.submitHiringClarification
  );

  const data = useMemo(
    () => buildHiringControlTowerData({
      platformConfig,
      businessRules,
      workforce,
      hiringProcess,
      auditEvents
    }),
    [platformConfig, businessRules, workforce, hiringProcess, auditEvents]
  );

  const selectedStage = useMemo(
    () => data.stages.find((stage) => stage.key === selectedStageKey) ?? null,
    [data.stages, selectedStageKey]
  );

  const stageNotifications = useMemo(() => {
    if (!selectedStageKey) {
      return null;
    }
    return data.stage_notifications[selectedStageKey] ?? null;
  }, [data.stage_notifications, selectedStageKey]);

  const sortedTimeline = useMemo(
    () =>
      [...data.timeline].sort(
        (a, b) => new Date(a.time) - new Date(b.time)
      ),
    [data.timeline]
  );

  const stageTimeline = useMemo(
    () =>
      sortedTimeline.filter(
        (event) => event.stage_key === selectedStageKey
      ),
    [sortedTimeline, selectedStageKey]
  );

  const setSelectedStageKey = useCallback((key) => {
    setHiringTowerUi((prev) => ({ ...prev, selectedStageKey: key }));
  }, [setHiringTowerUi]);

  const setShowClarificationForm = useCallback((value) => {
    setHiringTowerUi((prev) => ({ ...prev, showClarificationForm: value }));
  }, [setHiringTowerUi]);

  const setToastMessage = useCallback((message) => {
    setHiringTowerUi((prev) => ({ ...prev, toastMessage: message }));
  }, [setHiringTowerUi]);

  const updateClarificationDraft = useCallback((field, value) => {
    setHiringTowerUi((prev) => ({
      ...prev,
      clarificationDraft: { ...prev.clarificationDraft, [field]: value }
    }));
  }, [setHiringTowerUi]);

  const approveStage = useCallback(
    (stageKey) => approveHiringStage(stageKey),
    [approveHiringStage]
  );

  const rejectStage = useCallback(
    (stageKey) => rejectHiringStage(stageKey),
    [rejectHiringStage]
  );

  const requestClarification = useCallback(
    (stageKey) => requestHiringClarification(stageKey),
    [requestHiringClarification]
  );

  const sendClarification = useCallback(
    (stageKey) => sendHiringClarification(stageKey),
    [sendHiringClarification]
  );

  const submitClarification = useCallback(
    (stageKey) => submitHiringClarification(stageKey),
    [submitHiringClarification]
  );

  return {
    data,
    selectedStageKey,
    selectedStage,
    showClarificationForm,
    clarificationDraft,
    stageNotifications,
    sortedTimeline,
    stageTimeline,
    toastMessage,
    setSelectedStageKey,
    setShowClarificationForm,
    setToastMessage,
    approveStage,
    rejectStage,
    requestClarification,
    sendClarification,
    submitClarification,
    updateClarificationDraft
  };

}

export default useHiringControlTower;

export {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_PENDING,
  STATUS_WAITING_CLARIFICATION,
  STATUS_CLARIFICATION_SUBMITTED
};

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import { buildHiringControlTowerData } from "@/enterprise/selectors";
import { isLiveMode } from "@/api/config";
import hiringControlTowerRepository from "@/repositories/hiringControlTowerRepository";

const STATUS_COMPLETED = "Completed";
const STATUS_IN_PROGRESS = "In Progress";
const STATUS_PENDING = "Pending";
const STATUS_WAITING_CLARIFICATION = "Waiting for Clarification";
const STATUS_CLARIFICATION_SUBMITTED = "Clarification Submitted";

function mapMilestoneToTimelineStage(milestone) {
  return {
    key: milestone.key,
    name: milestone.label,
    status: milestone.status,
    source: milestone.source,
    timestamp: milestone.timestamp,
    dueAt: milestone.dueAt,
    sla: milestone.sla,
    reason: milestone.reason
  };
}

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

  const liveModeEnabled = isLiveMode();
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [requisitionHeader, setRequisitionHeader] = useState(null);
  const [requisitionSearchOptions, setRequisitionSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [lifecycleData, setLifecycleData] = useState(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);
  const [lifecycleSelectedKey, setLifecycleSelectedKey] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [headerError, setHeaderError] = useState("");
  const [lifecycleError, setLifecycleError] = useState("");
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState("");
  const [stageInspectorData, setStageInspectorData] = useState(null);
  const [stageInspectorLoading, setStageInspectorLoading] = useState(false);
  const [stageInspectorError, setStageInspectorError] = useState("");
  const stageInspectorCacheRef = useRef(new Map());

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

  const loadRequisitionSearch = useCallback(async (query = "") => {
    if (!liveModeEnabled) {
      setRequisitionSearchOptions([]);
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {
      const result = await hiringControlTowerRepository.searchRequisitions({
        q: query,
        page: 1,
        pageSize: 20
      });
      setRequisitionSearchOptions(result.items || []);
    } catch (error) {
      setRequisitionSearchOptions([]);
      setSearchError(error.message || "Failed to search requisitions.");
    } finally {
      setSearchLoading(false);
    }
  }, [liveModeEnabled]);

  const loadRequisitionHeader = useCallback(async (code) => {
    if (!liveModeEnabled || !code) {
      setRequisitionHeader(null);
      return;
    }

    setHeaderLoading(true);
    setHeaderError("");

    try {
      const header = await hiringControlTowerRepository.getRequisitionHeader(code);
      setRequisitionHeader(header);
    } catch (error) {
      setRequisitionHeader(null);
      setHeaderError(error.message || "Failed to load requisition header.");
    } finally {
      setHeaderLoading(false);
    }
  }, [liveModeEnabled]);

  const loadRequisitionLifecycle = useCallback(async (code) => {
    if (!liveModeEnabled || !code) {
      setLifecycleData(null);
      setLifecycleSelectedKey(null);
      return;
    }

    setLifecycleLoading(true);
    setLifecycleError("");

    try {
      const lifecycle = await hiringControlTowerRepository.getRequisitionLifecycle(code);
      setLifecycleData(lifecycle);
      setLifecycleSelectedKey(lifecycle?.milestones?.[0]?.key ?? null);
    } catch (error) {
      setLifecycleData(null);
      setLifecycleSelectedKey(null);
      setLifecycleError(error.message || "Failed to load hiring lifecycle.");
    } finally {
      setLifecycleLoading(false);
    }
  }, [liveModeEnabled]);

  const loadExecutiveKpis = useCallback(async () => {
    if (!liveModeEnabled) {
      setKpiData(null);
      return;
    }

    setKpiLoading(true);
    setKpiError("");

    try {
      const kpis = await hiringControlTowerRepository.getExecutiveKpis();
      setKpiData(kpis);
    } catch (error) {
      setKpiData(null);
      setKpiError(error.message || "Failed to load executive KPIs.");
    } finally {
      setKpiLoading(false);
    }
  }, [liveModeEnabled]);

  const getStageInspectorCacheKey = useCallback((code, milestoneKey) => {
    return `${String(code || "").trim()}:${String(milestoneKey || "").trim()}`;
  }, []);

  const loadStageInspector = useCallback(async (code, milestoneKey) => {
    if (!liveModeEnabled || !code || !milestoneKey) {
      setStageInspectorData(null);
      setStageInspectorError("");
      setStageInspectorLoading(false);
      return;
    }

    const cacheKey = getStageInspectorCacheKey(code, milestoneKey);
    const cached = stageInspectorCacheRef.current.get(cacheKey);

    if (cached) {
      setStageInspectorData(cached);
      setStageInspectorError("");
      setStageInspectorLoading(false);
      return;
    }

    setStageInspectorLoading(true);
    setStageInspectorError("");
    setStageInspectorData(null);

    try {
      const inspector = await hiringControlTowerRepository.getStageInspector(code, milestoneKey);
      stageInspectorCacheRef.current.set(cacheKey, inspector);
      setStageInspectorData(inspector);
    } catch (error) {
      setStageInspectorData(null);
      setStageInspectorError(error.message || "Stage details could not be loaded.");
    } finally {
      setStageInspectorLoading(false);
    }
  }, [getStageInspectorCacheKey, liveModeEnabled]);

  const handleRequisitionSearch = useCallback((query) => {
    loadRequisitionSearch(query);
  }, [loadRequisitionSearch]);

  const handleRequisitionSelect = useCallback((option) => {
    stageInspectorCacheRef.current.clear();
    setStageInspectorData(null);
    setStageInspectorError("");
    setStageInspectorLoading(false);
    setSelectedRequisition(option);
    setHeaderError("");
    setLifecycleError("");
    setLifecycleData(null);
    setLifecycleSelectedKey(null);

    if (!option?.requisition_code) {
      setRequisitionHeader(null);
      return;
    }

    loadRequisitionHeader(option.requisition_code);
    loadRequisitionLifecycle(option.requisition_code);
  }, [loadRequisitionHeader, loadRequisitionLifecycle]);

  useEffect(() => {
    if (!liveModeEnabled) {
      setLifecycleData(null);
      setLifecycleSelectedKey(null);
      setLifecycleError("");
      setKpiData(null);
      setKpiError("");
      stageInspectorCacheRef.current.clear();
      setStageInspectorData(null);
      setStageInspectorError("");
      setStageInspectorLoading(false);
      return;
    }

    loadExecutiveKpis();
  }, [liveModeEnabled, loadExecutiveKpis]);

  useEffect(() => {
    const code = selectedRequisition?.requisition_code;

    if (!liveModeEnabled || !code || !lifecycleSelectedKey) {
      setStageInspectorData(null);
      setStageInspectorError("");
      setStageInspectorLoading(false);
      return;
    }

    loadStageInspector(code, lifecycleSelectedKey);
  }, [
    liveModeEnabled,
    selectedRequisition?.requisition_code,
    lifecycleSelectedKey,
    loadStageInspector
  ]);

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

  const displayHeader = useMemo(() => {
    if (!liveModeEnabled || !requisitionHeader) {
      return {
        requisition_code: null,
        position_title: null,
        department: null,
        grade: null,
        req_status: null,
        hiring_manager: null,
        isEmpty: true
      };
    }

    return {
      ...requisitionHeader,
      isEmpty: false
    };
  }, [liveModeEnabled, requisitionHeader]);

  const lifecycleStages = useMemo(() => {
    if (!lifecycleData?.milestones?.length) {
      return [];
    }

    return lifecycleData.milestones.map(mapMilestoneToTimelineStage);
  }, [lifecycleData]);

  const lifecycleReady = Boolean(
    liveModeEnabled && selectedRequisition?.requisition_code && lifecycleData
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
    liveModeEnabled,
    selectedRequisition,
    requisitionHeader,
    requisitionSearchOptions,
    searchLoading,
    headerLoading,
    searchError,
    headerError,
    lifecycleData,
    lifecycleStages,
    lifecycleSummary: lifecycleData?.summary ?? null,
    lifecycleMetadata: lifecycleData?.metadata ?? null,
    lifecycleLoading,
    lifecycleError,
    lifecycleSelectedKey,
    lifecycleReady,
    kpiData,
    kpiLoading,
    kpiError,
    stageInspectorData,
    stageInspectorLoading,
    stageInspectorError,
    displayHeader,
    handleRequisitionSearch,
    handleRequisitionSelect,
    setLifecycleSelectedKey,
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

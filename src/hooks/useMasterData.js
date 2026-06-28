import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import {
  getEntityTypeLabel,
  getDomainForEntityType
} from "@/enterprise/masterDataHelpers";

function useMasterData() {

  const masterData = useEnterpriseStore((state) => state.masterData);
  const ui = useEnterpriseStore((state) => state.masterDataUi);
  const auditEvents = useEnterpriseStore((state) => state.auditEvents);

  const setMasterDataUi = useEnterpriseStore((state) => state.setMasterDataUi);
  const selectMasterEntityType = useEnterpriseStore(
    (state) => state.selectMasterEntityType
  );
  const openMasterRecordDrawer = useEnterpriseStore(
    (state) => state.openMasterRecordDrawer
  );
  const closeMasterRecordDrawer = useEnterpriseStore(
    (state) => state.closeMasterRecordDrawer
  );
  const startNewMasterRecord = useEnterpriseStore(
    (state) => state.startNewMasterRecord
  );
  const updateMasterDraft = useEnterpriseStore((state) => state.updateMasterDraft);
  const saveMasterRecord = useEnterpriseStore((state) => state.saveMasterRecord);
  const publishMasterRecord = useEnterpriseStore(
    (state) => state.publishMasterRecord
  );
  const archiveMasterRecord = useEnterpriseStore(
    (state) => state.archiveMasterRecord
  );
  const rollbackMasterRecord = useEnterpriseStore(
    (state) => state.rollbackMasterRecord
  );
  const previewMasterImport = useEnterpriseStore(
    (state) => state.previewMasterImport
  );
  const commitMasterImport = useEnterpriseStore(
    (state) => state.commitMasterImport
  );
  const exportMasterRecords = useEnterpriseStore(
    (state) => state.exportMasterRecords
  );

  const setSearchQuery = useCallback((searchQuery) => {
    setMasterDataUi((prev) => ({ ...prev, searchQuery }));
  }, [setMasterDataUi]);

  const setStatusFilter = useCallback((statusFilter) => {
    setMasterDataUi((prev) => ({ ...prev, statusFilter }));
  }, [setMasterDataUi]);

  const setDrawerTab = useCallback((drawerTab) => {
    setMasterDataUi((prev) => ({ ...prev, drawerTab }));
  }, [setMasterDataUi]);

  const setImportDialogOpen = useCallback((importDialogOpen) => {
    setMasterDataUi((prev) => ({
      ...prev,
      importDialogOpen,
      importPreview: importDialogOpen ? prev.importPreview : null
    }));
  }, [setMasterDataUi]);

  const setToastMessage = useCallback((toastMessage) => {
    setMasterDataUi((prev) => ({ ...prev, toastMessage }));
  }, [setMasterDataUi]);

  const entityRecords = useMemo(
    () => masterData.records[ui.selectedEntityType] || [],
    [masterData.records, ui.selectedEntityType]
  );

  const filteredRecords = useMemo(() => {

    const query = ui.searchQuery.trim().toLowerCase();

    return entityRecords.filter((record) => {

      const matchesSearch =
        !query ||
        record.name.toLowerCase().includes(query) ||
        record.code.toLowerCase().includes(query) ||
        (record.description || "").toLowerCase().includes(query);

      const matchesStatus =
        ui.statusFilter === "all" ||
        record.status.toLowerCase() === ui.statusFilter.toLowerCase() ||
        record.versionStatus.toLowerCase() === ui.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;

    });

  }, [entityRecords, ui.searchQuery, ui.statusFilter]);

  const selectedRecord = useMemo(
    () => entityRecords.find((record) => record.id === ui.selectedRecordId) || null,
    [entityRecords, ui.selectedRecordId]
  );

  const selectedEntityLabel = useMemo(
    () => getEntityTypeLabel(masterData.domains, ui.selectedEntityType),
    [masterData.domains, ui.selectedEntityType]
  );

  const selectedDomain = useMemo(
    () => getDomainForEntityType(masterData.domains, ui.selectedEntityType),
    [masterData.domains, ui.selectedEntityType]
  );

  const recordAuditEvents = useMemo(() => {

    if (!ui.selectedRecordId) {
      return [];
    }

    return auditEvents
      .filter(
        (event) =>
          event.module === "Enterprise Master Data" &&
          event.entityId === ui.selectedRecordId
      )
      .slice()
      .reverse();

  }, [auditEvents, ui.selectedRecordId]);

  const entityMetrics = useMemo(() => {

    const published = entityRecords.filter(
      (record) => record.versionStatus === "Published"
    ).length;

    const draft = entityRecords.filter(
      (record) => record.versionStatus === "Draft"
    ).length;

    return {
      total: entityRecords.length,
      published,
      draft,
      active: entityRecords.filter((record) => record.status === "Active").length
    };

  }, [entityRecords]);

  const downloadExport = useCallback((format = "CSV") => {

    const records = exportMasterRecords(format);

    if (!records.length) {
      setToastMessage("No records to export.");
      return;
    }

    const header = "Code,Name,Description,Status,Version,Version Status,Last Updated";
    const rows = records.map(
      (record) =>
        [
          record.code,
          record.name,
          `"${(record.description || "").replace(/"/g, '""')}"`,
          record.status,
          record.version,
          record.versionStatus,
          record.lastUpdated
        ].join(",")
    );

    const blob = new Blob(
      [[header, ...rows].join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${ui.selectedEntityType}-export.${format === "Excel" ? "xlsx" : "csv"}`;
    link.click();
    URL.revokeObjectURL(link.href);

  }, [exportMasterRecords, setToastMessage, ui.selectedEntityType]);

  const parseImportFile = useCallback((text) => {

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    return lines.slice(1).map((line) => {

      const parts = line.split(",").map((part) => part.trim().replace(/^"|"$/g, ""));

      return {
        code: parts[0] || "",
        name: parts[1] || "",
        description: parts[2] || ""
      };

    }).filter((row) => row.code && row.name);

  }, []);

  return {
    masterData,
    ui,
    filteredRecords,
    selectedRecord,
    selectedEntityLabel,
    selectedDomain,
    recordAuditEvents,
    entityMetrics,
    selectMasterEntityType,
    openMasterRecordDrawer,
    closeMasterRecordDrawer,
    startNewMasterRecord,
    updateMasterDraft,
    saveMasterRecord,
    publishMasterRecord,
    archiveMasterRecord,
    rollbackMasterRecord,
    previewMasterImport,
    commitMasterImport,
    downloadExport,
    parseImportFile,
    setSearchQuery,
    setStatusFilter,
    setDrawerTab,
    setImportDialogOpen,
    setToastMessage
  };

}

export default useMasterData;

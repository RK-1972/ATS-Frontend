import { useMemo, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";

import { Chip, Grid } from "@mui/material";

import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import ConfigMetricSlab from "@/components/platform-config/ConfigMetricSlab";
import SkillsMasterDataToolbar from "@/components/master-data/skills/SkillsMasterDataToolbar";
import SkillsMasterDataGrid from "@/components/master-data/skills/SkillsMasterDataGrid";
import SkillsMasterDataDrawer from "@/components/master-data/skills/SkillsMasterDataDrawer";
import SkillsImportExportDialog from "@/components/master-data/skills/SkillsImportExportDialog";
import {
  SKILLS_ENTITY,
  buildSkillsExportCsv,
  filterSkillsRecords,
  getSkillCategoryOptions,
  parseSkillsImportCsv
} from "@/enterprise/skillsMasterDataUtils";

function SkillsMasterDataModule() {
  const {
    masterData,
    ui,
    selectedEntityLabel,
    selectedDomain,
    entityMetrics,
    recordAuditEvents,
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
    setSearchQuery,
    setStatusFilter,
    setDrawerTab,
    setImportDialogOpen,
    setToastMessage
  } = useOutletContext();

  const [skillCategoryFilter, setSkillCategoryFilter] = useState("all");

  const entityRecords = useMemo(
    () => masterData.records[SKILLS_ENTITY] || [],
    [masterData.records]
  );

  const skillCategoryOptions = useMemo(
    () => getSkillCategoryOptions(masterData),
    [masterData]
  );

  const filteredRecords = useMemo(
    () => filterSkillsRecords(
      entityRecords,
      {
        searchQuery: ui.searchQuery,
        statusFilter: ui.statusFilter,
        skillCategoryFilter
      },
      masterData
    ),
    [entityRecords, ui.searchQuery, ui.statusFilter, skillCategoryFilter, masterData]
  );

  const handleNewSkill = useCallback(() => {
    startNewMasterRecord();
  }, [startNewMasterRecord]);

  const handleSaveSkill = useCallback((reason) => {
    if (!ui.draftRecord?.skillCategoryCode) {
      setToastMessage("Skill Category is required.");
      return;
    }

    saveMasterRecord(reason);
  }, [saveMasterRecord, setToastMessage, ui.draftRecord?.skillCategoryCode]);

  const downloadExport = useCallback((format = "CSV") => {
    const records = entityRecords;

    if (!records.length) {
      setToastMessage("No records to export.");
      return;
    }

    const blob = new Blob(
      [buildSkillsExportCsv(records)],
      { type: "text/csv;charset=utf-8;" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${SKILLS_ENTITY}-export.${format === "Excel" ? "xlsx" : "csv"}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [entityRecords, setToastMessage]);

  const handlePreviewImport = useCallback((text) => {
    const rows = parseSkillsImportCsv(text);
    previewMasterImport(rows);
  }, [previewMasterImport]);

  const handleCommitImport = useCallback((text, reason) => {
    const rows = parseSkillsImportCsv(text);
    commitMasterImport(rows, reason);
  }, [commitMasterImport]);

  return (
    <>
      <ConfigPageHeader
        title={selectedEntityLabel}
        subtitle="Configure skills reference data with mandatory skill category classification."
        breadcrumbs={[
          { label: "Enterprise Master Data" },
          { label: selectedDomain?.label || "Domain" },
          { label: selectedEntityLabel }
        ]}
        statusChip={
          <Chip
            label={`${entityMetrics.total} records`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <ConfigMetricSlab
            label="Total records"
            value={entityMetrics.total}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <ConfigMetricSlab
            label="Published"
            value={entityMetrics.published}
            subtitle="Available to modules"
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <ConfigMetricSlab
            label="Draft"
            value={entityMetrics.draft}
            subtitle="Pending publish"
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <ConfigMetricSlab
            label="Active"
            value={entityMetrics.active}
          />
        </Grid>
      </Grid>

      <SkillsMasterDataToolbar
        searchQuery={ui.searchQuery}
        statusFilter={ui.statusFilter}
        skillCategoryFilter={skillCategoryFilter}
        skillCategoryOptions={skillCategoryOptions}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onSkillCategoryFilterChange={setSkillCategoryFilter}
        onExport={downloadExport}
        onImport={() => setImportDialogOpen(true)}
        onBulkUpload={() => setImportDialogOpen(true)}
        onNew={handleNewSkill}
      />

      <SkillsMasterDataGrid
        records={filteredRecords}
        onEdit={(recordId) => openMasterRecordDrawer(recordId, "edit")}
        onOpenTab={(recordId, tab) => openMasterRecordDrawer(recordId, tab)}
      />

      <SkillsMasterDataDrawer
        open={ui.drawerOpen}
        tab={ui.drawerTab}
        draftRecord={ui.draftRecord}
        auditEvents={recordAuditEvents}
        skillCategoryOptions={skillCategoryOptions}
        onClose={closeMasterRecordDrawer}
        onTabChange={setDrawerTab}
        onUpdateDraft={updateMasterDraft}
        onSave={handleSaveSkill}
        onPublish={publishMasterRecord}
        onArchive={archiveMasterRecord}
        onRollback={rollbackMasterRecord}
      />

      <SkillsImportExportDialog
        open={ui.importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        importPreview={ui.importPreview}
        onPreview={handlePreviewImport}
        onCommit={handleCommitImport}
        onExport={downloadExport}
      />
    </>
  );
}

export default SkillsMasterDataModule;

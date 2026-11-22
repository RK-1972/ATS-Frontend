import { useOutletContext } from "react-router-dom";

import { Chip, Grid } from "@mui/material";

import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import ConfigMetricSlab from "@/components/platform-config/ConfigMetricSlab";
import MasterDataToolbar from "@/components/master-data/MasterDataToolbar";
import MasterDataGrid from "@/components/master-data/MasterDataGrid";
import MasterDataDrawer from "@/components/master-data/MasterDataDrawer";
import MasterDataBulkPublishDialog from "@/components/master-data/MasterDataBulkPublishDialog";
import ImportExportDialog from "@/components/master-data/ImportExportDialog";
import SkillsMasterDataModule from "@/components/master-data/skills/SkillsMasterDataModule";
import useMasterDataBulkPublishActions from "@/components/master-data/useMasterDataBulkPublishActions";
import { SKILLS_ENTITY } from "@/enterprise/skillsMasterDataUtils";

function MasterDataPage() {

  const context = useOutletContext();
  const {
    ui,
    filteredRecords,
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
    bulkPublishMasterRecords,
    archiveMasterRecord,
    rollbackMasterRecord,
    previewMasterImport,
    commitMasterImport,
    downloadExport,
    parseImportFile,
    setSearchQuery,
    setStatusFilter,
    setDrawerTab,
    setImportDialogOpen
  } = context;

  const bulkPublish = useMasterDataBulkPublishActions({
    filteredRecords,
    entityResetKey: ui.selectedEntityType,
    entityLabel: selectedEntityLabel,
    bulkPublishMasterRecords
  });

  if (ui.selectedEntityType === SKILLS_ENTITY) {
    return <SkillsMasterDataModule />;
  }

  const handlePreviewImport = (text) => {
    const rows = parseImportFile(text);
    previewMasterImport(rows);
  };

  const handleCommitImport = (text, reason) => {
    const rows = parseImportFile(text);
    commitMasterImport(rows, reason);
  };

  return (

    <>

      <ConfigPageHeader
        title={selectedEntityLabel}
        subtitle={`Configure ${selectedEntityLabel.toLowerCase()} reference data consumed across OPTALYNX enterprise modules.`}
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

      <MasterDataToolbar
        searchQuery={ui.searchQuery}
        statusFilter={ui.statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onExport={downloadExport}
        onImport={() => setImportDialogOpen(true)}
        onBulkUpload={() => setImportDialogOpen(true)}
        onNew={startNewMasterRecord}
        selectedDraftCount={bulkPublish.selectedEligibleCount}
        filterEligibleDraftCount={bulkPublish.eligibleIds.length}
        onBulkPublish={bulkPublish.openBulkPublishDialog}
      />

      <MasterDataGrid
        records={filteredRecords}
        selectedIds={bulkPublish.selectedIds}
        allEligibleSelected={bulkPublish.allEligibleSelected}
        someEligibleSelected={bulkPublish.someEligibleSelected}
        onToggleSelect={bulkPublish.toggleSelect}
        onToggleSelectAllEligible={bulkPublish.toggleSelectAllEligible}
        onEdit={(recordId) => openMasterRecordDrawer(recordId, "edit")}
        onOpenTab={(recordId, tab) => openMasterRecordDrawer(recordId, tab)}
      />

      <MasterDataBulkPublishDialog
        open={bulkPublish.dialogOpen}
        phase={bulkPublish.dialogPhase}
        selectedCount={bulkPublish.selectedEligibleCount}
        entityLabel={selectedEntityLabel}
        failed={bulkPublish.lastFailed}
        onClose={bulkPublish.closeBulkPublishDialog}
        onConfirm={bulkPublish.confirmBulkPublish}
      />

      <MasterDataDrawer
        open={ui.drawerOpen}
        tab={ui.drawerTab}
        draftRecord={ui.draftRecord}
        auditEvents={recordAuditEvents}
        onClose={closeMasterRecordDrawer}
        onTabChange={setDrawerTab}
        onUpdateDraft={updateMasterDraft}
        onSave={saveMasterRecord}
        onPublish={publishMasterRecord}
        onArchive={archiveMasterRecord}
        onRollback={rollbackMasterRecord}
      />

      <ImportExportDialog
        open={ui.importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        entityLabel={selectedEntityLabel}
        importPreview={ui.importPreview}
        onPreview={handlePreviewImport}
        onCommit={handleCommitImport}
        onExport={downloadExport}
      />

    </>

  );

}

export default MasterDataPage;

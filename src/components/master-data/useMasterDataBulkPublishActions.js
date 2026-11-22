import { useCallback, useState } from "react";

import useMasterDataBulkPublishSelection from "@/hooks/useMasterDataBulkPublishSelection";

function useMasterDataBulkPublishActions({
  filteredRecords,
  entityResetKey,
  entityLabel,
  bulkPublishMasterRecords
}) {
  const selection = useMasterDataBulkPublishSelection(filteredRecords, entityResetKey);
  const [dialogPhase, setDialogPhase] = useState("confirm");
  const [lastFailed, setLastFailed] = useState([]);

  const openBulkPublishDialog = useCallback(() => {
    setDialogPhase("confirm");
    setLastFailed([]);
    selection.setDialogOpen(true);
  }, [selection]);

  const closeBulkPublishDialog = useCallback(() => {
    selection.setDialogOpen(false);
    if (dialogPhase === "result") {
      selection.clearSelection();
    }
  }, [dialogPhase, selection]);

  const confirmBulkPublish = useCallback(async () => {
    const ids = selection.selectedIds.filter((id) =>
      selection.eligibleIds.includes(id)
    );

    if (!ids.length) {
      selection.clearSelection();
      selection.setDialogOpen(false);
      return;
    }

    const result = await bulkPublishMasterRecords(ids, "Bulk publish");

    selection.clearSelection();

    if (result?.failed?.length) {
      setLastFailed(result.failed);
      setDialogPhase("result");
      return;
    }

    selection.setDialogOpen(false);
  }, [bulkPublishMasterRecords, selection]);

  return {
    entityLabel,
    dialogPhase,
    lastFailed,
    openBulkPublishDialog,
    closeBulkPublishDialog,
    confirmBulkPublish,
    ...selection
  };
}

export default useMasterDataBulkPublishActions;
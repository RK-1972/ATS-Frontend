import { useCallback, useEffect, useMemo, useState } from "react";

import { isMasterDataBulkPublishEligible } from "@/enterprise/masterDataBulkPublish";

function useMasterDataBulkPublishSelection(filteredRecords, resetKey) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const eligibleRecords = useMemo(
    () => filteredRecords.filter(isMasterDataBulkPublishEligible),
    [filteredRecords]
  );

  const eligibleIds = useMemo(
    () => eligibleRecords.map((record) => record.id),
    [eligibleRecords]
  );

  const selectedEligibleCount = useMemo(
    () => selectedIds.filter((id) => eligibleIds.includes(id)).length,
    [selectedIds, eligibleIds]
  );

  const allEligibleSelected = useMemo(
    () => eligibleIds.length > 0 && eligibleIds.every((id) => selectedIds.includes(id)),
    [eligibleIds, selectedIds]
  );

  const someEligibleSelected = useMemo(
    () => eligibleIds.some((id) => selectedIds.includes(id)) && !allEligibleSelected,
    [eligibleIds, selectedIds, allEligibleSelected]
  );

  useEffect(() => {
    // Reset grid selection when the active entity type changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional entity-switch reset
    setSelectedIds([]);
    setDialogOpen(false);
  }, [resetKey]);

  const toggleSelect = useCallback((recordId, checked) => {
    setSelectedIds((prev) => {
      if (!checked) {
        return prev.filter((id) => id !== recordId);
      }
      if (prev.includes(recordId)) {
        return prev;
      }
      return [...prev, recordId];
    });
  }, []);

  const toggleSelectAllEligible = useCallback((checked) => {
    setSelectedIds(checked ? [...eligibleIds] : []);
  }, [eligibleIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    eligibleRecords,
    eligibleIds,
    selectedEligibleCount,
    allEligibleSelected,
    someEligibleSelected,
    dialogOpen,
    setDialogOpen,
    toggleSelect,
    toggleSelectAllEligible,
    clearSelection
  };
}

export default useMasterDataBulkPublishSelection;
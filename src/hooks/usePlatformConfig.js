import { useCallback } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";

function usePlatformConfig() {

  const config = useEnterpriseStore((state) => state.platformConfig);
  const isDirty = useEnterpriseStore((state) => state.platformConfigDirty);

  const toggleModule = useEnterpriseStore((state) => state.toggleModule);
  const toggleWorkflow = useEnterpriseStore((state) => state.toggleWorkflow);
  const updateBudget = useEnterpriseStore((state) => state.updateBudget);
  const updateNotificationSettings = useEnterpriseStore(
    (state) => state.updateNotificationSettings
  );
  const updateAiGovernance = useEnterpriseStore((state) => state.updateAiGovernance);
  const toggleNotificationChannel = useEnterpriseStore(
    (state) => state.toggleNotificationChannel
  );
  const toggleAiFeature = useEnterpriseStore((state) => state.toggleAiFeature);
  const toggleRoleVisibility = useEnterpriseStore(
    (state) => state.toggleRoleVisibility
  );
  const insertWorkflowStage = useEnterpriseStore((state) => state.insertWorkflowStage);
  const saveChanges = useEnterpriseStore((state) => state.savePlatformConfig);
  const discardChanges = useEnterpriseStore((state) => state.discardPlatformConfig);

  return {
    config,
    isDirty,
    toggleModule,
    toggleWorkflow,
    updateBudget,
    updateNotificationSettings,
    updateAiGovernance,
    toggleNotificationChannel,
    toggleAiFeature,
    toggleRoleVisibility,
    insertWorkflowStage,
    saveChanges,
    discardChanges
  };

}

export default usePlatformConfig;

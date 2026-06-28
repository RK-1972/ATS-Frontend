import useEnterpriseStore from "@/store/enterpriseStore";

export const selectPlatformConfig = (state) => state.platformConfig;
export const selectBusinessRules = (state) => state.businessRules;
export const selectWorkforce = (state) => state.workforce;
export const selectAuditEvents = (state) => state.auditEvents;
export const selectHiringProcess = (state) => state.hiringProcess;
export const selectMasterData = (state) => state.masterData;
export const selectMasterDataUi = (state) => state.masterDataUi;

export function usePlatformConfigState() {
  return useEnterpriseStore(selectPlatformConfig);
}

export function useBusinessRulesState() {
  return useEnterpriseStore(selectBusinessRules);
}

export function useWorkforceState() {
  return useEnterpriseStore(selectWorkforce);
}

export function useAuditEventsState() {
  return useEnterpriseStore(selectAuditEvents);
}

export function useMasterDataState() {
  return useEnterpriseStore(selectMasterData);
}

export function useMasterDataUiState() {
  return useEnterpriseStore(selectMasterDataUi);
}

export default useEnterpriseStore;

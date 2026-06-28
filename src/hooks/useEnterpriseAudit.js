import useEnterpriseStore from "@/store/enterpriseStore";
import { selectAuditEvents } from "@/store/storeSelectors";

function useEnterpriseAudit(moduleFilter = null) {

  const auditEvents = useEnterpriseStore(selectAuditEvents);

  if (!moduleFilter) {
    return auditEvents;
  }

  return auditEvents.filter((record) => record.module === moduleFilter);

}

export default useEnterpriseAudit;

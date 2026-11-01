import EnterpriseCard from "../enterprise/framework/EnterpriseCard";
import OtiEnterpriseSourcingExperience from "./OtiEnterpriseSourcingExperience";

function RequisitionTalentSourcingPanel({ requisitionCode }) {
  if (!requisitionCode) {
    return null;
  }

  return (
    <EnterpriseCard
      title="Talent Intelligence"
      subtitle="Requisition-scoped sourcing — same enterprise workflow as the dedicated workspace"
    >
      <OtiEnterpriseSourcingExperience requisitionCode={requisitionCode} compact />
    </EnterpriseCard>
  );
}

export default RequisitionTalentSourcingPanel;

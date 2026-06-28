import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import ApprovalMatrixTable from "../../components/business-rules/ApprovalMatrixTable";

function ApprovalMatrixPage() {

  const { config } = useOutletContext();

  return (

    <>

      <ConfigPageHeader
        title="Approval Matrix"
        subtitle="Grade and department-based approval chains, budget limits, and escalation policies."
        breadcrumbs={[
          { label: "Business Rules" },
          { label: "Approval Matrix" }
        ]}
        statusChip={
          <Chip
            label={`${config.approval_matrix.length} policies`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

        <ApprovalMatrixTable matrix={config.approval_matrix} />

      </ConfigSurface>

    </>

  );

}

export default ApprovalMatrixPage;

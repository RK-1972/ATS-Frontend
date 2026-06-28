import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import RoleVisibilityMatrix from "../../components/platform-config/RoleVisibilityMatrix";

function RolesConfigSection() {

  const { config, toggleRoleVisibility } = useOutletContext();

  const { roles, modules, matrix } = config.role_visibility;

  return (

    <>

      <ConfigPageHeader
        title="Role based visibility"
        subtitle="Control which modules appear in navigation and workspaces for each role. Admin and TA Leader retain full access."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Role Visibility" }
        ]}
        statusChip={
          <Chip
            label={`${roles.length} roles · ${modules.length} modules`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <RoleVisibilityMatrix
        roles={roles}
        modules={modules}
        matrix={matrix}
        onToggle={toggleRoleVisibility}
      />

    </>

  );

}

export default RolesConfigSection;

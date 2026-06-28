import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import ModuleConfigPanel from "../../components/platform-config/ModuleConfigPanel";

function ModulesConfigSection() {

  const { config, toggleModule } = useOutletContext();

  const handleConfigure = (module) => {
    window.alert(
      `Module settings for "${module.title}" will open when the Configuration Engine is connected.`
    );
  };

  return (

    <>

      <ConfigPageHeader
        title="Module configuration"
        subtitle="Manage platform modules, dependencies, policies, and defaults for your organization."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Modules" }
        ]}
        statusChip={
          <Chip
            label={`${config.modules.filter((m) => m.enabled).length} active`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

        <ModuleConfigPanel
          modules={config.modules}
          onToggle={toggleModule}
          onConfigure={handleConfigure}
        />

      </ConfigSurface>

    </>

  );

}

export default ModulesConfigSection;

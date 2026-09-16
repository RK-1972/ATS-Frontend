import { Outlet } from "react-router-dom";

import WorkspaceLayout from "@/components/enterprise/WorkspaceLayout";
import HmNavRail from "@/components/hiring-manager/HmNavRail";
import useHiringManagerWorkspace from "@/hooks/useHiringManagerWorkspace";

function HiringManagerWorkspaceLayout() {
  const workspace = useHiringManagerWorkspace();

  return (
    <WorkspaceLayout
      maxWidth={1680}
      navRail={<HmNavRail />}
    >
      <Outlet context={workspace} />
    </WorkspaceLayout>
  );
}

export default HiringManagerWorkspaceLayout;

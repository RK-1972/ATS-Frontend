import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import OptalynxHelpDrawer from "./OptalynxHelpDrawer";
import { resolveHelpContext } from "@/help/resolveHelpContext";
import { fetchHelpTopicsForModule } from "@/help/helpProviders";
import { readHelpSessionContext } from "@/help/helpSessionContext";

function OptalynxHelp({ iconButtonSx }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const helpContext = resolveHelpContext(location.pathname);

  const loadTopics = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const session = readHelpSessionContext();
      const rows = await fetchHelpTopicsForModule({
        moduleKey: helpContext.moduleKey,
        user: session.user,
        workspace: session.workspace,
        roleNames: session.roleNames
      });
      setTopics(rows);
    } catch {
      setTopics([]);
      setLoadError("Unable to load help topics.");
    } finally {
      setIsLoading(false);
    }
  }, [helpContext.moduleKey]);

  useEffect(() => {
    if (!open) {
      return;
    }

    loadTopics();
  }, [open, loadTopics]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Help">
        <IconButton
          aria-label="Open help"
          onClick={handleOpen}
          sx={iconButtonSx}
        >
          <HelpOutlineOutlinedIcon />
        </IconButton>
      </Tooltip>

      <OptalynxHelpDrawer
        open={open}
        onClose={handleClose}
        moduleTitle={helpContext.moduleTitle}
        topics={topics}
        isLoading={isLoading}
        loadError={loadError}
      />
    </>
  );
}

export default OptalynxHelp;

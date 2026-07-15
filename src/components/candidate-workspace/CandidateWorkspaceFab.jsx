import { useState } from "react";

import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

const ACTIONS = [
  { key: "upload-resume", name: "Upload Resume", icon: <UploadFileOutlinedIcon /> },
  { key: "add-skill", name: "Add Skill", icon: <PsychologyOutlinedIcon /> },
  { key: "add-experience", name: "Add Experience", icon: <WorkOutlineOutlinedIcon /> },
  { key: "add-education", name: "Add Education", icon: <SchoolOutlinedIcon /> },
  { key: "upload-document", name: "Upload Document", icon: <DescriptionOutlinedIcon /> },
  { key: "schedule-interview", name: "Schedule Interview", icon: <EventOutlinedIcon /> },
  { key: "map-requisition", name: "Map to Requisition", icon: <LinkOutlinedIcon /> },
  { key: "add-note", name: "Add Note", icon: <StickyNote2OutlinedIcon /> }
];

function CandidateWorkspaceFab({ onAction }) {
  const [open, setOpen] = useState(false);

  return (
    <SpeedDial
      ariaLabel="Candidate quick actions"
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: (theme) => theme.zIndex.speedDial
      }}
      icon={<SpeedDialIcon openIcon={null} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      {ACTIONS.map((action) => (
        <SpeedDialAction
          key={action.key}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={() => {
            setOpen(false);
            onAction?.(action.key);
          }}
        />
      ))}
    </SpeedDial>
  );
}

export default CandidateWorkspaceFab;

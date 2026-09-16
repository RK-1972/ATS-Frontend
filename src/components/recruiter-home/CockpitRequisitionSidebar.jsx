import {

  Box,

  Typography,

  Button,

  Chip,

  Stack,

  IconButton

} from "@mui/material";

import {

  MdWorkOutline,

  MdEdit,

  MdMailOutline

} from "react-icons/md";

import { DESIGN, PANEL_SHELL } from "./recruiterHomeTokens";

import { recruiterRequisitionPath } from "./recruiterHomeUiHelpers";

function CockpitRequisitionSidebar({ requisition, onNavigate }) {

  if (!requisition) return null;



  const priorityStyle = requisition.priority === "High"

    ? { bg: DESIGN.redBg, color: DESIGN.red }

    : { bg: "#F2F4F7", color: "#344054" };



  const requisitionPath = recruiterRequisitionPath(requisition.code);

  const hiringManagerEmail = requisition.hiringManagerEmail || null;

  const handleEmailHiringManager = () => {

    if (!hiringManagerEmail) return;

    window.location.href = `mailto:${hiringManagerEmail}`;

  };



  return (

    <Box

      sx={{

        ...PANEL_SHELL,

        width: { xs: "100%", lg: 300 },

        flexShrink: 0,

        alignSelf: "stretch",

        height: "100%",

        display: "flex",

        flexDirection: "column",

        minHeight: 0,

        overflow: "hidden"

      }}

    >

      <Box sx={{ bgcolor: "#0B3D7A", color: "#fff", px: 1.5, py: 1.5, flexShrink: 0 }}>

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>

          <MdWorkOutline size={20} />

          <IconButton

            size="small"

            sx={{ color: "#fff", p: 0.5 }}

            aria-label="Open requisition details"

            onClick={() => onNavigate?.(requisitionPath)}

          >

            <MdEdit size={16} />

          </IconButton>

        </Stack>

        <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{requisition.title}</Typography>

        <Typography sx={{ fontSize: 12, opacity: 0.85, mt: 0.25 }}>

          {requisition.code} · {requisition.department || "—"}

        </Typography>

        <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap" useFlexGap>

          <Chip label={requisition.displayStatus} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }} />

          {requisition.priority === "High" && (

            <Chip label="HIGH PRIORITY" size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: priorityStyle.bg, color: priorityStyle.color }} />

          )}

        </Stack>

      </Box>

      <Box

        sx={{

          px: 1.5,

          py: 1.25,

          borderTop: `1px solid ${DESIGN.border}`,

          display: "flex",

          gap: 0.75,

          flexShrink: 0,

          bgcolor: "background.paper"

        }}

      >

        <Button

          fullWidth

          variant="contained"

          onClick={() => onNavigate?.(requisitionPath)}

          sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, py: 0.85, bgcolor: "#0B3D7A", boxShadow: "none", "&:hover": { bgcolor: "#092F5E", boxShadow: "none" } }}

        >

          View All Candidates

        </Button>

        {hiringManagerEmail && (

          <IconButton

            sx={{ border: `1px solid ${DESIGN.border}`, borderRadius: 1.5, flexShrink: 0 }}

            aria-label="Email hiring manager"

            onClick={handleEmailHiringManager}

          >

            <MdMailOutline size={20} />

          </IconButton>

        )}

      </Box>

    </Box>

  );

}



export default CockpitRequisitionSidebar;



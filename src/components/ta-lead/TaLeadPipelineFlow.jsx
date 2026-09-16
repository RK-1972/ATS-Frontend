import { Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import { framerTransition } from "@/theme/motion";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";

import { PANEL_SHELL, PANEL_HEADER } from "./taLeadTokens";

const STAGE_ICONS = {
  Applied: PersonAddAltOutlinedIcon,
  Screening: SearchOutlinedIcon,
  "HR Interview": HowToRegOutlinedIcon,
  "L1 Interview": VideoCallOutlinedIcon,
  "L2 Interview": GroupsOutlinedIcon,
  "Client Interview": BusinessOutlinedIcon,
  Offer: WorkspacePremiumOutlinedIcon,
  Joined: CheckCircleOutlinedIcon
};

function StageConnector() {
  return (
    <ChevronRightOutlinedIcon
      sx={{
        fontSize: 16,
        color: "text.disabled",
        flexShrink: 0,
        mx: -0.25
      }}
      aria-hidden
    />
  );
}

function PipelineStageCell({ stage, count, isBottleneck, reducedMotion }) {
  const theme = useTheme();
  const Icon = STAGE_ICONS[stage] || PersonAddAltOutlinedIcon;
  const hasCount = count > 0;

  return (
    <Box
      component={motion.div}
      initial={false}
      animate={{
        scale: isBottleneck && !reducedMotion ? 1.01 : 1
      }}
      transition={framerTransition(reducedMotion)}
      sx={{
        flex: "1 1 0",
        minWidth: { xs: 88, sm: 100 },
        maxWidth: 140,
        px: 1,
        py: 0.85,
        borderRadius: 1.5,
        border: 1,
        borderColor: isBottleneck ? "primary.main" : "divider",
        bgcolor: isBottleneck
          ? alpha(theme.palette.primary.main, 0.06)
          : hasCount
            ? alpha(theme.palette.primary.main, 0.03)
            : "background.default",
        textAlign: "center"
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 0.35 }}>
        <EnterpriseModuleIcon
          icon={Icon}
          module={isBottleneck ? "recruitment" : "candidates"}
          density="xs"
          size={26}
          iconSize={14}
        />
      </Box>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          color: "text.secondary",
          lineHeight: 1.2,
          mb: 0.25,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
      >
        {stage}
      </Typography>
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: isBottleneck ? "primary.main" : "text.primary",
          lineHeight: 1
        }}
      >
        {count}
      </Typography>
    </Box>
  );
}

function TaLeadPipelineFlow({ stageOrder, stageCounts }) {
  const reducedMotion = useReducedMotion();
  const totalActive = stageOrder.reduce(
    (sum, stage) => sum + (stageCounts[stage] ?? 0),
    0
  );

  const bottleneckStage = stageOrder.reduce((best, stage) => {
    const count = stageCounts[stage] ?? 0;
    if (!best || count > (stageCounts[best] ?? 0)) {
      return stage;
    }
    return best;
  }, null);

  const showBottleneck = totalActive > 0 && bottleneckStage;

  return (
    <Box sx={PANEL_SHELL}>
      <Box
        sx={{
          ...PANEL_HEADER,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <EnterpriseModuleIcon
            icon={TimelineOutlinedIcon}
            module="reports"
            density="sm"
            size={28}
            iconSize={16}
          />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
              Recruitment Pipeline
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
              Active candidates across recruitment stages
            </Typography>
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          Total: {totalActive}
        </Typography>
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 1.25,
          display: "flex",
          alignItems: "stretch",
          gap: 0.25,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {stageOrder.map((stage, index) => (
          <Box
            key={stage}
            sx={{
              display: "flex",
              alignItems: "center",
              flex: "1 1 0",
              minWidth: 0
            }}
          >
            <PipelineStageCell
              stage={stage}
              count={stageCounts[stage] ?? 0}
              isBottleneck={showBottleneck && stage === bottleneckStage}
              reducedMotion={reducedMotion}
            />
            {index < stageOrder.length - 1 ? <StageConnector /> : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default TaLeadPipelineFlow;

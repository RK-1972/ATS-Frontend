import {
  Box,
  Typography,
  Stack
} from "@mui/material";

import {
  MdAccountTree,
  MdArrowDownward,
  MdAutoAwesome,
  MdCheckCircle,
  MdLocalOffer,
  MdNotifications,
  MdPayments,
  MdPolicy,
  MdTune,
  MdWorkOutline
} from "react-icons/md";

const MODULE_ICONS = {
  "Platform Configuration": MdTune,
  "Business Rules Engine": MdPolicy,
  "Workflow Configuration": MdAccountTree,
  "Budget Governance": MdPayments,
  "Notifications": MdNotifications,
  "AI Governance": MdAutoAwesome,
  "Recruitment": MdWorkOutline,
  "Offer Management": MdLocalOffer
};

function PipelineNode({ label, Icon, active = false, isTerminal = false }) {

  return (

    <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 88 }}>

      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: active
            ? "primary.main"
            : isTerminal
              ? "rgba(46, 125, 50, 0.12)"
              : "rgba(31, 59, 99, 0.08)",
          color: active
            ? "primary.contrastText"
            : isTerminal
              ? "success.main"
              : "primary.main",
          border: 2,
          borderColor: active
            ? "primary.main"
            : isTerminal
              ? "success.light"
              : "transparent"
        }}
      >

        <Icon size={18} />

      </Box>

      <Typography
        variant="caption"
        fontWeight={600}
        textAlign="center"
        lineHeight={1.2}
        sx={{ fontSize: 10, maxWidth: 96 }}
      >
        {label}
      </Typography>

    </Stack>

  );

}

function IntegrationTraceBar({ chain }) {

  const pipelineSteps = [
    ...chain.map((item) => ({
      label: item.module.replace(" Configuration", "").replace(" Engine", ""),
      module: item.module,
      active: false
    })),
    {
      label: "Hiring Complete",
      module: "Hiring Complete",
      active: false,
      isTerminal: true
    }
  ];

  const activeIndex = pipelineSteps.findIndex(
    (step) => step.module === "Recruitment"
  );

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        px: 2,
        py: 1.5
      }}
    >

      <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
        Integration Pipeline
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          overflowX: "auto",
          pb: 0.5,
          "&::-webkit-scrollbar": { height: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 1 }
        }}
      >

        {pipelineSteps.map((step, index) => {

          const Icon =
            step.isTerminal
              ? MdCheckCircle
              : MODULE_ICONS[step.module] ?? MdTune;

          const isActive = index === activeIndex;

          return (

            <Stack
              key={step.module}
              direction="row"
              alignItems="flex-start"
              spacing={0}
            >

              <PipelineNode
                label={step.label}
                Icon={Icon}
                active={isActive}
                isTerminal={step.isTerminal}
              />

              {index < pipelineSteps.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pt: 1.25,
                    px: 0.5,
                    flexShrink: 0
                  }}
                >

                  <Box
                    sx={{
                      width: 2,
                      height: 8,
                      bgcolor: index < activeIndex ? "success.main" : "divider"
                    }}
                  />

                  <Box sx={{ color: index < activeIndex ? "success.main" : "text.disabled", my: 0.25 }}>
                    <MdArrowDownward size={14} />
                  </Box>

                </Box>
              )}

            </Stack>

          );

        })}

      </Box>

    </Box>

  );

}

export default IntegrationTraceBar;

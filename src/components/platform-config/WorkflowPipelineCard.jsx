import {
  Box,
  Typography,
  Stack,
  Switch,
  Chip,
  Button,
  Divider
} from "@mui/material";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

function StagePipeline({ stages, approvalStages = [] }) {

  return (

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.5,
        py: 1
      }}
    >

      {stages.map((stage, index) => {

        const isApproval = approvalStages.includes(stage);

        return (

          <Stack
            key={stage}
            direction="row"
            alignItems="center"
            spacing={0.5}
          >

            <Chip
              label={stage}
              size="small"
              icon={
                isApproval ? (
                  <GavelOutlinedIcon sx={{ fontSize: "14px !important" }} />
                ) : undefined
              }
              variant={isApproval ? "filled" : "outlined"}
              color={isApproval ? "secondary" : "default"}
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                "& .MuiChip-icon": { ml: 0.5 }
              }}
            />

            {index < stages.length - 1 && (
              <Box
                sx={{
                  width: 16,
                  height: 2,
                  bgcolor: "divider",
                  borderRadius: 1
                }}
              />
            )}

          </Stack>

        );

      })}

    </Box>

  );

}

function WorkflowPipelineCard({

  title,
  description,
  enabled,
  steps,
  approvals,
  status,
  version,
  sla_hours,
  stages = [],
  approval_stages = [],
  onToggle,
  onConfigure

}) {

  const statusColor =
    status === "Published"
      ? "success"
      : status === "Draft"
        ? "warning"
        : "default";

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden"
      }}
    >

      <Box sx={{ px: 2, py: 1.5 }}>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >

          <Box flex={1} minWidth={0}>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">

              <Typography variant="subtitle2" fontWeight={700}>
                {title}
              </Typography>

              <Chip
                label={status}
                size="small"
                color={statusColor}
                variant="outlined"
                sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
              />

              <Typography variant="caption" color="text.secondary">
                v{version}
              </Typography>

            </Stack>

            <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
              {description}
            </Typography>

          </Box>

          <Switch
            checked={enabled}
            onChange={onToggle}
            size="small"
            inputProps={{ "aria-label": `Enable ${title}` }}
          />

        </Stack>

        <Stack
          direction="row"
          spacing={1}
          mt={1}
          flexWrap="wrap"
          useFlexGap
        >

          <Chip
            icon={<CheckCircleOutlinedIcon sx={{ fontSize: "14px !important" }} />}
            label={`${steps} stages`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />

          <Chip
            icon={<GavelOutlinedIcon sx={{ fontSize: "14px !important" }} />}
            label={`${approvals} approvals`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />

          <Chip
            label={`SLA ${sla_hours}h`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />

        </Stack>

      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1 }}>

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          Pipeline
        </Typography>

        <StagePipeline
          stages={stages}
          approvalStages={approval_stages}
        />

      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1, bgcolor: "action.hover" }}>

        <Button
          size="small"
          startIcon={<TuneOutlinedIcon />}
          onClick={onConfigure}
          sx={{ fontWeight: 600 }}
        >
          Configure workflow
        </Button>

      </Box>

    </Box>

  );

}

export default WorkflowPipelineCard;

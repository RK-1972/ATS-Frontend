import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  LinearProgress,
  Tooltip
} from "@mui/material";

import { MdAddCircleOutline } from "react-icons/md";

import { formatCurrency } from "@/utils/formatCurrency";
import WorkforceStatusChip from "./WorkforceStatusChip";

function PositionCatalogueCard({ position, onCreateRequisition }) {

  const canCreateReq =
    position.remaining_budget > 0 &&
    position.status !== "Fully Utilized";

  const utilizationPct =
    position.budget_approved > 0
      ? Math.round(
          (position.budget_consumed / position.budget_approved) * 100
        )
      : 0;

  const disabledReason = !canCreateReq
    ? position.status === "Fully Utilized"
      ? "Budget fully utilized"
      : "No remaining approved budget"
    : position.status === "Expiring Soon"
      ? "Budget expiring soon — renew if needed"
      : null;

  return (

    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: 1,
        borderColor: "divider"
      }}
    >

      <CardContent
        sx={{
          p: 1.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 1.5 }
        }}
      >

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >

          <Box minWidth={0}>

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: 11 }}
            >
              {position.id}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              mt={0.25}
              sx={{ fontSize: 14, lineHeight: 1.3 }}
            >
              {position.position}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
              {position.department} · Grade {position.grade}
            </Typography>

          </Box>

          <WorkforceStatusChip status={position.status} />

        </Stack>

        <Box mt={1.25} flex={1}>

          <Stack direction="row" justifyContent="space-between" mb={0.25}>

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              Budget {utilizationPct}%
            </Typography>

            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>
              {formatCurrency(position.remaining_budget)} left
            </Typography>

          </Stack>

          <LinearProgress
            variant="determinate"
            value={utilizationPct}
            sx={{ height: 5, borderRadius: 1, mb: 0.75 }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            {formatCurrency(position.budget_approved)} approved · Expires{" "}
            {new Date(position.expiry_date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric"
            })}
            · {position.requisitions_created} req(s)
          </Typography>

        </Box>

        <Tooltip title={disabledReason || ""} disableHoverListener={canCreateReq}>

          <span>

            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<MdAddCircleOutline size={16} />}
              disabled={!canCreateReq}
              onClick={() => onCreateRequisition(position.id)}
              sx={{ mt: 1.25, fontWeight: 600, py: 0.625 }}
            >
              Create requisition
            </Button>

          </span>

        </Tooltip>

      </CardContent>

    </Card>

  );

}

export default PositionCatalogueCard;

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MdAssignmentTurnedIn,
  MdPersonOff,
  MdPendingActions,
  MdPlaylistAddCheck,
  MdHelpOutline,
  MdCancel,
  MdTaskAlt
} from "react-icons/md";

import { DenseM3MotionCard } from "@/components/enterprise";

const KPI_ICON_MAP = {
  approved: MdAssignmentTurnedIn,
  without_recruiter: MdPersonOff,
  pending_approvals: MdPendingActions,
  queue_approved: MdPlaylistAddCheck,
  queue_clarification: MdHelpOutline,
  queue_rejected: MdCancel,
  closure_eligible: MdTaskAlt
};

function TaLeadKpiStrip({ requisitions, approvals, queueCounts, onMetricClick }) {
  const theme = useTheme();
  const { denseMotionCard } = theme.tokens;

  const metrics = [];

  if (requisitions) {
    metrics.push({
      key: "approved",
      label: "Approved Requisitions",
      value: requisitions.approved ?? 0,
      highlight: false
    });
    metrics.push({
      key: "without_recruiter",
      label: "Without Recruiter",
      value: requisitions.without_recruiter ?? 0,
      highlight: (requisitions.without_recruiter ?? 0) > 0
    });
    metrics.push({
      key: "closure_eligible",
      label: "Closure Eligible",
      value: requisitions.closure_eligible ?? 0,
      highlight: (requisitions.closure_eligible ?? 0) > 0
    });
  }

  metrics.push({
    key: "pending_approvals",
    label: "My Pending Approvals",
    value: approvals?.pending ?? 0,
    highlight: (approvals?.pending ?? 0) > 0
  });

  if (queueCounts) {
    metrics.push({
      key: "queue_approved",
      label: "My Approved Queue",
      value: queueCounts.approved ?? 0,
      highlight: false
    });
    metrics.push({
      key: "queue_clarification",
      label: "My Clarifications",
      value: queueCounts.clarification ?? 0,
      highlight: (queueCounts.clarification ?? 0) > 0
    });
    metrics.push({
      key: "queue_rejected",
      label: "My Rejected",
      value: queueCounts.rejected ?? 0,
      highlight: false
    });
  }

  if (!metrics.length) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          lg: `repeat(${Math.min(metrics.length, 4)}, minmax(0, 1fr))`
        },
        gap: denseMotionCard.gap,
        width: "100%",
        minWidth: 0
      }}
    >
      {metrics.map((metric) => {
        const clickable = Boolean(onMetricClick)
          && ["without_recruiter", "closure_eligible"].includes(metric.key);

        const card = (
          <DenseM3MotionCard
            key={metric.key}
            icon={KPI_ICON_MAP[metric.key]}
            value={metric.value}
            label={metric.label}
            highlight={metric.highlight}
          />
        );

        if (!clickable) {
          return card;
        }

        return (
          <Box
            key={metric.key}
            onClick={() => onMetricClick(metric.key)}
            sx={{ cursor: "pointer" }}
          >
            {card}
          </Box>
        );
      })}
    </Box>
  );
}

export default TaLeadKpiStrip;

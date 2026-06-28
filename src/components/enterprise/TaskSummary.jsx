import { Box, Typography, Stack, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EnterpriseSurface from "./EnterpriseSurface";
import StatusChip from "./StatusChip";
import PriorityChip from "./PriorityChip";
import SLAChip from "./SLAChip";

function TaskSummary({
  tasks = [],
  title = "Tasks Requiring Attention",
  onComplete,
  onViewAll,
  maxItems = 5
}) {
  const theme = useTheme();
  const { typography } = theme.tokens;
  const visible = tasks.slice(0, maxItems);

  return (
    <EnterpriseSurface>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Typography sx={{ ...typography.sectionTitle, fontSize: 16 }}>
          {title}
        </Typography>
        {onViewAll && (
          <Button size="small" onClick={onViewAll}>
            View all
          </Button>
        )}
      </Stack>

      {!visible.length ? (
        <Typography color="text.secondary" sx={{ fontSize: typography.secondary.fontSize }}>
          No pending tasks.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {visible.map((task) => (
            <Box
              key={task.task_id || task.id || task.title}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
                py: 0.75,
                borderBottom: 1,
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 }
              }}
            >
              <Box minWidth={0}>
                <Typography
                  sx={{
                    fontSize: typography.secondary.fontSize,
                    fontWeight: 600,
                    lineHeight: 1.35
                  }}
                >
                  {task.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: typography.caption.fontSize, mt: 0.25 }}
                >
                  {task.task_type || task.module}
                </Typography>
                <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
                  <StatusChip status={task.status} />
                  {task.priority && <PriorityChip priority={task.priority} />}
                  {task.sla_status && <SLAChip status={task.sla_status} />}
                </Stack>
              </Box>

              {onComplete && task.status === "Pending" && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onComplete(task)}
                >
                  Complete
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </EnterpriseSurface>
  );
}

export default TaskSummary;

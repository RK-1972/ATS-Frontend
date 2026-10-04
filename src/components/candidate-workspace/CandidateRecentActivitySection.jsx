import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { EnterpriseSurface } from "@/components/enterprise";

function FieldRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} py={0.75}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function CandidateRecentActivitySection({ timelineEvents = [] }) {
  const theme = useTheme();
  const { typography } = theme.tokens;
  const recentActivity = timelineEvents.filter((event) => !event.placeholder).slice(0, 3);

  return (
    <EnterpriseSurface sx={{ mt: 2 }}>
      <Typography sx={{ ...typography.sectionTitle, fontSize: 15, mb: 1.5 }}>
        Recent Activity
      </Typography>
      {recentActivity.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Activity will appear as the candidate progresses through the hiring pipeline.
        </Typography>
      ) : (
        recentActivity.map((event) => (
          <FieldRow
            key={event.id}
            label={event.type}
            value={event.date ? new Date(event.date).toLocaleString() : event.description}
          />
        ))
      )}
    </EnterpriseSurface>
  );
}

export default CandidateRecentActivitySection;

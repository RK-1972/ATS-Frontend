import {
  Box,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import { EmptyState, EnterpriseSurface } from "@/components/enterprise";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

function EducationTimelineCard({ record, skillLabel }) {
  return (
    <EnterpriseSurface
      sx={{
        position: "relative",
        pl: 3,
        borderLeft: 3,
        borderColor: "primary.main"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: -14,
          top: 16,
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "grid",
          placeItems: "center"
        }}
      >
        <SchoolOutlinedIcon sx={{ fontSize: 16 }} />
      </Box>

      <Typography variant="subtitle1" fontWeight={700}>
        {record.qualification || record.degree_code || "Qualification"}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {record.institution || record.institution_name || "Institution"}
      </Typography>
      <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
        {record.specialization && (
          <Chip label={record.specialization} size="small" variant="outlined" />
        )}
        {record.year && <Chip label={record.year} size="small" color="primary" />}
        {skillLabel && <Chip label={skillLabel} size="small" variant="filled" />}
      </Stack>
    </EnterpriseSurface>
  );
}

function CandidateEducationPanel({ education = [], masterData }) {
  const sorted = [...education].sort(
    (a, b) => Number(b.year || b.passing_year || 0) - Number(a.year || a.passing_year || 0)
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No education records"
        description="Education timeline cards will appear here once records are added."
      />
    );
  }

  return (
    <Stack spacing={2}>
      {sorted.map((record) => (
        <EducationTimelineCard
          key={record.education_id || record.id}
          record={record}
          skillLabel={
            getPublishedRecords(masterData, "grades").find(
              (item) => item.code === record.grade_code
            )?.name
          }
        />
      ))}
    </Stack>
  );
}

export default CandidateEducationPanel;

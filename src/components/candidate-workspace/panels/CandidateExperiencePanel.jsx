import { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

import { EmptyState, EnterpriseSurface } from "@/components/enterprise";

function ExperienceCompanyCard({ record }) {
  const [expanded, setExpanded] = useState(false);

  const title = record.company_name || record.company || "Company";
  const designation = record.designation || record.role_title || "Role";
  const duration = record.duration
    || [record.start_date, record.end_date || "Present"].filter(Boolean).join(" – ");

  return (
    <EnterpriseSurface padding={false}>
      <Accordion
        expanded={expanded}
        onChange={(_, value) => setExpanded(value)}
        disableGutters
        elevation={0}
        sx={{ bgcolor: "transparent" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <BusinessOutlinedIcon color="primary" />
            <BoxMeta title={title} designation={designation} duration={duration} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            {record.role_summary || record.summary || "Role summary will appear here."}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {(record.technologies || record.technology || "")
              .split(/[,;/|]+/)
              .map((item) => item.trim())
              .filter(Boolean)
              .map((tech) => (
                <Chip key={tech} label={tech} size="small" variant="outlined" />
              ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </EnterpriseSurface>
  );
}

function BoxMeta({ title, designation, duration }) {
  return (
    <Stack minWidth={0}>
      <Typography variant="subtitle1" fontWeight={700} noWrap>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {designation} · {duration || "Duration not set"}
      </Typography>
    </Stack>
  );
}

function CandidateExperiencePanel({ candidate = {}, experience = [] }) {
  const fallbackExperience = experience.length
    ? experience
    : candidate.current_company
      ? [{
          id: "current",
          company_name: candidate.current_company,
          designation: candidate.current_designation,
          duration: candidate.total_experience
            ? `${candidate.total_experience} years total`
            : "",
          role_summary: candidate.remarks,
          technology: candidate.primary_skill
        }]
      : [];

  if (fallbackExperience.length === 0) {
    return (
      <EmptyState
        title="No experience records"
        description="Company cards with expandable role details will appear here."
      />
    );
  }

  return (
    <Stack spacing={2}>
      {fallbackExperience.map((record) => (
        <ExperienceCompanyCard
          key={record.experience_id || record.id || record.company_name}
          record={record}
        />
      ))}
    </Stack>
  );
}

export default CandidateExperiencePanel;

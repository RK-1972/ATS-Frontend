import { Stack, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";

const INTELLIGENCE_SECTIONS = [
  {
    title: "Validation",
    icon: FactCheckOutlinedIcon,
    module: "approvals",
    message:
      "Validation checks will appear here once candidate data is available."
  },
  {
    title: "Duplicate Check",
    icon: ContentCopyOutlinedIcon,
    module: "candidates",
    message:
      "Duplicate screening results will appear here after resume processing."
  },
  {
    title: "AI Insights",
    icon: AutoAwesomeOutlinedIcon,
    module: "team",
    message:
      "AI-generated insights will appear here after resume parsing completes."
  }
];

function CandidateIntakeRightPanel() {
  return (
    <Stack spacing={1.5} sx={{ p: 1.5, minHeight: 0 }}>
      {INTELLIGENCE_SECTIONS.map((section) => (
        <EnterpriseCard key={section.title} title={section.title}>
          <Stack spacing={1.25}>
            <EnterpriseModuleIcon
              icon={section.icon}
              module={section.module}
              density="sm"
            />
            <Typography variant="body2" color="text.secondary">
              {section.message}
            </Typography>
          </Stack>
        </EnterpriseCard>
      ))}
    </Stack>
  );
}

export default CandidateIntakeRightPanel;

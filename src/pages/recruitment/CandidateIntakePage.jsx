import { useEffect, useState } from "react";

import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

import EnterpriseWorkbench from "@/components/enterprise/framework/EnterpriseWorkbench";
import EnterpriseWorkspaceHeader from "@/components/enterprise/framework/EnterpriseWorkspaceHeader";
import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import CandidateIntakeLeftRail from "@/components/recruitment/intake/CandidateIntakeLeftRail";
import CandidateIntakeRightPanel from "@/components/recruitment/intake/CandidateIntakeRightPanel";
import useCandidateIntake from "@/hooks/useCandidateIntake";
import API from "@/api/axios";

const DASHBOARD_KPI_FIELDS = [
  {
    label: "Total Intakes",
    key: "total_intakes",
    Icon: Inventory2OutlinedIcon
  },
  {
    label: "Resume Uploaded",
    key: "uploaded",
    Icon: UploadFileOutlinedIcon
  },
  {
    label: "Resume Parsed",
    key: "parsed",
    Icon: DescriptionOutlinedIcon
  },
  {
    label: "Ready for Review",
    key: "pending_review",
    Icon: FactCheckOutlinedIcon
  },
  {
    label: "Candidate Created",
    key: "candidate_created",
    Icon: PersonAddAltOutlinedIcon
  }
];

const EMPTY_DASHBOARD = {
  total_intakes: 0,
  uploaded: 0,
  parsed: 0,
  pending_review: 0,
  candidate_created: 0
};

const CANDIDATE_DETAIL_FIELDS = [
  { label: "Name", key: "candidate_name", Icon: PersonOutlineOutlinedIcon },
  { label: "Email", key: "email", Icon: MailOutlineOutlinedIcon },
  { label: "Mobile", key: "mobile", Icon: PhoneOutlinedIcon },
  { label: "Experience", key: "experience", Icon: WorkOutlineOutlinedIcon },
  { label: "Education", key: "education", Icon: SchoolOutlinedIcon },
  { label: "Skills", key: "skills", Icon: StarOutlineOutlinedIcon }
];

function getCandidateDetailValue(key, parsedCandidate) {
  if (!parsedCandidate) {
    return null;
  }

  const value = parsedCandidate[key];

  if (key === "skills") {
    return Array.isArray(value) && value.length > 0 ? value : null;
  }

  return value || null;
}

function CandidateIntakeKPIBar({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))`,
          md: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
          lg: `repeat(${Math.min(items.length, 6)}, minmax(0, 1fr))`
        },
        gap: 1.5,
        alignItems: "stretch"
      }}
    >
      {items.map((item, index) => {
        const Icon = item.Icon;

        return (
          <Box
            key={`${item.label}-${index}`}
            sx={{
              minWidth: 0,
              height: "100%",
              display: "flex",
              "& > .MuiPaper-root": {
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column"
              },
              "& > .MuiPaper-root > .MuiBox-root": {
                py: 1,
                flex: 1
              }
            }}
          >
            <EnterpriseCard>
              <Stack spacing={0.5} alignItems="flex-start">
                <Icon fontSize="medium" color="primary" />
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="text.primary"
                  sx={{
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums"
                  }}
                >
                  {item.value ?? "--"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Stack>
            </EnterpriseCard>
          </Box>
        );
      })}
    </Box>
  );
}

function CandidateDetailsCard({ parsedCandidate }) {
  const theme = useTheme();

  return (
    <EnterpriseCard
      title="Candidate Details"
      subtitle="Parsed candidate information"
    >
      <Stack spacing={2.5}>
        {CANDIDATE_DETAIL_FIELDS.map(({ label, key, Icon }) => {
          const value = getCandidateDetailValue(key, parsedCandidate);

          return (
            <Stack key={label}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Icon
                  fontSize="small"
                  sx={{ color: theme.palette.primary.main }}
                />
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Stack>

              <Box sx={{ mt: 1.5 }}>
                {key === "skills" ? (
                  value ? (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {value.map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1" color="text.disabled">
                      --
                    </Typography>
                  )
                ) : (
                  <Typography
                    variant="body1"
                    color={value ? "text.primary" : "text.disabled"}
                    sx={{ fontWeight: value ? 500 : 400 }}
                  >
                    {value || "--"}
                  </Typography>
                )}
              </Box>
            </Stack>
          );
        })}
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1.5 }}
      >
        Candidate information will be populated after resume parsing.
      </Typography>
    </EnterpriseCard>
  );
}

function CandidateIntakeMainWorkspace({
  parsedCandidate,
  resumeFile,
  intakeStatus
}) {
  const [resumeUrl, setResumeUrl] = useState("");

  const shouldShowResumePreview =
    Boolean(resumeFile) &&
    (intakeStatus === "RESUME_UPLOADED" || intakeStatus === "COMPLETED");

  useEffect(() => {
    if (!shouldShowResumePreview) {
      setResumeUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(resumeFile);

    setResumeUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [resumeFile, shouldShowResumePreview]);

  return (
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      <EnterpriseCard
        title="Resume Preview"
        subtitle="Uploaded resume preview"
      >
        <Box
          sx={{
            minHeight: 320,
            height: 320,
            display: "flex",
            alignItems: shouldShowResumePreview && resumeUrl ? "stretch" : "center",
            justifyContent: shouldShowResumePreview && resumeUrl ? "stretch" : "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            overflow: "hidden"
          }}
        >
          {shouldShowResumePreview && resumeUrl ? (
            <iframe
              src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title="Resume Preview"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block"
              }}
            />
          ) : (
            <Stack
              spacing={1}
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              sx={{ px: 2 }}
            >
              <PictureAsPdfOutlinedIcon
                sx={{ fontSize: 64, color: "text.disabled" }}
              />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                No Resume Selected
              </Typography>
              <Typography variant="body2" color="text.secondary" maxWidth={360}>
                Upload a resume from the Intake Panel to begin candidate processing.
              </Typography>
            </Stack>
          )}
        </Box>
      </EnterpriseCard>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={8}>
          <CandidateDetailsCard parsedCandidate={parsedCandidate} />
        </Grid>

        <Grid item xs={12} md={4}>
          <EnterpriseCard
            title="Intake Activity"
            subtitle="Recent intake events"
          >
            <Box sx={{ minHeight: 320 }}>
              <Typography variant="body2" color="text.secondary">
                Intake activity timeline will appear here.
              </Typography>
            </Box>
          </EnterpriseCard>
        </Grid>
      </Grid>
    </Stack>
  );
}

function CandidateIntakePage() {
  const [selectedSource, setSelectedSource] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [intakeId, setIntakeId] = useState(null);
  const [intakeStatus, setIntakeStatus] = useState("NEW");
  const [parsingStatus, setParsingStatus] = useState("PENDING");
  const [extractedText, setExtractedText] = useState("");
  const [parsedCandidate, setParsedCandidate] = useState(null);
  const [intakeSessionKey, setIntakeSessionKey] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const { createCandidateIntake, processResume, parseResume } = useCandidateIntake();

  const loadDashboard = async () => {
    setDashboardLoading(true);

    try {
      const response = await API.get("/candidate-intake/dashboard");
      const dashboardData = response?.data?.dashboard;

      if (response?.data?.success === false || !dashboardData) {
        setDashboard(EMPTY_DASHBOARD);
        return;
      }

      setDashboard({
        total_intakes: dashboardData.total_intakes ?? 0,
        uploaded: dashboardData.uploaded ?? 0,
        parsed: dashboardData.parsed ?? 0,
        pending_review: dashboardData.pending_review ?? 0,
        candidate_created: dashboardData.candidate_created ?? 0
      });
    } catch {
      setDashboard(EMPTY_DASHBOARD);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const kpiItems = DASHBOARD_KPI_FIELDS.map(({ label, key, Icon }) => ({
    label,
    Icon,
    value: dashboardLoading ? "--" : dashboard[key]
  }));

  const resetIntakeSession = () => {
    setIntakeId(null);
    setIntakeStatus("NEW");
    setParsingStatus("PENDING");
    setExtractedText("");
    setParsedCandidate(null);
    setIntakeSessionKey((currentKey) => currentKey + 1);
  };

  const handleResumeFileSelect = (file) => {
    setResumeFile(file);
    resetIntakeSession();
  };

  const handleCreateIntake = async () => {
    const response = await createCandidateIntake({
      source_id: selectedSource,
      original_file_name: resumeFile.name
    });

    setIntakeId(response.intake_id);
    setIntakeStatus("INTAKE_CREATED");
    loadDashboard();
  };

  const handleProcessResume = async () => {
    const response = await processResume(intakeId, resumeFile);

    setIntakeStatus(response.intake_status);
    loadDashboard();
  };

  const handleParseResume = async () => {
    const response = await parseResume(intakeId);

    setParsingStatus(response.parsing_status);
    setExtractedText(response.extracted_text);
    setParsedCandidate(response.parsed_candidate);
    loadDashboard();
  };

  console.log({
    intakeId,
    intakeStatus
  });

  return (
    <EnterpriseWorkbench
      header={
        <EnterpriseWorkspaceHeader
          title="Enterprise Candidate Intake"
          subtitle="Create and process candidates from all intake channels."
          breadcrumbs={[
            { label: "Dashboard" },
            { label: "Recruitment" },
            { label: "Candidate Intake" }
          ]}
        />
      }
      kpis={<CandidateIntakeKPIBar items={kpiItems} />}
      leftRail={
        <CandidateIntakeLeftRail
          key={intakeSessionKey}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          resumeFile={resumeFile}
          onFileSelect={handleResumeFileSelect}
          onCreateIntake={handleCreateIntake}
          intakeId={intakeId}
          intakeStatus={intakeStatus}
          onProcessResume={handleProcessResume}
          onParseResume={handleParseResume}
        />
      }
      rightPanel={<CandidateIntakeRightPanel key={intakeSessionKey} />}
      main={
        <CandidateIntakeMainWorkspace
          key={intakeSessionKey}
          parsedCandidate={parsedCandidate}
          resumeFile={resumeFile}
          intakeStatus={intakeStatus}
        />
      }
    />
  );
}

export default CandidateIntakePage;

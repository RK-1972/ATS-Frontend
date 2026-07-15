import { useState } from "react";
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseFileUploadCard from "@/components/enterprise/EnterpriseFileUploadCard";
import useCandidateSources from "@/hooks/useCandidateSources";

function CandidateIntakeLeftRail({
  selectedSource = "",
  onSourceChange,
  resumeFile = null,
  onFileSelect,
  onCreateIntake,
  onProcessResume,
  onParseResume,
  intakeId = null,
  intakeStatus = "NEW"
}) {
  const { candidateSources, loading } = useCandidateSources();
  const [resumeParseCompleted, setResumeParseCompleted] = useState(false);

  const workflowStatuses = [
    "NEW",
    "INTAKE_CREATED",
    "RESUME_UPLOADED",
    "RESUME_PARSED",
    "CANDIDATE_CREATED"
  ];

  const isStatusAtLeast = (targetStatus) => {
    const currentIndex = workflowStatuses.indexOf(intakeStatus);
    const targetIndex = workflowStatuses.indexOf(targetStatus);

    return currentIndex >= targetIndex && targetIndex !== -1;
  };

  const intakeSteps = [
    {
      label: "Source Selected",
      icon: SourceOutlinedIcon,
      completed: Boolean(selectedSource)
    },
    {
      label: "Resume Selected",
      icon: DescriptionOutlinedIcon,
      completed: Boolean(resumeFile)
    },
    {
      label: "Intake Created",
      icon: PlaylistAddCheckOutlinedIcon,
      completed: isStatusAtLeast("INTAKE_CREATED")
    },
    {
      label: "Resume Uploaded",
      icon: CloudUploadOutlinedIcon,
      completed: isStatusAtLeast("RESUME_UPLOADED")
    },
    {
      label: "Resume Parsed",
      icon: AutoFixHighOutlinedIcon,
      completed: isStatusAtLeast("RESUME_PARSED")
    },
    {
      label: "Candidate Created",
      icon: PersonAddOutlinedIcon,
      completed: isStatusAtLeast("CANDIDATE_CREATED")
    }
  ];

  const canCreateIntake =
    Boolean(selectedSource) &&
    Boolean(resumeFile) &&
    intakeStatus === "NEW";

  const createIntakeLabel =
    intakeStatus !== "NEW" ? "Intake Created" : "Create Intake";

  const isResumeParsed =
    intakeStatus === "COMPLETED" || resumeParseCompleted;

  const canParseResume =
    intakeStatus === "RESUME_UPLOADED" && !isResumeParsed;

  const parseResumeLabel =
    isResumeParsed ? "Resume Parsed" : "Parse Resume";

  const handleParseResume = async () => {
    try {
      await onParseResume();
      setResumeParseCompleted(true);
    } catch {
      // Keep the button enabled when parsing fails.
    }
  };

  return (
    <Stack spacing={1.5} sx={{ p: 1.5, minHeight: 0 }}>
      <EnterpriseCard title="Candidate Source">
        <FormControl fullWidth size="small" disabled={loading}>
          <InputLabel id="candidate-intake-source-label">
            Source
          </InputLabel>
          <Select
            labelId="candidate-intake-source-label"
            label="Source"
            value={selectedSource}
            onChange={(event) => onSourceChange(event.target.value)}
          >
            {candidateSources.map((source) => (
              <MenuItem
                key={source.source_id}
                value={source.source_id}
              >
                {source.source_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </EnterpriseCard>

      <EnterpriseFileUploadCard
        title="Resume Upload"
        subtitle="Upload candidate resume"
        file={resumeFile}
        accept=".pdf,.doc,.docx"
        maxFileSizeMB={5}
        helperText="PDF, DOC, DOCX"
        disabled={!selectedSource}
        onFileSelect={onFileSelect}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={!canCreateIntake}
        onClick={onCreateIntake}
      >
        {createIntakeLabel}
      </Button>

      <EnterpriseCard title="Intake Progress">
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pb: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Intake ID
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {intakeId
                ? `INT-${String(intakeId).padStart(5, "0")}`
                : "Not Created"}
            </Typography>
          </Stack>

          {intakeSteps.map((step) => {
            const StepIcon = step.icon;

            return (
              <Stack
                key={step.label}
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <StepIcon
                  fontSize="small"
                  color={step.completed ? "success" : "disabled"}
                />
                <Chip
                  label={step.label}
                  size="small"
                  color={step.completed ? "success" : "default"}
                  variant={step.completed ? "filled" : "outlined"}
                  sx={{ flex: 1, justifyContent: "flex-start" }}
                />
              </Stack>
            );
          })}
        </Stack>
      </EnterpriseCard>

      <Button
        variant="contained"
        fullWidth
        disabled={intakeStatus !== "INTAKE_CREATED"}
        onClick={onProcessResume}
      >
        Process Resume
      </Button>

      <Button
        variant="contained"
        fullWidth
        disabled={!canParseResume}
        onClick={handleParseResume}
      >
        {parseResumeLabel}
      </Button>
    </Stack>
  );
}

export default CandidateIntakeLeftRail;

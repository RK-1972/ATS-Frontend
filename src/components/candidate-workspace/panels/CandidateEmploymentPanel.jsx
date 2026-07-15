import { useState } from "react";

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import CandidateEditableCard from "../CandidateEditableCard";
import CandidateEmSelect from "../CandidateEmSelect";

const WORK_MODE_OPTIONS = ["Remote", "Hybrid", "Office", "Flexible"];

const PERIOD_OPTIONS = [
  "Immediate",
  "15 Days",
  "30 Days",
  "45 Days",
  "60 Days",
  "90 Days"
];

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return value;
}

function displayExperience(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return `${value} yrs`;
}

function noticePeriodToOption(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "string" && PERIOD_OPTIONS.includes(value)) {
    return value;
  }

  const days = Number(value);

  if (Number.isNaN(days)) {
    return String(value);
  }

  if (days === 0) {
    return "Immediate";
  }

  const label = `${days} Days`;
  return PERIOD_OPTIONS.includes(label) ? label : String(value);
}

function noticePeriodFromOption(option) {
  if (!option) {
    return null;
  }

  if (option === "Immediate") {
    return 0;
  }

  const match = String(option).match(/^(\d+)/);
  return match ? Number(match[1]) : option;
}

function displayNoticePeriod(value) {
  const option = noticePeriodToOption(value);
  return option || "--";
}

function displayNegotiable(value) {
  if (value === true || value === "true" || value === "Yes") {
    return "Yes";
  }

  if (value === false || value === "false" || value === "No") {
    return "No";
  }

  return "--";
}

function FieldBlock({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

function ValueText({ children }) {
  return (
    <Typography variant="body2" fontWeight={500}>
      {children}
    </Typography>
  );
}

function CardTitle({ icon, label }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" component="span">
      {icon}
      <Box component="span">{label}</Box>
    </Stack>
  );
}

function MasterValue({ label, entityType, masterData, value, fallbackLabel }) {
  if (fallbackLabel && fallbackLabel !== "—" && fallbackLabel !== "--") {
    return <ValueText>{fallbackLabel}</ValueText>;
  }

  if (!value) {
    return <ValueText>--</ValueText>;
  }

  return (
    <CandidateEmSelect
      label={label}
      entityType={entityType}
      masterData={masterData}
      value={value}
    />
  );
}

function OptionSelect({
  label,
  value,
  options,
  onChange
}) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value || ""}
        onChange={onChange}
      >
        <MenuItem value="">
          <em>Select {label}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function CandidateEmploymentPanel({
  candidate = {},
  masterData,
  masterLabels = {},
  onSave,
  isSaving = false
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [draft, setDraft] = useState({});

  const startEdit = (cardKey) => {
    setEditingCard(cardKey);
    setDraft({
      ...candidate,
      employment_type:
        candidate.employment_type ||
        candidate.employment_type_code ||
        candidate.preferred_employment_type ||
        "",
      preferred_work_mode: candidate.preferred_work_mode || "",
      current_designation: candidate.current_designation || "",
      current_department: candidate.current_department || "",
      notice_period: noticePeriodToOption(candidate.notice_period),
      availability: candidate.availability || "",
      currency_code: candidate.currency_code || "",
      ctc_negotiable:
        candidate.ctc_negotiable === true
          ? "Yes"
          : candidate.ctc_negotiable === false
            ? "No"
            : ""
    });
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setDraft({});
  };

  const saveCard = async (fields) => {
    const payload = fields.reduce((acc, field) => {
      let value = draft[field];

      if (field === "notice_period") {
        value = noticePeriodFromOption(draft.notice_period);
      }

      if (field === "ctc_negotiable") {
        if (draft.ctc_negotiable === "Yes") {
          value = true;
        } else if (draft.ctc_negotiable === "No") {
          value = false;
        } else {
          value = null;
        }
      }

      acc[field] = value;
      return acc;
    }, {});

    await onSave?.(payload);
    setEditingCard(null);
    setDraft({});
  };

  return (
    <Stack spacing={2}>
      <CandidateEditableCard
        title={
          <CardTitle
            icon={<WorkOutlineOutlinedIcon color="primary" sx={{ fontSize: 20 }} />}
            label="Professional Summary"
          />
        }
        isEditing={editingCard === "summary"}
        isSaving={isSaving}
        onEdit={() => startEdit("summary")}
        onCancel={cancelEdit}
        onSave={() =>
          saveCard([
            "total_experience",
            "relevant_experience",
            "primary_skill",
            "employment_type",
            "preferred_work_mode"
          ])
        }
        editContent={
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Total Experience"
                value={draft.total_experience ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, total_experience: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Relevant Experience"
                value={draft.relevant_experience ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    relevant_experience: e.target.value
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Primary Skill"
                value={draft.primary_skill || ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, primary_skill: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CandidateEmSelect
                label="Employment Type"
                entityType="employment_types"
                masterData={masterData}
                value={draft.employment_type || ""}
                readOnly={false}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, employment_type: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OptionSelect
                label="Preferred Work Mode"
                value={draft.preferred_work_mode}
                options={WORK_MODE_OPTIONS}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    preferred_work_mode: e.target.value
                  }))
                }
              />
            </Grid>
          </Grid>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Total Experience">
              <ValueText>{displayExperience(candidate.total_experience)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Relevant Experience">
              <ValueText>{displayExperience(candidate.relevant_experience)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Primary Skill">
              <ValueText>{displayValue(candidate.primary_skill)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Employment Type">
              <MasterValue
                label="Employment Type"
                entityType="employment_types"
                masterData={masterData}
                value={
                  candidate.employment_type ||
                  candidate.employment_type_code ||
                  candidate.preferred_employment_type ||
                  ""
                }
                fallbackLabel={masterLabels.employmentType}
              />
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Preferred Work Mode">
              <ValueText>{displayValue(candidate.preferred_work_mode)}</ValueText>
            </FieldBlock>
          </Grid>
        </Grid>
      </CandidateEditableCard>

      <CandidateEditableCard
        title={
          <CardTitle
            icon={<BusinessOutlinedIcon color="primary" sx={{ fontSize: 20 }} />}
            label="Current Employment"
          />
        }
        isEditing={editingCard === "employment"}
        isSaving={isSaving}
        onEdit={() => startEdit("employment")}
        onCancel={cancelEdit}
        onSave={() =>
          saveCard([
            "current_company",
            "current_designation",
            "current_department",
            "notice_period",
            "availability"
          ])
        }
        editContent={
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Current Company"
                value={draft.current_company || ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, current_company: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Current Designation"
                value={draft.current_designation || ""}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    current_designation: e.target.value
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CandidateEmSelect
                label="Department"
                entityType="departments"
                masterData={masterData}
                value={draft.current_department || ""}
                readOnly={false}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    current_department: e.target.value
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OptionSelect
                label="Notice Period"
                value={draft.notice_period}
                options={PERIOD_OPTIONS}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, notice_period: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OptionSelect
                label="Availability"
                value={draft.availability}
                options={PERIOD_OPTIONS}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, availability: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Current Company">
              <ValueText>{displayValue(candidate.current_company)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Current Designation">
              <ValueText>{displayValue(candidate.current_designation)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Department">
              <MasterValue
                label="Department"
                entityType="departments"
                masterData={masterData}
                value={candidate.current_department || ""}
              />
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Notice Period">
              <ValueText>{displayNoticePeriod(candidate.notice_period)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Availability">
              <ValueText>{displayValue(candidate.availability)}</ValueText>
            </FieldBlock>
          </Grid>
        </Grid>
      </CandidateEditableCard>

      <CandidateEditableCard
        title={
          <CardTitle
            icon={<PaymentsOutlinedIcon color="primary" sx={{ fontSize: 20 }} />}
            label="Compensation"
          />
        }
        isEditing={editingCard === "compensation"}
        isSaving={isSaving}
        onEdit={() => startEdit("compensation")}
        onCancel={cancelEdit}
        onSave={() =>
          saveCard([
            "currency_code",
            "current_ctc",
            "expected_ctc",
            "ctc_negotiable"
          ])
        }
        editContent={
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CandidateEmSelect
                label="Currency"
                entityType="currencies"
                masterData={masterData}
                value={draft.currency_code || ""}
                readOnly={false}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, currency_code: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Current Annual CTC"
                value={draft.current_ctc ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, current_ctc: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Expected Annual CTC"
                value={draft.expected_ctc ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, expected_ctc: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OptionSelect
                label="Negotiable"
                value={draft.ctc_negotiable}
                options={["Yes", "No"]}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, ctc_negotiable: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Currency">
              <MasterValue
                label="Currency"
                entityType="currencies"
                masterData={masterData}
                value={candidate.currency_code || ""}
                fallbackLabel={masterLabels.currency}
              />
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Current Annual CTC">
              <ValueText>{displayValue(candidate.current_ctc)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Expected Annual CTC">
              <ValueText>{displayValue(candidate.expected_ctc)}</ValueText>
            </FieldBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <FieldBlock label="Negotiable">
              <ValueText>{displayNegotiable(candidate.ctc_negotiable)}</ValueText>
            </FieldBlock>
          </Grid>
        </Grid>
      </CandidateEditableCard>
    </Stack>
  );
}

export default CandidateEmploymentPanel;

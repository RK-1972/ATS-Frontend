import { findMasterRecord } from "@/enterprise/masterDataHelpers";

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function sectionPercent(fields, candidate, documents = [], skillRecords = []) {
  if (!fields.length) {
    return 0;
  }

  let filled = 0;

  fields.forEach((field) => {
    if (field === "__skills__") {
      if (
        hasValue(candidate.primary_skill)
        || hasValue(candidate.secondary_skill)
        || skillRecords.length > 0
      ) {
        filled += 1;
      }
      return;
    }

    if (field === "__documents__") {
      if (hasValue(candidate.resume_path) || hasValue(candidate.pan_number) || documents.length > 0) {
        filled += 1;
      }
      return;
    }

    if (hasValue(candidate[field])) {
      filled += 1;
    }
  });

  return filled / fields.length;
}

const COMPLETION_SECTIONS = [
  {
    key: "basic",
    label: "Basic Information",
    weight: 20,
    fields: ["first_name", "last_name", "candidate_status"]
  },
  {
    key: "contact",
    label: "Contact",
    weight: 20,
    fields: ["email_id", "mobile_number", "linkedin_url"]
  },
  {
    key: "employment",
    label: "Employment",
    weight: 20,
    fields: ["current_company", "total_experience", "current_location", "notice_period"]
  },
  {
    key: "skills",
    label: "Skills",
    weight: 20,
    fields: ["__skills__"]
  },
  {
    key: "documents",
    label: "Documents",
    weight: 20,
    fields: ["__documents__"]
  }
];

export function calculateProfileCompletionBreakdown(
  candidate = {},
  documents = [],
  skillRecords = []
) {
  const sections = COMPLETION_SECTIONS.map((section) => {
    const ratio = sectionPercent(section.fields, candidate, documents, skillRecords);
    const percent = Math.round(ratio * section.weight);

    return {
      ...section,
      percent,
      complete: ratio >= 1
    };
  });

  const total = sections.reduce((sum, section) => sum + section.percent, 0);

  return {
    total: Math.min(100, total),
    sections
  };
}

export function calculateProfileCompletion(candidate = {}, documents = [], skillRecords = []) {
  return calculateProfileCompletionBreakdown(candidate, documents, skillRecords).total;
}

export function getCandidateDisplayName(candidate = {}) {
  const parts = [candidate.first_name, candidate.middle_name, candidate.last_name]
    .filter(Boolean);

  return parts.join(" ") || candidate.preferred_name || "Unnamed Candidate";
}

export function splitPersonIdentity(name, id) {
  const cleanedName = String(name || "").trim();
  const cleanedId = String(id || "").trim();

  if (cleanedName && cleanedId) {
    if (cleanedName === cleanedId) {
      return { primary: cleanedName, secondary: null };
    }

    return { primary: cleanedName, secondary: cleanedId };
  }

  if (cleanedName) {
    return { primary: cleanedName, secondary: null };
  }

  if (cleanedId) {
    return { primary: cleanedId, secondary: null };
  }

  return { primary: null, secondary: null };
}

export function formatPersonIdentity(name, id) {
  const { primary, secondary } = splitPersonIdentity(name, id);

  if (primary && secondary) {
    return `${primary} (${secondary})`;
  }

  if (primary) {
    return primary;
  }

  return "—";
}

export function formatCandidateIdentity(candidate = {}) {
  const id = candidate.candidate_code || candidate.candidate_id;
  return formatPersonIdentity(getCandidateDisplayName(candidate), id);
}

export function parseSkillChips(candidate = {}, skillRecords = []) {
  const chips = new Set();

  [candidate.primary_skill, candidate.secondary_skill].forEach((value) => {
    if (!value) {
      return;
    }

    String(value)
      .split(/[,;/|]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => chips.add(item));
  });

  skillRecords.forEach((row) => {
    if (row.skill_code) {
      chips.add(row.skill_name || row.skill_code);
    }
  });

  return Array.from(chips).slice(0, 8);
}

export function mapSkillMapRowToUi(row = {}, skillNameByCode = new Map()) {
  const skillCode = row.skill_code || "";

  return {
    id: String(row.skill_map_id ?? row.id ?? ""),
    skill_map_id: row.skill_map_id,
    skill_code: skillCode,
    skill_name: skillNameByCode.get(skillCode) || skillCode,
    years: row.experience_years ?? "",
    months: row.experience_months ?? "",
    proficiency_code: row.proficiency || "",
    last_used_on: row.last_used
      ? String(row.last_used).slice(0, 10)
      : ""
  };
}

export function parseSkillsFromSkillMapRows(rows = [], skillNameByCode = new Map()) {
  return rows
    .filter((row) => row.skill_code)
    .map((row) => mapSkillMapRowToUi(row, skillNameByCode));
}

export function validateSkillExperienceYears(value) {
  if (value === "" || value === null || value === undefined) {
    return { valid: true, error: "" };
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      return {
        valid: false,
        error: "Enter a whole number greater than or equal to 0."
      };
    }

    return { valid: true, error: "" };
  }

  const trimmed = String(value).trim();

  if (!/^\d+$/.test(trimmed)) {
    return {
      valid: false,
      error: "Enter a whole number greater than or equal to 0."
    };
  }

  return { valid: true, error: "" };
}

export function validateSkillExperienceMonths(value) {
  if (value === "" || value === null || value === undefined) {
    return { valid: true, error: "" };
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0 || value > 11) {
      return {
        valid: false,
        error: "Enter a whole number from 0 to 11."
      };
    }

    return { valid: true, error: "" };
  }

  const trimmed = String(value).trim();

  if (!/^\d+$/.test(trimmed)) {
    return {
      valid: false,
      error: "Enter a whole number from 0 to 11."
    };
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (parsed > 11) {
    return {
      valid: false,
      error: "Months must be 11 or less."
    };
  }

  return { valid: true, error: "" };
}

export function buildSkillMapApiPayload(form = {}) {
  const payload = {
    skill_code: form.skill_code
  };

  const yearsValidation = validateSkillExperienceYears(form.years);
  const monthsValidation = validateSkillExperienceMonths(form.months);

  if (!yearsValidation.valid) {
    throw new Error(yearsValidation.error);
  }

  if (!monthsValidation.valid) {
    throw new Error(monthsValidation.error);
  }

  if (form.years !== undefined && form.years !== "") {
    payload.experience_years = Number.parseInt(String(form.years).trim(), 10);
  } else {
    payload.experience_years = 0;
  }

  if (form.months !== undefined && form.months !== "") {
    payload.experience_months = Number.parseInt(String(form.months).trim(), 10);
  } else {
    payload.experience_months = 0;
  }

  payload.proficiency = form.proficiency_code ? String(form.proficiency_code).trim() : null;
  payload.last_used = form.last_used_on ? String(form.last_used_on).trim() : null;

  return payload;
}

export function parseSkillsFromCandidate(candidate = {}, skillNameByCode = new Map()) {
  const rows = [];
  const seen = new Set();

  [candidate.primary_skill, candidate.secondary_skill].forEach((value, index) => {
    if (!value) {
      return;
    }

    String(value)
      .split(/[,;/|]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const key = item.toLowerCase();
        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        rows.push({
          id: `skill-${index}-${key}`,
          skill_code: item,
          skill_name: skillNameByCode.get(item) || item,
          years: candidate.total_experience || "",
          months: "",
          proficiency_code: "",
          last_used_on: candidate.updated_on || ""
        });
      });
  });

  return rows;
}

export function mergeCandidateWorkspaceSkills(
  candidate = {},
  structuredSkillRows = [],
  skillNameByCode = new Map()
) {
  if (!structuredSkillRows.length) {
    return parseSkillsFromCandidate(candidate, skillNameByCode);
  }

  const baselineRows = parseSkillsFromCandidate(candidate, skillNameByCode);
  const structuredRows = parseSkillsFromSkillMapRows(
    structuredSkillRows,
    skillNameByCode
  );

  const merged = [];
  const seen = new Set();

  const addRow = (row) => {
    const codeKey = String(row.skill_code || row.skill_name || "")
      .trim()
      .toLowerCase();
    const nameKey = String(row.skill_name || row.skill_code || "")
      .trim()
      .toLowerCase();
    const dedupeKey = codeKey || nameKey;

    if (!dedupeKey || seen.has(dedupeKey)) {
      return;
    }

    seen.add(dedupeKey);
    merged.push(row);
  };

  baselineRows.forEach(addRow);
  structuredRows.forEach(addRow);

  return merged;
}

export function skillsToPrimaryString(skills = []) {
  return skills
    .map((row) => row.skill_name || row.skill_code)
    .filter(Boolean)
    .join(", ");
}

export function resolveMasterLabel(masterData, entityType, code) {
  if (!code) {
    return "—";
  }

  const record = findMasterRecord(masterData, entityType, code);
  return record?.name || code;
}

export function mapPipelineHistoryToTimelineEvents(historyRows = []) {
  const EVENT_LABELS = {
    CandidateMapped: "Mapped to Requisition",
    StageChanged: "Pipeline Stage Updated",
    CandidateRejected: "Candidate Rejected",
    CandidateShortlisted: "Candidate Shortlisted",
    CandidateReleased: "Released from Requisition",
    ReturnedToTalentPool: "Returned to Talent Pool"
  };

  const EVENT_ICONS = {
    CandidateMapped: "link",
    StageChanged: "timeline",
    CandidateRejected: "timeline",
    CandidateShortlisted: "timeline",
    CandidateReleased: "link",
    ReturnedToTalentPool: "link"
  };

  const EVENT_TONES = {
    CandidateMapped: "success",
    StageChanged: "warning",
    CandidateRejected: "warning",
    CandidateShortlisted: "success",
    CandidateReleased: "info",
    ReturnedToTalentPool: "info"
  };

  return historyRows.map((row) => {
    const eventType = row.event_type || "StageChanged";
    const toStage = row.to_stage || "";
    const fromStage = row.from_stage || "";
    let description = row.comments || "";

    if (eventType === "CandidateMapped") {
      description =
        description ||
        `Requisition ${row.requisition_code || "—"} · Stage ${toStage || "Applied"}`;
    } else if (fromStage && toStage) {
      description = description || `${fromStage} → ${toStage}`;
    } else if (toStage) {
      description = description || toStage;
    } else if (!description) {
      description = EVENT_LABELS[eventType] || eventType;
    }

    return {
      id: `history-${row.history_id}`,
      type: EVENT_LABELS[eventType] || eventType,
      description,
      date: row.created_on,
      tone: EVENT_TONES[eventType] || "info",
      icon: EVENT_ICONS[eventType] || "timeline",
      user: row.actor || "System",
      source: "pipeline_history"
    };
  });
}

export function buildTimelineEvents(
  candidate = {},
  mapping = {},
  pipelineHistory = []
) {
  const events = [];
  const actor = candidate.created_by || candidate.recruiter_id || "System";
  const hasPipelineHistory = Array.isArray(pipelineHistory) && pipelineHistory.length > 0;

  if (candidate.created_on) {
    events.push({
      id: "created",
      type: "Candidate Created",
      description: `Profile registered as ${candidate.candidate_code || "new candidate"}`,
      date: candidate.created_on,
      tone: "primary",
      icon: "person_add",
      user: actor
    });
  }

  if (candidate.resume_path) {
    events.push({
      id: "resume",
      type: "Resume Uploaded",
      description: "Resume document attached to candidate profile",
      date: candidate.resume_uploaded_on || candidate.updated_on || candidate.created_on,
      tone: "info",
      icon: "upload_file",
      user: actor
    });
  }

  if (hasPipelineHistory) {
    events.push(...mapPipelineHistoryToTimelineEvents(pipelineHistory));
  } else {
    if (mapping?.map_id || mapping?.req_id) {
      events.push({
        id: "mapped",
        type: "Mapped to Requisition",
        description: `Requisition ${mapping.req_id || "—"} · Stage ${mapping.stage_name || "Applied"}`,
        date: mapping.applied_date || candidate.updated_on || candidate.created_on,
        tone: "success",
        icon: "link",
        user: mapping.recruiter_id || actor
      });
    }

    if (mapping?.stage_name && mapping.stage_name !== "Applied") {
      events.push({
        id: "stage",
        type: "Pipeline Stage Updated",
        description: mapping.stage_name,
        date: candidate.updated_on || candidate.created_on,
        tone: "warning",
        icon: "timeline",
        user: actor
      });
    }
  }

  if (candidate.updated_on && candidate.updated_on !== candidate.created_on) {
    events.push({
      id: "updated",
      type: "Profile Updated",
      description: "Candidate profile details were updated",
      date: candidate.updated_on,
      tone: "info",
      icon: "edit",
      user: actor
    });
  }

  return events.sort((a, b) => {
    if (!a.date) {
      return 1;
    }
    if (!b.date) {
      return -1;
    }
    return new Date(b.date) - new Date(a.date);
  });
}

export function formatExperience(value) {
  if (value == null || value === "") {
    return "—";
  }

  const years = Number(value);
  if (Number.isNaN(years)) {
    return String(value);
  }

  return `${years} yr${years === 1 ? "" : "s"}`;
}

export const WORKSPACE_TABS = [
  { key: "overview", label: "Overview" },
  { key: "personal", label: "Personal" },
  { key: "employment", label: "Employment" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Experience" },
  { key: "documents", label: "Documents" },
  { key: "notes", label: "Notes" },
  { key: "timeline", label: "Timeline" }
];

export default {
  calculateProfileCompletionBreakdown,
  calculateProfileCompletion,
  getCandidateDisplayName,
  formatPersonIdentity,
  splitPersonIdentity,
  formatCandidateIdentity,
  parseSkillChips,
  parseSkillsFromCandidate,
  mergeCandidateWorkspaceSkills,
  parseSkillsFromSkillMapRows,
  mapSkillMapRowToUi,
  validateSkillExperienceYears,
  validateSkillExperienceMonths,
  buildSkillMapApiPayload,
  skillsToPrimaryString,
  resolveMasterLabel,
  mapPipelineHistoryToTimelineEvents,
  buildTimelineEvents,
  formatExperience,
  WORKSPACE_TABS
};

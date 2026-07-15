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

export function buildTimelineEvents(candidate = {}, mapping = {}) {
  const events = [];
  const actor = candidate.created_by || candidate.recruiter_id || "System";

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
  parseSkillChips,
  parseSkillsFromCandidate,
  skillsToPrimaryString,
  resolveMasterLabel,
  buildTimelineEvents,
  formatExperience,
  WORKSPACE_TABS
};

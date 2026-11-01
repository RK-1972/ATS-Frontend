import { meetsOtiRecommendationThreshold } from "./otiRecommendationPolicy";

export const INTERNAL_SOURCE_BUCKETS = Object.freeze({
  TALENT_POOL: "talent_pool",
  HISTORICAL: "historical",
  RESUME_INDEX: "resume_index",
  MIXED: "mixed"
});

export function normalizeInternalSourceBucket(sourceType) {
  const value = String(sourceType || "").toLowerCase();

  if (value === "historical") {
    return INTERNAL_SOURCE_BUCKETS.HISTORICAL;
  }

  if (value.includes("resume") || value.includes("index") || value.includes("semantic")) {
    return value.includes("talent") || value.includes("+") ? INTERNAL_SOURCE_BUCKETS.MIXED : INTERNAL_SOURCE_BUCKETS.RESUME_INDEX;
  }

  return INTERNAL_SOURCE_BUCKETS.TALENT_POOL;
}

export function getLatestRecruiterAction(recruiterActions = []) {
  if (!recruiterActions?.length) {
    return null;
  }

  return recruiterActions[0];
}

export function filterInternalResults(rows, filters = {}) {
  const minMatch = Number(filters.minMatchPct);
  const maxMatch = Number(filters.maxMatchPct);
  const skillQuery = String(filters.skillQuery || "")
    .trim()
    .toLowerCase();
  const sourceBucket = filters.sourceBucket || "all";
  const actionStatus = filters.actionStatus || "all";
  const minExperience = filters.minExperience === "" ? null : Number(filters.minExperience);
  const maxExperience = filters.maxExperience === "" ? null : Number(filters.maxExperience);

  return (rows || []).filter((row) => {
    if (!meetsOtiRecommendationThreshold(row)) {
      return false;
    }

    const matchPct = Number(row.match_pct) || 0;
    if (Number.isFinite(minMatch) && matchPct < minMatch) {
      return false;
    }
    if (Number.isFinite(maxMatch) && matchPct > maxMatch) {
      return false;
    }

    const bucket = normalizeInternalSourceBucket(row.source_type);
    if (sourceBucket !== "all" && bucket !== sourceBucket) {
      return false;
    }

    const experience = Number(row.total_experience);
    if (minExperience !== null && Number.isFinite(minExperience) && experience < minExperience) {
      return false;
    }
    if (maxExperience !== null && Number.isFinite(maxExperience) && experience > maxExperience) {
      return false;
    }

    if (skillQuery) {
      const skillHaystack = [
        ...(row.matched_skills || []),
        ...(row.missing_skills || []),
        ...(row.explanation?.resume_extracted_skills || [])
      ]
        .map((skill) => String(skill?.name || skill?.code || skill || "").toLowerCase())
        .join(" ");

      if (!skillHaystack.includes(skillQuery)) {
        return false;
      }
    }

    const latestAction = getLatestRecruiterAction(row.recruiter_actions);
    if (actionStatus !== "all") {
      if (actionStatus === "none" && latestAction) {
        return false;
      }
      if (actionStatus !== "none" && latestAction?.action_type !== actionStatus) {
        return false;
      }
    }

    return true;
  });
}

export function normalizeExternalLeadRow(row) {
  if (!row || typeof row !== "object") {
    return row;
  }

  let matchExplanation = row.match_explanation;
  if (typeof matchExplanation === "string") {
    try {
      matchExplanation = JSON.parse(matchExplanation);
    } catch {
      matchExplanation = {};
    }
  }

  return {
    ...row,
    match_explanation: matchExplanation && typeof matchExplanation === "object" ? matchExplanation : {},
    match_score: Number(row.match_score) || 0
  };
}

export function filterExternalLeads(rows, filters = {}) {
  const minMatchRaw = filters.minMatchPct;
  const minMatch =
    minMatchRaw === "" || minMatchRaw === null || minMatchRaw === undefined
      ? null
      : Number(minMatchRaw);
  const provider = filters.providerKey || "all";
  const importStatus = filters.importStatus || "all";
  const retrievalStatus = filters.retrievalStatus || "all";

  return (rows || []).map(normalizeExternalLeadRow).filter((row) => {
    const scorePct = Math.round((Number(row.match_score) || 0) * 100);
    if (Number.isFinite(minMatch) && scorePct < minMatch) {
      return false;
    }

    const providerKeys = (row.sources || [])
      .map((source) => source.provider_key)
      .concat(row.provider_key)
      .filter(Boolean);

    if (provider !== "all" && !providerKeys.includes(provider)) {
      return false;
    }

    if (importStatus !== "all" && String(row.import_status || "staged") !== importStatus) {
      return false;
    }

    const retrieval = row.resume_retrieval_status || "not_requested";
    if (retrievalStatus !== "all" && retrieval !== retrievalStatus) {
      return false;
    }

    return true;
  });
}

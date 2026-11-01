/** OTI recommendation presentation policy (aligned with backend qualification). */

export const OTI_MIN_RECOMMENDATION_MATCH_PCT = 50;

export const OTI_NO_QUALIFYING_MATCHES_MESSAGE =
  "No candidates meet the minimum 50% match threshold for this requisition.";

export function meetsOtiRecommendationThreshold(row) {
  const matchPct = Number(row?.match_pct);
  if (!Number.isFinite(matchPct) || matchPct < OTI_MIN_RECOMMENDATION_MATCH_PCT) {
    return false;
  }

  const matched = Array.isArray(row?.matched_skills) ? row.matched_skills : [];
  return matched.length > 0;
}

export function meetsOtiExternalRecommendationThreshold(row) {
  const explanation = row?.match_explanation || {};

  if (explanation.resume_qualified === false) {
    return false;
  }

  if (row?.resume_index_status && row.resume_index_status !== "indexed") {
    return false;
  }

  const rawScore = Number(row?.match_score);
  const matchPct = Number.isFinite(rawScore)
    ? rawScore <= 1
      ? Math.round(rawScore * 100)
      : Math.round(rawScore)
    : 0;

  if (matchPct < OTI_MIN_RECOMMENDATION_MATCH_PCT) {
    return false;
  }

  const matchedTokens = Array.isArray(explanation.matched_skill_tokens)
    ? explanation.matched_skill_tokens
    : [];

  return matchedTokens.length > 0;
}

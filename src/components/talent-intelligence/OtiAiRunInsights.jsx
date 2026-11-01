import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function SkillChips({ items = [], color = "default" }) {
  if (!items?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {items.map((item) => (
        <Chip
          key={typeof item === "string" ? item : item.name || item.skill_name}
          size="small"
          variant="outlined"
          color={color}
          label={typeof item === "string" ? item : item.name || item.skill_name}
        />
      ))}
    </Stack>
  );
}

function OtiAiRunInsights({ runMeta }) {
  if (!runMeta?.include_ai_assist && !runMeta?.jd_intelligence) {
    return null;
  }

  const profile = runMeta?.jd_intelligence?.profile || runMeta?.jd_intelligence_snapshot?.profile;
  const strategies = runMeta?.search_strategies?.strategies || runMeta?.search_strategy_snapshot?.bundle?.strategies;
  const providerSelection =
    runMeta?.provider_selection || runMeta?.provider_selection_snapshot?.selection;
  const aiUsage = runMeta?.ai_usage_summary || {};

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        AI-assisted sourcing insights
      </Typography>

      {runMeta?.limitation_notes?.length ? (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {runMeta.limitation_notes.join(" ")}
        </Alert>
      ) : null}

      <Accordion defaultExpanded disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>JD interpretation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {profile ? (
            <Stack spacing={1}>
              <Typography variant="body2">
                Title: {profile.normalized_job_title || "—"} · Source: {profile.source}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {profile.interpretation_disclaimer}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                Mandatory skills
              </Typography>
              <SkillChips items={profile.mandatory_skills} color="success" />
              <Typography variant="subtitle2" fontWeight={700}>
                Preferred / related
              </Typography>
              <SkillChips
                items={[...(profile.preferred_skills || []), ...(profile.related_skills || [])]}
                color="info"
              />
              <Typography variant="subtitle2" fontWeight={700}>
                Transferable skills
              </Typography>
              <SkillChips items={profile.transferable_skills} color="secondary" />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No JD intelligence snapshot for this run.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>
            Search strategies ({strategies?.length || 0})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {(strategies || []).slice(0, 8).map((strategy) => (
              <Box key={strategy.strategy_id || strategy.query_hash}>
                <Typography variant="body2" fontWeight={600}>
                  {strategy.strategy_type}: {strategy.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {strategy.query_text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>External provider selection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              Selected ({providerSelection?.selected_providers?.length || 0})
            </Typography>
            {(providerSelection?.selected_providers || []).map((row) => (
              <Typography key={row.provider_key} variant="body2" color="text.secondary">
                {row.display_name || row.provider_key} · {row.health_status || "unknown"} — {row.reason}
              </Typography>
            ))}
            {(providerSelection?.skipped_providers || []).length ? (
              <>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                  Skipped / unavailable
                </Typography>
                {providerSelection.skipped_providers.map((row) => (
                  <Typography key={row.provider_key} variant="caption" color="text.secondary" display="block">
                    {row.provider_key}: {row.reason}
                  </Typography>
                ))}
              </>
            ) : null}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {aiUsage?.ai_calls ? (
        <Typography variant="caption" color="text.secondary">
          AI usage: {aiUsage.ai_calls} call(s), ~{aiUsage.total_tokens || 0} tokens, est. $
          {aiUsage.estimated_cost_usd ?? 0}
        </Typography>
      ) : null}

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        Internal results: {runMeta?.internal_results_count ?? runMeta?.results_count ?? "—"} · External
        leads: {runMeta?.external_leads_count ?? "—"}
      </Typography>
    </Box>
  );
}

export default OtiAiRunInsights;

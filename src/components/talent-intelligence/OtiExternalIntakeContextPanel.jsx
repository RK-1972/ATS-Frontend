import { Chip, Link, Stack, Typography } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

function OtiExternalIntakeContextPanel({ context }) {
  if (!context) {
    return null;
  }

  const matchPct = Math.round((Number(context.match_score) || 0) * 100);
  const matchedSkills = context.match_explanation?.matched_skill_tokens || [];
  const missingSkills = context.match_explanation?.missing_skill_tokens || [];
  const primarySource = context.sources?.[0] || {};
  const profileUrl = primarySource.profile_url;

  return (
    <Stack spacing={1.25} sx={{ width: "100%" }}>
      <Typography variant="subtitle2" fontWeight={700}>
        Talent Intelligence match
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip size="small" color="primary" label={`${matchPct}% match`} />
        {context.requisition_code ? (
          <Chip size="small" variant="outlined" label={context.requisition_code} />
        ) : null}
        {context.import_status ? (
          <Chip size="small" variant="outlined" label={context.import_status} />
        ) : null}
      </Stack>

      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        Matching skills
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {matchedSkills.length > 0 ? (
          matchedSkills.map((skill) => (
            <Chip key={skill} size="small" color="success" variant="outlined" label={skill} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )}
      </Stack>

      {missingSkills.length > 0 ? (
        <>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Missing skills
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {missingSkills.map((skill) => (
              <Chip key={skill} size="small" variant="outlined" label={skill} />
            ))}
          </Stack>
        </>
      ) : null}

      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        External source
      </Typography>
      <Stack spacing={0.5}>
        <Typography variant="body2" fontWeight={600}>
          {context.display_name || "External lead"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {primarySource.provider_key || "Provider"} · {context.headline || context.current_role || "—"}
        </Typography>
        {profileUrl ? (
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            View source profile
            <OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />
          </Link>
        ) : null}
        {context.possible_internal_candidate_id ? (
          <Typography variant="caption" color="warning.main">
            Possible internal duplicate (candidate #{context.possible_internal_candidate_id}). Confirm
            before registering.
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

export default OtiExternalIntakeContextPanel;

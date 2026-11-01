import {

  Box,

  Chip,

  Drawer,

  Stack,

  Typography

} from "@mui/material";



function SkillChipList({ skills = [], color = "default" }) {

  if (!skills?.length) {

    return (

      <Typography variant="body2" color="text.secondary">

        —

      </Typography>

    );

  }



  return (

    <Stack direction="row" flexWrap="wrap" gap={0.5}>

      {skills.map((skill) => (

        <Chip

          key={`${skill.code || skill.name}-${skill.name}`}

          label={skill.name || skill.code}

          size="small"

          color={color}

          variant="outlined"

        />

      ))}

    </Stack>

  );

}



function formatScore(value) {

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {

    return "—";

  }



  return `${Math.round(numeric * 100)}%`;

}



function OtiMatchExplanationDrawer({ open, onClose, row }) {

  const explanation = row?.explanation || {};

  const isHybrid =
    explanation.scoring === "oti_phase2_hybrid" || explanation.scoring === "oti_phase5_semantic_hybrid";
  const isSemanticHybrid = explanation.scoring === "oti_phase5_semantic_hybrid";



  return (

    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}>

      <Box sx={{ p: 2.5 }}>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>

          Match explanation

        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>

          {row?.candidate_name || "Candidate"} · {row?.match_pct ?? 0}% structured skill overlap
          {Number.isFinite(Number(row?.rank_score))
            ? ` · overall rank ${Math.round(Number(row.rank_score) * 100)}%`
            : ""}

        </Typography>



        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>

          Scoring method

        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>

          {explanation.scoring || "resume_match_v1_skill_overlap"}

          {explanation.includes_can_skill_map ? " (includes can_skill_map)" : ""}

        </Typography>



        {isHybrid ? (

          <Box sx={{ mb: 2 }}>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>

              Hybrid signals

            </Typography>

            <Stack spacing={0.5}>

              <Typography variant="body2" color="text.secondary">

                Resume keyword relevance: {formatScore(explanation.fts_relevance)}

              </Typography>

              {isSemanticHybrid ? (
                <Typography variant="body2" color="text.secondary">
                  Semantic similarity: {formatScore(explanation.semantic_similarity)}
                </Typography>
              ) : null}

              <Typography variant="body2" color="text.secondary">

                Experience alignment: {formatScore(explanation.experience_alignment)}

              </Typography>

              <Typography variant="body2">{explanation.resume_content_relevance || "—"}</Typography>

              {isSemanticHybrid && explanation.semantic_disclaimer ? (
                <Typography variant="caption" color="text.secondary">
                  {explanation.semantic_disclaimer}
                </Typography>
              ) : null}

            </Stack>

          </Box>

        ) : null}



        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>

          Matched skills

        </Typography>

        <Box sx={{ mb: 2 }}>

          <SkillChipList skills={row?.matched_skills} color="success" />

        </Box>



        {isSemanticHybrid && explanation.semantically_related_skills?.length ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
              Semantically related skills
            </Typography>
            <SkillChipList skills={explanation.semantically_related_skills} color="secondary" />
          </Box>
        ) : null}

        {isHybrid && explanation.resume_extracted_skills?.length ? (

          <Box sx={{ mb: 2 }}>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>

              Skills from indexed resume

            </Typography>

            <SkillChipList skills={explanation.resume_extracted_skills} color="info" />

          </Box>

        ) : null}



        {explanation.talent_adjacency?.findings?.length ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
              Talent adjacency
            </Typography>
            <Stack spacing={0.75}>
              {explanation.talent_adjacency.findings.slice(0, 12).map((finding) => (
                <Box key={`${finding.skill_name}-${finding.adjacency_type}`}>
                  <Typography variant="body2" fontWeight={600}>
                    {finding.skill_name} · {finding.adjacency_type.replace(/_/g, " ")}
                    {finding.verified ? "" : " (unverified)"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {finding.evidence}
                  </Typography>
                </Box>
              ))}
            </Stack>
            {explanation.talent_adjacency.disclaimer ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {explanation.talent_adjacency.disclaimer}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>

          Missing or partial

        </Typography>

        <SkillChipList

          skills={explanation.missing_or_partial || row?.missing_skills}

          color="warning"

        />

      </Box>

    </Drawer>

  );

}



export default OtiMatchExplanationDrawer;



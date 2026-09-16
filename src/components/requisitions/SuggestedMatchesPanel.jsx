import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import EnterpriseCard from "../enterprise/framework/EnterpriseCard";
import { EmptyState, LoadingState } from "../enterprise";
import recruitmentClient from "@/api/clients/recruitmentClient";
import candidateRepository from "@/repositories/candidateRepository";

function displayValue(value) {
  if (value === 0) return "0";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function SkillChipList({ skills = [], color = "default", emptyLabel = "—" }) {
  if (!skills.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyLabel}
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
          sx={{ fontWeight: 600 }}
        />
      ))}
    </Stack>
  );
}

function SuggestedMatchRow({ row, requisitionCode, onMapped }) {
  const navigate = useNavigate();
  const [isMapping, setIsMapping] = useState(false);
  const [mapError, setMapError] = useState("");

  const handleViewProfile = () => {
    if (!row.candidate_id) {
      return;
    }

    navigate(`/candidates/${row.candidate_id}`);
  };

  const handleMap = async () => {
    if (!row.candidate_id || !requisitionCode) {
      return;
    }

    setIsMapping(true);
    setMapError("");

    try {
      await candidateRepository.mapCandidateToRequisition({
        candidate_id: row.candidate_id,
        requisition_code: requisitionCode
      });
      onMapped?.(row);
    } catch (error) {
      setMapError(
        error.response?.data?.message ||
          error.message ||
          "Failed to map candidate."
      );
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "background.paper"
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {displayValue(row.candidate_name)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {displayValue(row.candidate_code)}
              {row.total_experience != null && row.total_experience !== ""
                ? ` · ${row.total_experience} yrs`
                : ""}
            </Typography>
          </Box>

          <Box sx={{ minWidth: { sm: 180 }, width: { xs: "100%", sm: 180 } }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Match
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {row.match_pct ?? 0}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, Number(row.match_pct) || 0))}
              sx={{ height: 8, borderRadius: 999 }}
            />
          </Box>
        </Stack>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ display: "block", mb: 0.5 }}
          >
            Matched Skills
          </Typography>
          <SkillChipList skills={row.matched_skills} color="success" />
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ display: "block", mb: 0.5 }}
          >
            Missing Skills
          </Typography>
          <SkillChipList skills={row.missing_skills} color="warning" />
        </Box>

        {mapError ? (
          <Typography variant="caption" color="error.main">
            {mapError}
          </Typography>
        ) : null}

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<PersonSearchOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleViewProfile}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            View Profile
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<PersonAddAltOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleMap}
            disabled={isMapping}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {isMapping ? "Mapping…" : "Map to Requisition"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function SuggestedMatchesPanel({ requisitionCode, onCandidateMapped }) {
  const [matches, setMatches] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadMatches = useCallback(async () => {
    if (!requisitionCode) {
      setMatches([]);
      setRequiredSkills([]);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const response = await recruitmentClient.getResumeMatches(requisitionCode);
      const payload = response?.data || {};
      setMatches(Array.isArray(payload.candidates) ? payload.candidates : []);
      setRequiredSkills(
        Array.isArray(payload.required_skills) ? payload.required_skills : []
      );
    } catch (error) {
      setMatches([]);
      setRequiredSkills([]);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load suggested matches."
      );
    } finally {
      setIsLoading(false);
    }
  }, [requisitionCode]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleMapped = (row) => {
    setMatches((current) =>
      current.filter((item) => item.candidate_id !== row.candidate_id)
    );
    onCandidateMapped?.(row);
  };

  return (
    <EnterpriseCard
      title="Suggested Matches"
      subtitle="Talent pool candidates ranked by required skill overlap"
      actions={
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={loadMatches}
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Refresh
        </Button>
      }
    >
      {requiredSkills.length ? (
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ display: "block", mb: 0.5 }}
          >
            Required Skills
          </Typography>
          <SkillChipList skills={requiredSkills} color="primary" />
        </Box>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading suggested matches…" />
      ) : loadError ? (
        <EmptyState
          icon={PersonSearchOutlinedIcon}
          title="Suggested matches unavailable"
          description={loadError}
        />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={PersonSearchOutlinedIcon}
          title="No suggested matches"
          description="No unmapped talent pool candidates matched the required skills."
        />
      ) : (
        <Stack spacing={1}>
          {matches.map((row) => (
            <SuggestedMatchRow
              key={row.candidate_id || row.candidate_code}
              row={row}
              requisitionCode={requisitionCode}
              onMapped={handleMapped}
            />
          ))}
        </Stack>
      )}
    </EnterpriseCard>
  );
}

export default SuggestedMatchesPanel;

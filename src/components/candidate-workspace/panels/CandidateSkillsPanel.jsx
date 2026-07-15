import { useMemo, useState, useEffect } from "react";

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { EmptyState, EnterpriseSurface } from "@/components/enterprise";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";
import CandidateAddSkillDialog from "../CandidateAddSkillDialog";

function SkillChip({ skill, skillNameByCode, onEdit, onDelete }) {
  const name = skillNameByCode.get(skill.skill_code) || skill.skill_name || skill.skill_code;
  const meta = [
    skill.years ? `${skill.years}y` : null,
    skill.months ? `${skill.months}m` : null,
    skill.proficiency_code || null
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Chip
      label={`${name}${meta ? ` · ${meta}` : ""}`}
      color="primary"
      variant="filled"
      sx={{ height: 32, maxWidth: "100%" }}
      onClick={() => onEdit(skill)}
      onDelete={() => onDelete(skill.id)}
    />
  );
}

function CandidateSkillsPanel({
  skills = [],
  masterData,
  onSaveSkills,
  onOpenAddDialog,
  forceOpenDialog = false,
  onDialogClose
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    if (forceOpenDialog) {
      setEditingSkill(null);
      setDialogOpen(true);
      onDialogClose?.();
    }
  }, [forceOpenDialog, onDialogClose]);

  const skillNameByCode = useMemo(() => {
    const map = new Map();
    getPublishedRecords(masterData, "skills").forEach((record) => {
      map.set(record.code, record.name);
    });
    return map;
  }, [masterData]);

  const handleSave = async (skillRow) => {
    let nextSkills;

    if (editingSkill) {
      nextSkills = skills.map((row) =>
        row.id === editingSkill.id ? { ...row, ...skillRow } : row
      );
    } else {
      nextSkills = [
        ...skills,
        {
          ...skillRow,
          id: `skill-${Date.now()}`,
          skill_name: skillNameByCode.get(skillRow.skill_code) || skillRow.skill_code
        }
      ];
    }

    await onSaveSkills?.(nextSkills);
    setDialogOpen(false);
    setEditingSkill(null);
  };

  const handleDelete = async (id) => {
    await onSaveSkills?.(skills.filter((row) => row.id !== id));
  };

  return (
    <>
      <EnterpriseSurface>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          mb={2}
          gap={1}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Skills Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Material chips with proficiency and tenure
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => {
              setEditingSkill(null);
              setDialogOpen(true);
              onOpenAddDialog?.();
            }}
          >
            Add Skill
          </Button>
        </Stack>

        {skills.length === 0 ? (
          <EmptyState
            title="No skills captured yet"
            description="Add skills to enrich candidate fitment and search."
            actionLabel="Add Skill"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {skills.map((skill) => (
              <SkillChip
                key={skill.id}
                skill={skill}
                skillNameByCode={skillNameByCode}
                onEdit={(row) => {
                  setEditingSkill(row);
                  setDialogOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}
      </EnterpriseSurface>

      <CandidateAddSkillDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSkill(null);
        }}
        masterData={masterData}
        initialValue={editingSkill}
        onSave={handleSave}
      />
    </>
  );
}

export default CandidateSkillsPanel;

import { useState } from "react";

import { Stack, TextField, Typography } from "@mui/material";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";

import CandidateEditableCard from "../CandidateEditableCard";

const NOTE_THEMES = {
  recruiter: {
    title: "Recruiter Notes",
    bgcolor: "#FFF8E1",
    borderColor: "#FFB300",
    module: "notifications"
  },
  manager: {
    title: "Hiring Manager Notes",
    bgcolor: "#E3F2FD",
    borderColor: "#42A5F5",
    module: "recruitment"
  },
  hr: {
    title: "HR Notes",
    bgcolor: "#E8F5E9",
    borderColor: "#66BB6A",
    module: "interviews"
  },
  private: {
    title: "Private Notes",
    bgcolor: "#F3E5F5",
    borderColor: "#AB47BC",
    module: "approvals"
  }
};

function NoteCard({
  noteKey,
  content,
  isEditing,
  isSaving,
  draft,
  onDraftChange,
  onEdit,
  onSave,
  onCancel
}) {
  const theme = NOTE_THEMES[noteKey];

  return (
    <CandidateEditableCard
      title={theme.title}
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      editContent={
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={`Add ${theme.title.toLowerCase()}...`}
        />
      }
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: theme.bgcolor,
          border: 1,
          borderColor: theme.borderColor,
          borderStyle: noteKey === "private" ? "dashed" : "solid",
          minHeight: 120
        }}
      >
        <EnterpriseModuleIcon
          icon={StickyNote2OutlinedIcon}
          module={theme.module}
          density="sm"
          size={28}
          iconSize={16}
        />
        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap" flex={1}>
          {content || "No notes yet."}
        </Typography>
      </Stack>
    </CandidateEditableCard>
  );
}

function CandidateNotesPanel({
  candidate = {},
  notes = [],
  mapping = {},
  localNotes = {},
  onSaveNotes,
  isSaving = false
}) {
  const [editingKey, setEditingKey] = useState(null);
  const [draft, setDraft] = useState("");

  const noteContent = {
    recruiter: localNotes.recruiter ?? notes.find((row) => row.note_type === "recruiter")?.note_text ?? candidate.remarks,
    manager: localNotes.manager ?? notes.find((row) => row.note_type === "hiring_manager")?.note_text ?? mapping.remarks,
    hr: localNotes.hr ?? notes.find((row) => row.note_type === "hr")?.note_text,
    private: localNotes.private ?? notes.find((row) => row.note_type === "private")?.note_text
  };

  const startEdit = (key) => {
    setEditingKey(key);
    setDraft(noteContent[key] || "");
  };

  const saveNote = async () => {
    await onSaveNotes?.({ ...localNotes, [editingKey]: draft });
    setEditingKey(null);
    setDraft("");
  };

  return (
    <Stack spacing={2}>
      {Object.keys(NOTE_THEMES).map((key) => (
        <NoteCard
          key={key}
          noteKey={key}
          content={noteContent[key]}
          isEditing={editingKey === key}
          isSaving={isSaving}
          draft={draft}
          onDraftChange={setDraft}
          onEdit={() => startEdit(key)}
          onCancel={() => {
            setEditingKey(null);
            setDraft("");
          }}
          onSave={saveNote}
        />
      ))}
    </Stack>
  );
}

export default CandidateNotesPanel;

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Grid,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import { EmptyState, LoadingState } from "@/components/enterprise";
import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import candidateRepository from "@/repositories/candidateRepository";
import CandidateAddEducationDialog from "../CandidateAddEducationDialog";

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  if (/^\d{4}$/.test(String(value))) {
    return String(value);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}

function FieldBlock({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {displayValue(value)}
      </Typography>
    </Stack>
  );
}

function EducationRecordCard({ record, onEdit, onDelete }) {
  return (
    <EnterpriseCard
      title={displayValue(record.qualification)}
      subtitle={displayValue(record.institution)}
      actions={
        <>
          <IconButton
            size="small"
            aria-label="Edit education"
            onClick={() => onEdit?.(record)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Delete education"
            color="error"
            onClick={() => onDelete?.(record)}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="Qualification" value={record.qualification} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="Institution" value={record.institution} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock
            label="University / Board"
            value={record.university_board}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="Specialization" value={record.specialization} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="From Date" value={formatDate(record.from_date)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="To Date" value={formatDate(record.to_date)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="Score Type" value={record.score_type} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FieldBlock label="Score" value={record.score} />
        </Grid>
      </Grid>
    </EnterpriseCard>
  );
}

function CandidateEducationPanel({ candidateId }) {
  const [records, setRecords] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadEducation = useCallback(async ({ silent = false } = {}) => {
    if (!candidateId) {
      setRecords([]);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }

    if (!silent) {
      setError("");
    }

    try {
      const rows = await candidateRepository.listEducation(candidateId);
      setRecords(rows);
    } catch (loadError) {
      setError(loadError.message || "Failed to load education records");

      if (!silent) {
        setRecords([]);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [candidateId]);

  useEffect(() => {
    loadEducation();
  }, [loadEducation]);

  const handleAddEducation = () => {
    setError("");
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setError("");
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isSaving) {
      return;
    }

    setDialogOpen(false);
    setEditingRecord(null);
  };

  const handleSubmitEducation = async (form) => {
    if (!candidateId) {
      setError("Candidate is not loaded. Cannot save education.");
      throw new Error("Candidate is not loaded. Cannot save education.");
    }

    setIsSaving(true);
    setError("");

    try {
      const educationId =
        editingRecord?.education_id || editingRecord?.id || null;

      const saved = educationId
        ? await candidateRepository.updateEducation(
            candidateId,
            educationId,
            form
          )
        : await candidateRepository.createEducation(candidateId, form);

      setRecords((prev) => {
        const next = prev.filter(
          (row) => String(row.education_id) !== String(saved.education_id)
        );
        return [saved, ...next];
      });

      setDialogOpen(false);
      setEditingRecord(null);
      await loadEducation({ silent: true });
    } catch (saveError) {
      const message =
        saveError.message || "Failed to save education record";
      setError(message);
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!candidateId || !record?.education_id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this education record? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await candidateRepository.deleteEducation(
        candidateId,
        record.education_id
      );

      setRecords((prev) =>
        prev.filter(
          (row) => String(row.education_id) !== String(record.education_id)
        )
      );
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete education record");
    }
  };

  return (
    <Stack spacing={2}>
      <EnterpriseCard
        title="Education"
        subtitle="Candidate educational qualifications"
        actions={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddOutlinedIcon />}
            onClick={handleAddEducation}
          >
            Add Education
          </Button>
        }
      >
        {isLoading ? (
          <LoadingState message="Loading education..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={SchoolOutlinedIcon}
            title="No education records"
            actionLabel="Add Education"
            onAction={handleAddEducation}
          />
        ) : (
          <Stack spacing={2}>
            {records.map((record) => (
              <EducationRecordCard
                key={record.education_id || record.id}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}

        {error && !dialogOpen ? (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        ) : null}
      </EnterpriseCard>

      <CandidateAddEducationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitEducation}
        isSaving={isSaving}
        error={dialogOpen ? error : ""}
        initialValue={editingRecord}
      />
    </Stack>
  );
}

export default CandidateEducationPanel;

import { useEffect, useState } from "react";

import { Alert, Chip, CircularProgress, Stack } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import DocumentPlaceholderGroups from "../../components/platform-config/DocumentPlaceholderGroups";
import documentPlaceholderRepository from "@/repositories/documentPlaceholderRepository";

function SupportedPlaceholdersSection() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaceholders() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await documentPlaceholderRepository.getPlaceholders();
        const grouped = data?.groups || [];

        if (!cancelled) {
          setGroups(grouped);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message || "Unable to load document placeholders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlaceholders();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCount = groups.reduce(
    (sum, group) => sum + (group.placeholders?.length || 0),
    0
  );

  return (
    <>
      <ConfigPageHeader
        title="Supported Placeholders"
        subtitle="Namespace-based placeholders recognized by the Optalynx document engine. Copy tokens into DOCX templates."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Document Templates" },
          { label: "Supported Placeholders" }
        ]}
        statusChip={
          <Chip
            label={`${totalCount} placeholder${totalCount === 1 ? "" : "s"}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Placeholder discovery only. No DOCX parsing, replacement, or document generation in
        this sprint.
      </Alert>

      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <DocumentPlaceholderGroups groups={groups} />
      )}
    </>
  );
}

export default SupportedPlaceholdersSection;

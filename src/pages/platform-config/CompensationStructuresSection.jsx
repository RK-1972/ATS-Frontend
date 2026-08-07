import { useEffect, useState } from "react";

import { Alert, Chip, CircularProgress, Stack } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import CompensationStructureComponentsTable from "../../components/platform-config/CompensationStructureComponentsTable";
import compensationRepository from "@/repositories/compensationRepository";

function CompensationStructuresSection() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadStructures() {
      setLoading(true);
      setErrorMessage("");

      try {
        const activeStructures = await compensationRepository.getActiveStructures();

        if (cancelled) {
          return;
        }

        setStructures(activeStructures);

        const defaultStructure =
          activeStructures.find((item) => item.isDefault) || activeStructures[0];

        if (!defaultStructure?.structureId) {
          setSelectedStructure(null);
          setComponents([]);
          return;
        }

        const detail = await compensationRepository.getStructureComponents(
          defaultStructure.structureId
        );

        if (cancelled) {
          return;
        }

        setSelectedStructure(detail.structure || defaultStructure);
        setComponents(detail.components || []);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message ||
              "Unable to load compensation structures."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStructures();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ConfigPageHeader
        title="Compensation Structures"
        subtitle="Configured salary component mappings used by Offer Letters and future compensation modules."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Compensation Structures" }
        ]}
        statusChip={
          <Chip
            label={`${structures.length} active structure${structures.length === 1 ? "" : "s"}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

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
        <CompensationStructureComponentsTable
          structure={selectedStructure}
          components={components}
        />
      )}
    </>
  );
}

export default CompensationStructuresSection;

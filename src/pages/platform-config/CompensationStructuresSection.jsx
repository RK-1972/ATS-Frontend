import { useEffect, useMemo, useState } from "react";

import { Alert, Chip, CircularProgress, Snackbar, Stack } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import CompensationStructureComponentsTable from "../../components/platform-config/CompensationStructureComponentsTable";
import compensationRepository from "@/repositories/compensationRepository";

function CompensationStructuresSection() {
  const loggedInUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );
  const canEdit = String(loggedInUser?.role_name || "") === "Admin";

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [components, setComponents] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

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

  const handleSaveComponent = async (component, draft) => {
    if (!selectedStructure?.structureId) {
      return;
    }

    const updated = await compensationRepository.updateStructureComponent(
      selectedStructure.structureId,
      component.structureComponentId,
      draft
    );

    setComponents((current) =>
      current.map((row) =>
        row.structureComponentId === component.structureComponentId
          ? { ...row, ...updated }
          : row
      )
    );

    setToast({
      open: true,
      message: "Compensation component rule saved.",
      severity: "success"
    });
  };

  return (
    <>
      <ConfigPageHeader
        title="Compensation Structures"
        subtitle="Database-driven salary component rules used by offer letter calculation and annexure breakup."
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

      {!canEdit ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Compensation rules are read-only for your role. Contact an administrator to
          update component percentages.
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
          canEdit={canEdit}
          onSaveComponent={handleSaveComponent}
        />
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CompensationStructuresSection;

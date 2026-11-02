import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";

import AdminNavRail from "../../components/layout/AdminNavRail";
import Header from "../../components/Header";
import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import { EmptyState, LoadingState, SearchBar } from "@/components/enterprise";
import recruitmentClient from "@/api/clients/recruitmentClient";
import OtiEnterpriseSourcingExperience from "../../components/talent-intelligence/OtiEnterpriseSourcingExperience";
import { readWorkspaceFlags, readLoggedInUser, canShowTalentIntelligenceNav } from "@/enterprise/workspaceAvailability";

function TalentIntelligenceWorkspacePage() {
  const workspace = readWorkspaceFlags();
  const user = readLoggedInUser();
  const isAdmin = user?.role_name === "Admin";
  const [requisitions, setRequisitions] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [search, setSearch] = useState("");
  const [isLoadingReqs, setIsLoadingReqs] = useState(true);
  const [error, setError] = useState("");

  const loadRequisitions = useCallback(async () => {
    setIsLoadingReqs(true);
    setError("");

    try {
      const response = await recruitmentClient.listTalentIntelligenceWorkspaceRequisitions();
      const data = response?.data;
      setRequisitions(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setRequisitions([]);
      setError(
        loadError.response?.data?.message ||
          loadError.message ||
          "Failed to load requisitions."
      );
    } finally {
      setIsLoadingReqs(false);
    }
  }, []);

  useEffect(() => {
    loadRequisitions();
  }, [loadRequisitions]);

  const filteredRequisitions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return requisitions;
    }

    return requisitions.filter((row) =>
      [row.req_code, row.job_title, row.client_name, row.req_status]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ")
        .includes(query)
    );
  }, [requisitions, search]);

  if (!isAdmin && !canShowTalentIntelligenceNav({ user, workspaceFlags: workspace })) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Talent Intelligence is available when you have at least one assigned requisition or the
          TALENT_INTELLIGENCE work assignment.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminNavRail />
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Header />
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
          <ConfigPageHeader
            title="Talent Intelligence"
            subtitle="Enterprise sourcing workspace — internal discovery, external staging, semantic ranking, and recruiter-controlled actions"
            icon={PersonSearchOutlinedIcon}
          />

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Stack spacing={2}>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                bgcolor: "background.paper"
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Requisition entry
              </Typography>
              <SearchBar
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter requisitions"
                width="100%"
              />

              {isLoadingReqs ? <LoadingState label="Loading requisitions…" /> : null}

              {!isLoadingReqs && filteredRequisitions.length === 0 ? (
                <EmptyState title="No requisitions" description="Assigned requisitions will appear here." />
              ) : null}

              <TextField
                select
                fullWidth
                size="small"
                label="Selected requisition"
                value={selectedCode}
                onChange={(event) => setSelectedCode(event.target.value)}
                sx={{ mt: 1.5 }}
              >
                {filteredRequisitions.map((row) => (
                  <MenuItem key={row.req_code} value={row.req_code}>
                    {row.req_code} · {row.job_title || "Untitled"}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <OtiEnterpriseSourcingExperience
              key={selectedCode || "no-requisition"}
              requisitionCode={selectedCode}
              entryPoint="workspace"
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default TalentIntelligenceWorkspacePage;

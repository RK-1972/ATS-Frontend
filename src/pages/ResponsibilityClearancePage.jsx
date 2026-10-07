import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import Header from "../components/Header";
import AdminNavRail from "../components/layout/AdminNavRail";
import API from "../api/axios";
import EmployeeDeactivateClearanceDialog from "../components/employee-lifecycle/EmployeeDeactivateClearanceDialog";

function ResponsibilityClearancePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearanceTarget, setClearanceTarget] = useState(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/employee-lifecycle/responsibility-clearance");
      setQueue(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load organization responsibility clearance queue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    API.get("/employee-lifecycle/responsibility-clearance")
      .then((response) => {
        if (!cancelled) {
          setQueue(response.data?.data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Failed to load organization responsibility clearance queue."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminNavRail />
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Header title="Responsibility Clearance" />
        <Box sx={{ p: 2, maxWidth: 960 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Open clearance items
            </Typography>
            <Button variant="outlined" onClick={loadQueue} sx={{ textTransform: "none" }}>
              Refresh
            </Button>
          </Stack>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading…</Typography>
          ) : null}

          {!loading && queue.length === 0 ? (
            <Alert severity="success">No open responsibility clearance items.</Alert>
          ) : null}

          <Stack spacing={1.25}>
            {queue.map((entry) => (
              <Card key={entry.employee_code} variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {entry.full_name} ({entry.employee_code})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {entry.type === "emergency_exception"
                          ? "Emergency deactivation exception"
                          : "Inactive with unresolved responsibilities"}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} flexWrap="wrap">
                        <Chip
                          size="small"
                          label={`${entry.preflight_summary?.blocking_count || 0} blocking`}
                          color={
                            entry.preflight_summary?.blocking_count > 0
                              ? "warning"
                              : "default"
                          }
                        />
                        <Chip
                          size="small"
                          label={`${entry.preflight_summary?.total_count || 0} total`}
                        />
                      </Stack>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ textTransform: "none" }}
                      onClick={() =>
                        setClearanceTarget({
                          employee_code: entry.employee_code,
                          full_name: entry.full_name
                        })
                      }
                    >
                      Review & resolve
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>

      <EmployeeDeactivateClearanceDialog
        open={Boolean(clearanceTarget)}
        mode="clearance"
        employeeCode={clearanceTarget?.employee_code}
        employeeName={clearanceTarget?.full_name}
        onClose={() => setClearanceTarget(null)}
        onCompleted={() => {
          setClearanceTarget(null);
          loadQueue();
        }}
      />
    </Box>
  );
}

export default ResponsibilityClearancePage;

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import API from "../../api/axios";
import { FramerDialogTransition } from "../../theme/motionRenderer";

const CATEGORY_LABELS = {
  WORK_ASSIGNMENT: "Work assignments",
  RECRUITER_ASSIGNMENT: "Recruiter Assignments",
  CANDIDATE_OWNERSHIP: "Candidate Ownership",
  CANDIDATE_TRANSFER_REQUEST: "Ownership Transfer Requests",
  WORKFLOW_TASK: "Pending Workflow Tasks",
  INTERVIEW_PANEL: "Interview Panels"
};

const RESOLVE_SECTION_CATEGORY_ORDER = [
  "RECRUITER_ASSIGNMENT",
  "CANDIDATE_OWNERSHIP",
  "CANDIDATE_TRANSFER_REQUEST",
  "WORKFLOW_TASK",
  "INTERVIEW_PANEL"
];

const RESOLVE_SECTION_META = {
  RECRUITER_ASSIGNMENT: {
    description: "Responsibilities requiring recruiter reassignment",
    Icon: AssignmentIndOutlinedIcon
  },
  CANDIDATE_OWNERSHIP: {
    description: "Candidate records requiring ownership transfer",
    Icon: PersonOutlinedIcon
  },
  CANDIDATE_TRANSFER_REQUEST: {
    description: "Pending ownership transfer requests to resolve",
    Icon: SwapHorizOutlinedIcon
  },
  WORKFLOW_TASK: {
    description: "Workflow tasks requiring reassignment",
    Icon: PendingActionsOutlinedIcon
  },
  INTERVIEW_PANEL: {
    description: "Upcoming interview panels requiring a replacement",
    Icon: GroupsOutlinedIcon
  }
};

function resolutionKey(item) {
  return `${item.category}:${String(item.record_id)}`;
}

function EmployeeDeactivateClearanceDialogPanel({
  employeeCode,
  employeeName,
  clearanceOnly,
  onClose,
  onCompleted
}) {
  const [step, setStep] = useState("review");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preflight, setPreflight] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resolutions, setResolutions] = useState({});
  const [emergency, setEmergency] = useState(false);

  useEffect(() => {
    let cancelled = false;

    API.get(`/users/${encodeURIComponent(employeeCode)}/responsibility-preflight`)
      .then((response) => {
        if (!cancelled) {
          setPreflight(response.data?.data || null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load responsibility preflight."
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
  }, [employeeCode]);

  const blockingItems = useMemo(
    () => (preflight?.items || []).filter((item) => item.blocking),
    [preflight]
  );

  const blockingItemsBySection = useMemo(() => {
    const byCategory = blockingItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return RESOLVE_SECTION_CATEGORY_ORDER.filter(
      (category) => (byCategory[category]?.length || 0) > 0
    ).map((category) => ({
      category,
      items: byCategory[category]
    }));
  }, [blockingItems]);

  const countsByCategory = preflight?.summary?.counts_by_category || {};

  const categoryCards = useMemo(
    () =>
      Object.entries(countsByCategory).map(([category, count]) => ({
        category,
        count,
        label: CATEGORY_LABELS[category] || category,
        blocking: (preflight?.items || []).some(
          (item) => item.category === category && item.blocking
        )
      })),
    [countsByCategory, preflight]
  );

  const itemsInCategory = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return (preflight?.items || []).filter(
      (item) => item.category === selectedCategory
    );
  }, [preflight, selectedCategory]);

  const unresolvedBlocking = useMemo(() => {
    return blockingItems.filter((item) => !resolutions[resolutionKey(item)]);
  }, [blockingItems, resolutions]);

  const canProceedToConfirm =
    emergency || unresolvedBlocking.length === 0;

  const handleSetSuccessor = (item, successorCode) => {
    const key = resolutionKey(item);
    setResolutions((current) => ({
      ...current,
      [key]: {
        category: item.category,
        record_id: item.record_id,
        successor_employee_code: successorCode || undefined,
        action:
          item.category === "CANDIDATE_TRANSFER_REQUEST" ? "cancel" : undefined
      }
    }));
  };

  const handleSubmit = async () => {
    if (!employeeCode) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const resolutionList = Object.values(resolutions);
      let response;

      if (clearanceOnly) {
        response = await API.post(
          `/users/${encodeURIComponent(employeeCode)}/responsibility-resolutions`,
          {
            reason: reason.trim() || undefined,
            resolutions: resolutionList
          }
        );
      } else {
        const payload = {
          reason: reason.trim() || undefined,
          emergency,
          resolutions: resolutionList
        };

        response = await API.post(
          `/users/${encodeURIComponent(employeeCode)}/deactivate`,
          payload
        );
      }

      onCompleted?.(response.data);
      onClose?.();
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message || "Failed to deactivate user.";
      setError(message);
      if (status === 409 && err.response?.data?.data?.preflight) {
        setPreflight(err.response.data.data.preflight);
        setStep("resolve");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogTitle sx={{ pb: 0.5, flexShrink: 0 }}>
        {clearanceOnly ? (
          <Button
            size="small"
            startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onClose}
            disabled={submitting}
            sx={{ textTransform: "none", mb: 0.75, ml: -0.5 }}
          >
            Back to clearance queue
          </Button>
        ) : null}
        <Typography variant="subtitle1" fontWeight={700}>
          {clearanceOnly
            ? "Responsibility Clearance"
            : "Deactivate — Responsibility Impact"}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {employeeName || employeeCode}
          {preflight?.summary
            ? ` · ${preflight.summary.total_count} responsibility item(s), ${preflight.summary.blocking_count} blocking`
            : ""}
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading responsibility inventory…
          </Typography>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        ) : null}

        {step === "review" && !loading ? (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Review active responsibilities before deactivation. Blocking items must be
              resolved or you may use emergency deactivation (access disabled immediately;
              clearance remains open).
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 1
              }}
            >
              {categoryCards.length === 0 ? (
                <Typography variant="body2">No active responsibilities found.</Typography>
              ) : null}
              {categoryCards.map((card) => (
                <Card key={card.category} variant="outlined">
                  <CardActionArea onClick={() => setSelectedCategory(card.category)}>
                    <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {card.label}
                        </Typography>
                        <Chip size="small" label={card.count} />
                      </Stack>
                      {card.blocking ? (
                        <Chip
                          size="small"
                          color="warning"
                          label="Blocking"
                          sx={{ mt: 0.75 }}
                        />
                      ) : null}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
            {selectedCategory ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {CATEGORY_LABELS[selectedCategory] || selectedCategory}
                </Typography>
                <Stack spacing={0.5}>
                  {itemsInCategory.map((item) => (
                    <Typography key={resolutionKey(item)} variant="caption" display="block">
                      {item.label}
                      {item.blocking ? " (blocking)" : ""}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        ) : null}

        {step === "resolve" && !loading ? (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Assign a successor for each blocking responsibility, or unassign recruiters where
              allowed.
            </Typography>
            <Stack spacing={2} sx={{ mt: 0.25 }}>
            {blockingItemsBySection.map((section) => {
              const sectionMeta = RESOLVE_SECTION_META[section.category];
              const SectionIcon = sectionMeta?.Icon;

              return (
              <Box key={section.category}>
                <Box
                  sx={{
                    px: 1.25,
                    py: 1,
                    mb: 0.75,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "grey.100"
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    {SectionIcon ? (
                      <Box
                        sx={{
                          mt: 0.125,
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          color: "primary.main"
                        }}
                      >
                        <SectionIcon sx={{ fontSize: 18 }} />
                      </Box>
                    ) : null}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="text.primary"
                          sx={{ lineHeight: 1.35 }}
                        >
                          {CATEGORY_LABELS[section.category] || section.category}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={section.items.length}
                          aria-label={`${section.items.length} item(s)`}
                          sx={{
                            height: 22,
                            minWidth: 26,
                            fontSize: 11,
                            fontWeight: 600,
                            bgcolor: "background.paper",
                            borderColor: "divider",
                            color: "text.secondary",
                            "& .MuiChip-label": { px: 0.75 }
                          }}
                        />
                      </Stack>
                      {sectionMeta?.description ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.35, lineHeight: 1.45 }}
                        >
                          {sectionMeta.description}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                </Box>
                <Divider sx={{ mb: 1, borderColor: "divider" }} />
                <Stack spacing={1}>
                  {section.items.map((item) => {
                    const key = resolutionKey(item);
                    const value = resolutions[key]?.successor_employee_code || "";
                    return (
                      <Card key={key} variant="outlined">
                        <CardContent sx={{ py: 1.25 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {CATEGORY_LABELS[item.category]}
                          </Typography>
                          {item.category === "RECRUITER_ASSIGNMENT" ||
                          item.category === "CANDIDATE_OWNERSHIP" ||
                          item.category === "WORKFLOW_TASK" ||
                          item.category === "INTERVIEW_PANEL" ? (
                            <TextField
                              select
                              size="small"
                              fullWidth
                              label="Successor"
                              value={value}
                              onChange={(event) =>
                                handleSetSuccessor(item, event.target.value)
                              }
                              sx={{ mt: 1 }}
                            >
                              <MenuItem value="">
                                {item.category === "RECRUITER_ASSIGNMENT"
                                  ? "Unassign only"
                                  : "Select…"}
                              </MenuItem>
                              {(item.eligible_successors || []).map((person) => (
                                <MenuItem
                                  key={person.employee_code}
                                  value={person.employee_code}
                                >
                                  {person.full_name} ({person.employee_code})
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <Button
                              size="small"
                              sx={{ mt: 1, textTransform: "none" }}
                              onClick={() => handleSetSuccessor(item, "")}
                            >
                              Mark request cancelled
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            );
            })}
            </Stack>
            {unresolvedBlocking.length > 0 ? (
              <Alert severity="warning">
                {unresolvedBlocking.length} blocking item(s) still need resolution.
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        {step === "confirm" ? (
          <Stack spacing={1.25}>
            <TextField
              label="Reason"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional"
            />
            {emergency ? (
              <Alert severity="warning">
                Emergency deactivation disables access immediately and opens a clearance
                exception for Admin / TA Lead follow-up.
              </Alert>
            ) : (
              <Alert severity="info">
                Standard deactivation requires all blocking responsibilities to be resolved.
              </Alert>
            )}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{ px: 2, py: 1.5, gap: 1, flexWrap: "wrap", flexShrink: 0 }}
      >
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        {step === "review" ? (
          <>
            {!clearanceOnly ? (
              <Button
                color="warning"
                onClick={() => {
                  setEmergency(true);
                  setStep("confirm");
                }}
                sx={{ textTransform: "none" }}
              >
                Emergency deactivate
              </Button>
            ) : null}
            <Button
              variant="outlined"
              onClick={() => setStep(blockingItems.length ? "resolve" : "confirm")}
              sx={{ textTransform: "none" }}
            >
              {blockingItems.length ? "Resolve responsibilities" : "Continue"}
            </Button>
          </>
        ) : null}
        {step === "resolve" ? (
          <>
            <Button onClick={() => setStep("review")} sx={{ textTransform: "none" }}>
              Back
            </Button>
            <Button
              variant="contained"
              disabled={!canProceedToConfirm}
              onClick={() => {
                setEmergency(false);
                setStep("confirm");
              }}
              sx={{ textTransform: "none" }}
            >
              Continue to confirmation
            </Button>
          </>
        ) : null}
        {step === "confirm" ? (
          <>
            <Button onClick={() => setStep("review")} sx={{ textTransform: "none" }}>
              Back
            </Button>
            <Button
              variant="contained"
              color={clearanceOnly ? "primary" : "error"}
              disabled={
                submitting ||
                (!clearanceOnly && !emergency && !canProceedToConfirm) ||
                (clearanceOnly && unresolvedBlocking.length > 0)
              }
              onClick={handleSubmit}
              sx={{ textTransform: "none" }}
            >
              {submitting
                ? "Saving…"
                : clearanceOnly
                  ? "Apply resolutions"
                  : "Confirm deactivation"}
            </Button>
          </>
        ) : null}
      </DialogActions>
    </>
  );
}

function EmployeeDeactivateClearanceDialog({
  open,
  employeeCode,
  employeeName,
  mode = "deactivate",
  onClose,
  onCompleted
}) {
  const clearanceOnly = mode === "clearance";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slots={{ transition: FramerDialogTransition }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            maxHeight: "min(90vh, calc(100dvh - 32px))",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }
        }
      }}
    >
      {open && employeeCode ? (
        <EmployeeDeactivateClearanceDialogPanel
          key={`${employeeCode}-${mode}`}
          employeeCode={employeeCode}
          employeeName={employeeName}
          clearanceOnly={clearanceOnly}
          onClose={onClose}
          onCompleted={onCompleted}
        />
      ) : null}
    </Dialog>
  );
}

export default EmployeeDeactivateClearanceDialog;

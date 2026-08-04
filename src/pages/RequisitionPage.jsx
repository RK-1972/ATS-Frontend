import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import WorkspaceLayout from "../components/enterprise/WorkspaceLayout";
import AdminNavRail from "../components/layout/AdminNavRail";
import RecruiterNavRail from "../components/layout/RecruiterNavRail";
import EnterpriseCard from "../components/enterprise/framework/EnterpriseCard";
import EnterpriseWorkspaceHeader from "../components/enterprise/framework/EnterpriseWorkspaceHeader";
import RecruiterAssignmentPanel from "../components/requisitions/RecruiterAssignmentPanel";
import useApprovalRoutes from "../hooks/useApprovalRoutes";
import useRequisitionManagement from "../hooks/useRequisitionManagement";
import AuthorizationService from "../services/authorizationService";
import TalentDemandDraftService from "../services/talentDemandDraftService";
import ApprovedPositionService from "../services/approvedPositionService";
import recruitmentRepository from "../repositories/recruitmentRepository";
import { REQUISITION_STATUS } from "../constants/requisitionStatus";
import { useCopilotContext } from "../components/copilot/CopilotContext";

function resolveEnterpriseNavRail(user) {
  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  if (workspace.showRecruitmentWorkspace || workspace.showInterviewWorkspace) {
    return <RecruiterNavRail loggedInUser={user} />;
  }

  return <AdminNavRail />;
}

function toOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toFormValue(value) {
  if (value === null || value === undefined) return "";
  return value;
}

function formatDateForInput(value) {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function buildDraftPayloadFromForm(formData) {
  return {
    client_id: toOptionalNumber(formData.client_id),
    client_name: formData.client_name || null,
    project_id: toOptionalNumber(formData.project_id),
    project_name: formData.project_name || null,
    job_title: formData.job_title || null,
    job_description: formData.job_description || null,
    primary_skill: formData.primary_skill || null,
    secondary_skill: formData.secondary_skill || null,
    experience_min: toOptionalNumber(formData.experience_min),
    experience_max: toOptionalNumber(formData.experience_max),
    openings_count: toOptionalNumber(formData.openings_count) ?? 1,
    work_location: formData.work_location || null,
    employment_type: formData.employment_type || null,
    priority_level: formData.priority_level || null,
    hiring_manager_id: toOptionalNumber(formData.hiring_manager_id),
    hiring_manager: formData.hiring_manager || null,
    target_date: formData.target_date || null,
    recruiter_id: formData.recruiter_id || null,
    approval_route_id: toOptionalNumber(formData.route_id),
    approved_position_id: formData.approved_position_id
      ? String(formData.approved_position_id).trim()
      : null,
    created_by: formData.created_by || null
  };
}

function mapDraftToFormData(draft, loggedInUser) {
  return {
    client_id: toFormValue(draft.client_id),
    client_name: draft.client_name || "",
    project_id: toFormValue(draft.project_id),
    project_name: draft.project_name || "",
    job_title: draft.job_title || "",
    job_description: draft.job_description || "",
    primary_skill: draft.primary_skill || "",
    secondary_skill: draft.secondary_skill || "",
    experience_min: toFormValue(draft.experience_min),
    experience_max: toFormValue(draft.experience_max),
    openings_count: draft.openings_count ?? 1,
    work_location: draft.work_location || "",
    employment_type: draft.employment_type || "",
    priority_level: draft.priority_level || "",
    req_status: REQUISITION_STATUS.OPEN,
    recruiter_id: draft.recruiter_id || loggedInUser?.employee_code || "",
    hiring_manager_id: toFormValue(draft.hiring_manager_id),
    hiring_manager: draft.hiring_manager || "",
    target_date: formatDateForInput(draft.target_date),
    route_id: toFormValue(draft.approval_route_id),
    approved_position_id: toFormValue(draft.approved_position_id),
    created_by: draft.created_by || loggedInUser?.full_name || ""
  };
}

/** Map an existing operational requisition into the Talent Demand form. */
function mapRequisitionToFormData(requisition, loggedInUser) {
  return {
    client_id: "",
    client_name: requisition.business_unit || requisition.department || "",
    project_id: "",
    project_name: requisition.department || "",
    job_title: requisition.position_title || "",
    job_description: "",
    primary_skill: requisition.primary_skill || "",
    secondary_skill: "",
    experience_min: "",
    experience_max: "",
    openings_count: requisition.headcount ?? 1,
    work_location: requisition.location || "",
    employment_type: requisition.employment_type || "",
    priority_level: "",
    req_status: requisition.req_status || REQUISITION_STATUS.OPEN,
    recruiter_id: loggedInUser?.employee_code || "",
    hiring_manager_id: "",
    hiring_manager: requisition.hiring_manager || "",
    target_date: "",
    route_id: toFormValue(requisition.approval_route_id),
    approved_position_id: toFormValue(requisition.approved_position_id),
    created_by: requisition.created_by || loggedInUser?.full_name || ""
  };
}

function RequisitionPage({ draftId: draftIdProp } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentPage } = useCopilotContext();
  const [searchParams] = useSearchParams();
  const suppliedDraftId =
    draftIdProp ?? searchParams.get("draftId") ?? null;
  const suppliedRequisitionCode =
    location.state?.requisitionCode ||
    location.state?.createdRequisitionCode ||
    searchParams.get("requisitionCode") ||
    null;
  const navApprovedPositionId =
    location.state?.approvedPositionId ||
    searchParams.get("approvedPositionId") ||
    null;

  const {
    loggedInUser,
    requisitions,
    clients,
    projects,
    hiringManagers,
    recruiters,
    assignedRecruiters,
    selectedReqId,
    selectedRecruiter,
    showAssignModal,
    setRequisitionManagementUi,
    loadRequisitionFormProjects,
    loadRequisitionFormHiringManagers,
    loadAssignedRecruiters,
    assignRecruiterOnRequisition,
    removeRecruiterFromRequisition
  } = useRequisitionManagement();

  const { approvalRoutes, loadApprovalRoutes } = useApprovalRoutes();

  const [authorizationDialogOpen, setAuthorizationDialogOpen] = useState(false);
  const [isCheckingAuthorization, setIsCheckingAuthorization] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [draftCode, setDraftCode] = useState(null);
  const [draftStatus, setDraftStatus] = useState(null);
  const [rowVersion, setRowVersion] = useState(null);
  const [resultRequisitionCode, setResultRequisitionCode] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(
    Boolean(suppliedDraftId || suppliedRequisitionCode)
  );
  const [toast, setToast] = useState({ message: "", severity: "success" });
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const [submitErrorOpen, setSubmitErrorOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [approvedPositions, setApprovedPositions] = useState([]);

  const isDraftSubmitted =
    String(draftStatus || "").toUpperCase() === "SUBMITTED";
  /** Existing operational requisition opened for edit (not a blank NEW create). */
  const isEditMode = Boolean(resultRequisitionCode);
  const draftActionsDisabled =
    isSavingDraft || isSubmittingDraft || isLoadingDraft || isDraftSubmitted;
  const loggedInEmployeeCode = loggedInUser?.employee_code ?? null;

  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    project_id: "",
    project_name: "",
    job_title: "",
    job_description: "",
    primary_skill: "",
    secondary_skill: "",
    experience_min: "",
    experience_max: "",
    openings_count: 1,
    work_location: "",
    employment_type: "",
    priority_level: "",
    req_status: REQUISITION_STATUS.OPEN,
    recruiter_id: loggedInUser?.employee_code || "",
    hiring_manager_id: "",
    hiring_manager: "",
    target_date: "",
    route_id: "",
    approved_position_id: "",
    created_by: loggedInUser?.full_name || ""
  });

  useEffect(() => {
    setCurrentPage("Requisitions");
  }, [setCurrentPage]);

  useEffect(() => {
    loadApprovalRoutes({ applies_to: "Requisition" }).catch(() => {
      // error already stored in hook state
    });
  }, [loadApprovalRoutes]);

  useEffect(() => {
    let cancelled = false;

    const loadApprovedPositions = async () => {
      try {
        const response = await ApprovedPositionService.listApprovedPositions();
        if (!cancelled) {
          setApprovedPositions(
            Array.isArray(response?.data) ? response.data : []
          );
        }
      } catch (_error) {
        if (!cancelled) {
          setApprovedPositions([]);
        }
      }
    };

    loadApprovedPositions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!suppliedDraftId) {
      if (!suppliedRequisitionCode) {
        setIsLoadingDraft(false);
      }
      return undefined;
    }

    let cancelled = false;

    const loadDraft = async () => {
      setIsLoadingDraft(true);

      try {
        const response = await TalentDemandDraftService.getDraft(suppliedDraftId);
        const draft = response?.data;

        if (cancelled) {
          return;
        }

        if (!draft) {
          setIsLoadingDraft(false);
          return;
        }

        setDraftId(draft.draft_id ?? suppliedDraftId);
        setDraftCode(draft.draft_code ?? null);
        setDraftStatus(draft.status ?? "DRAFT");
        setRowVersion(draft.row_version ?? null);
        setResultRequisitionCode(draft.result_requisition_code ?? null);
        setFormData(
          mapDraftToFormData(draft, { employee_code: loggedInEmployeeCode })
        );

        if (draft.client_id) {
          await loadRequisitionFormProjects(draft.client_id);
        }

        if (cancelled) {
          return;
        }

        if (draft.project_id) {
          await loadRequisitionFormHiringManagers(draft.project_id);
        }
      } catch (error) {
        if (!cancelled) {
          setToast({
            message:
              error.response?.data?.message || "Failed to load draft.",
            severity: "error"
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDraft(false);
        }
      }
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [
    suppliedDraftId,
    suppliedRequisitionCode,
    loggedInEmployeeCode,
    loadRequisitionFormProjects,
    loadRequisitionFormHiringManagers
  ]);

  // Open newly created / linked requisition in the existing Talent Demand form.
  useEffect(() => {
    if (suppliedDraftId || !suppliedRequisitionCode) {
      return undefined;
    }

    let cancelled = false;

    const loadRequisition = async () => {
      setIsLoadingDraft(true);

      try {
        const requisition = await recruitmentRepository.getRequisition(
          suppliedRequisitionCode
        );

        if (cancelled) {
          return;
        }

        if (!requisition) {
          setToast({
            message: `Requisition ${suppliedRequisitionCode} was not found.`,
            severity: "error"
          });
          return;
        }

        const mapped = mapRequisitionToFormData(requisition, {
          employee_code: loggedInEmployeeCode,
          full_name: loggedInUser?.full_name
        });

        if (!mapped.approved_position_id && navApprovedPositionId) {
          mapped.approved_position_id = String(navApprovedPositionId);
        }

        setResultRequisitionCode(
          requisition.requisition_code || suppliedRequisitionCode
        );
        setFormData(mapped);

        setToast({
          message: `Requisition ${
            requisition.requisition_code || suppliedRequisitionCode
          } opened. Complete the remaining recruitment fields.`,
          severity: "success"
        });
      } catch (error) {
        if (!cancelled) {
          setToast({
            message:
              error.response?.data?.message ||
              "Failed to load requisition.",
            severity: "error"
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDraft(false);
        }
      }
    };

    loadRequisition();

    return () => {
      cancelled = true;
    };
  }, [
    suppliedDraftId,
    suppliedRequisitionCode,
    navApprovedPositionId,
    loggedInEmployeeCode,
    loggedInUser?.full_name
  ]);

  // Catalogue navigation with Approved Position only (no requisition code yet).
  useEffect(() => {
    if (suppliedDraftId || suppliedRequisitionCode || !navApprovedPositionId) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      approved_position_id: String(navApprovedPositionId)
    }));
  }, [suppliedDraftId, suppliedRequisitionCode, navApprovedPositionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "client_id") {
      const selectedClient =
        clients.find(
          (client) => client.client_id === parseInt(value, 10)
        );

      setFormData((prev) => ({
        ...prev,
        client_id: value,
        client_name: selectedClient?.client_name || "",
        project_id: "",
        project_name: "",
        hiring_manager_id: "",
        hiring_manager: ""
      }));

      loadRequisitionFormProjects(value);
      return;
    }

    if (name === "project_id") {
      const selectedProject =
        projects.find(
          (project) => project.project_id === parseInt(value, 10)
        );

      setFormData((prev) => ({
        ...prev,
        project_id: value,
        project_name: selectedProject?.project_name || "",
        hiring_manager_id: "",
        hiring_manager: ""
      }));

      loadRequisitionFormHiringManagers(value);
      return;
    }

    if (name === "hiring_manager_id") {
      const selectedHM =
        hiringManagers.find(
          (hm) => hm.hiring_manager_id === parseInt(value, 10)
        );

      setFormData((prev) => ({
        ...prev,
        hiring_manager_id: value,
        hiring_manager: selectedHM?.hiring_manager_name || ""
      }));
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const persistDraftFromForm = async () => {
    const payload = buildDraftPayloadFromForm(formData);
    const isUpdate = Boolean(draftId);

    const response = isUpdate
      ? await TalentDemandDraftService.updateDraft(draftId, payload)
      : await TalentDemandDraftService.createDraft(payload);

    const draft = response?.data || {};

    setDraftId(draft.draft_id ?? draftId);
    setDraftCode(draft.draft_code ?? draftCode);
    setDraftStatus(draft.status ?? "DRAFT");
    setRowVersion(draft.row_version ?? null);

    return draft;
  };

  const buildExistingRequisitionPayload = () => ({
    ...buildDraftPayloadFromForm(formData),
    route_id: formData.route_id || null,
    approval_route_id: formData.route_id || null
  });

  const handleSaveExistingRequisition = async () => {
    if (!resultRequisitionCode) {
      return;
    }

    setIsSavingDraft(true);

    try {
      await recruitmentRepository.updateRequisition(
        resultRequisitionCode,
        buildExistingRequisitionPayload()
      );
      setToast({
        message: `Requisition ${resultRequisitionCode} updated successfully.`,
        severity: "success"
      });
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to update requisition.",
        severity: "error"
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitExistingRequisition = async () => {
    if (!resultRequisitionCode || isDraftSubmitted) {
      return;
    }

    if (!String(formData.approved_position_id || "").trim()) {
      setSubmitErrorMessage(
        "Select an Approved Position before submitting."
      );
      setSubmitErrorOpen(true);
      return;
    }

    if (!formData.route_id) {
      setSubmitErrorMessage(
        "Select an Approval Route before submitting."
      );
      setSubmitErrorOpen(true);
      return;
    }

    if (
      !formData.client_name.trim() ||
      !formData.job_title.trim() ||
      !formData.primary_skill.trim() ||
      !formData.work_location.trim() ||
      !formData.employment_type ||
      !formData.priority_level ||
      !formData.target_date
    ) {
      setSubmitErrorMessage(
        "Complete all mandatory Talent Demand fields before submitting."
      );
      setSubmitErrorOpen(true);
      return;
    }

    setIsSubmittingDraft(true);

    try {
      const response = await recruitmentRepository.submitRequisition(
        resultRequisitionCode,
        buildExistingRequisitionPayload()
      );
      const result = response?.data || {};

      setResultRequisitionCode(
        result.requisition_code || resultRequisitionCode
      );
      setDraftStatus("SUBMITTED");
      setSubmitSuccessOpen(true);
    } catch (error) {
      setSubmitErrorMessage(
        error.response?.data?.message || "Failed to submit requisition."
      );
      setSubmitErrorOpen(true);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isEditMode) {
      await handleSaveExistingRequisition();
      return;
    }

    setIsSavingDraft(true);
    const wasExisting = Boolean(draftId);

    try {
      await persistDraftFromForm();
      setToast({
        message: wasExisting
          ? "Draft updated successfully."
          : "Draft saved successfully.",
        severity: "success"
      });
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          (wasExisting ? "Failed to update draft." : "Failed to save draft."),
        severity: "error"
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (isEditMode) {
      await handleSubmitExistingRequisition();
      return;
    }

    if (isDraftSubmitted) {
      return;
    }

    if (!String(formData.approved_position_id || "").trim()) {
      setSubmitErrorMessage(
        "Select an Approved Position before submitting."
      );
      setSubmitErrorOpen(true);
      return;
    }

    if (!formData.route_id) {
      setSubmitErrorMessage(
        "Select an Approval Route before submitting."
      );
      setSubmitErrorOpen(true);
      return;
    }

    if (
      !formData.client_name.trim() ||
      !formData.job_title.trim() ||
      !formData.primary_skill.trim() ||
      !formData.work_location.trim() ||
      !formData.employment_type ||
      !formData.priority_level ||
      !formData.target_date
    ) {
      setSubmitErrorMessage(
        "Complete all mandatory Talent Demand fields before submitting."
      );
      setSubmitErrorOpen(true);
      return;
    }

    setIsSubmittingDraft(true);

    try {
      // Flush latest form values (including approval_route_id + approved_position_id)
      // before Submit so the backend never sees a stale draft.
      const savedDraft = await persistDraftFromForm();
      const submitDraftId = savedDraft.draft_id ?? draftId;
      const submitRowVersion = savedDraft.row_version ?? rowVersion;

      if (!submitDraftId) {
        throw new Error("Draft could not be saved before submit.");
      }

      const response = await TalentDemandDraftService.submitDraft(
        submitDraftId,
        submitRowVersion
      );
      const result = response?.data || {};
      const submittedDraft = result.draft || {};

      setDraftId(submittedDraft.draft_id ?? submitDraftId);
      setDraftCode(submittedDraft.draft_code ?? draftCode);
      setDraftStatus(submittedDraft.status ?? "SUBMITTED");
      setRowVersion(submittedDraft.row_version ?? submitRowVersion);

      const createdRequisitionCode =
        result.requisition_code ||
        submittedDraft.result_requisition_code ||
        null;

      setResultRequisitionCode(createdRequisitionCode);
      setSubmitSuccessOpen(true);

      if (createdRequisitionCode) {
        navigate("/requisitions", {
          replace: true,
          state: { createdRequisitionCode }
        });
      }
    } catch (error) {
      setSubmitErrorMessage(
        error.response?.data?.message || "Failed to submit draft."
      );
      setSubmitErrorOpen(true);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  /** Create Requisition uses the same enterprise draft conversion as Submit Draft. */
  const handleCreateRequisition = async () => {
    if (isEditMode) {
      return;
    }

    setIsCheckingAuthorization(true);

    try {
      const allowed = await AuthorizationService.canRaiseRequisition();

      if (!allowed) {
        setAuthorizationDialogOpen(true);
        return;
      }
    } catch (_error) {
      setAuthorizationDialogOpen(true);
      return;
    } finally {
      setIsCheckingAuthorization(false);
    }

    await handleSubmitDraft();
  };

  return (
  <WorkspaceLayout navRail={resolveEnterpriseNavRail(loggedInUser)}>
    <Box
      sx={{
        bgcolor: "background.default"
      }}
    >
      <EnterpriseWorkspaceHeader
        title="Talent Demand Request"
        subtitle="Create, review, and manage workforce demand requests"
        actions={
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/requisitions/my-drafts")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            My Drafts
          </Button>
        }
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1,
          alignItems: "stretch",
          mt: 1
        }}
      >
        {/* LEFT PANEL — Talent Demand Directory */}
        <Box
          sx={{
            width: { xs: "100%", md: "34%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <RecruiterAssignmentPanel
            requisitions={requisitions}
            recruiters={recruiters}
            assignedRecruiters={assignedRecruiters}
            selectedReqId={selectedReqId}
            selectedRecruiter={selectedRecruiter}
            showAssignModal={showAssignModal}
            setRequisitionManagementUi={setRequisitionManagementUi}
            loadAssignedRecruiters={loadAssignedRecruiters}
            assignRecruiterOnRequisition={assignRecruiterOnRequisition}
            removeRecruiterFromRequisition={removeRecruiterFromRequisition}
          />
        </Box>

        {/* RIGHT PANEL — Talent Demand Sheet */}
        <Box
          sx={{
            width: { xs: "100%", md: "66%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              border: 1,
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.paper"
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={1.5}
            >
              <Box minWidth={0}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  lineHeight={1.3}
                  color="text.primary"
                >
                  Talent Demand
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  Create and manage workforce demand requests
                </Typography>
              </Box>

              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                gap={1.5}
                flexShrink={0}
              >
                <Chip
                  label={
                    isDraftSubmitted
                      ? "SUBMITTED"
                      : draftId
                        ? "DRAFT"
                        : "NEW"
                  }
                  size="small"
                  color={isDraftSubmitted ? "success" : "primary"}
                  sx={{ fontWeight: 700, height: 24 }}
                />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    lineHeight={1.2}
                  >
                    Document Number
                  </Typography>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                    {draftCode || "Will be generated"}
                  </Typography>
                </Box>

                {resultRequisitionCode ? (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      lineHeight={1.2}
                    >
                      Requisition Code
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      lineHeight={1.3}
                    >
                      {resultRequisitionCode}
                    </Typography>
                  </Box>
                ) : null}

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    lineHeight={1.2}
                  >
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                    {loggedInUser?.full_name ||
                      formData.created_by ||
                      localStorage.getItem("full_name") ||
                      "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    lineHeight={1.2}
                  >
                    Created On
                  </Typography>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <EnterpriseCard
            title="General Information"
            subtitle="Client and project context"
          >
            <div style={styles.row}>
              <select
                name="client_id"
                style={styles.input}
                value={formData.client_id}
                onChange={handleChange}
              >
                <option value="">
                  Select Client
                </option>
                {
                  clients.map((client) => (
                    <option
                      key={client.client_id}
                      value={client.client_id}
                    >
                      {client.client_name}
                    </option>
                  ))
                }
              </select>

              <select
                name="project_id"
                style={styles.input}
                value={formData.project_id}
                onChange={handleChange}
              >
                <option value="">
                  Select Project
                </option>
                {
                  projects.map((project) => (
                    <option
                      key={project.project_id}
                      value={project.project_id}
                    >
                      {project.project_name}
                    </option>
                  ))
                }
              </select>
            </div>
          </EnterpriseCard>

          <EnterpriseCard
            title="Position Details"
            subtitle="Role definition and headcount"
          >
            <div style={styles.row}>
              <input
                name="job_title"
                placeholder="Job Title *"
                style={styles.input}
                value={formData.job_title}
                onChange={handleChange}
              />

              <input
                type="number"
                name="openings_count"
                placeholder="Openings Count"
                style={styles.input}
                value={formData.openings_count}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <input
                type="number"
                name="experience_min"
                placeholder="Min Experience"
                style={styles.input}
                value={formData.experience_min}
                onChange={handleChange}
              />

              <input
                type="number"
                name="experience_max"
                placeholder="Max Experience"
                style={styles.input}
                value={formData.experience_max}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <textarea
                name="job_description"
                placeholder="Job Description"
                style={styles.textarea}
                value={formData.job_description}
                onChange={handleChange}
              />
            </div>
          </EnterpriseCard>

          <EnterpriseCard
            title="Skills"
            subtitle="Primary and secondary skill requirements"
          >
            <div style={styles.row}>
              <input
                name="primary_skill"
                placeholder="Primary Skill *"
                style={styles.input}
                value={formData.primary_skill}
                onChange={handleChange}
              />

              <input
                name="secondary_skill"
                placeholder="Secondary Skill"
                style={styles.input}
                value={formData.secondary_skill}
                onChange={handleChange}
              />
            </div>
          </EnterpriseCard>

          <EnterpriseCard
            title="Hiring Information"
            subtitle="Hiring manager, location, and demand attributes"
          >
            <div style={styles.row}>
              <select
                name="hiring_manager_id"
                style={styles.input}
                value={formData.hiring_manager_id}
                onChange={handleChange}
              >
                <option value="">
                  Select Hiring Manager
                </option>
                {
                  hiringManagers.map((hm) => (
                    <option
                      key={hm.hiring_manager_id}
                      value={hm.hiring_manager_id}
                    >
                      {hm.hiring_manager_name}
                    </option>
                  ))
                }
              </select>

              <input
                name="work_location"
                placeholder="Work Location *"
                style={styles.input}
                value={formData.work_location}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <select
                name="employment_type"
                style={styles.input}
                value={formData.employment_type}
                onChange={handleChange}
              >
                <option value="">
                  Select Employment Type
                </option>
                <option value="Full Time">
                  Full Time
                </option>
                <option value="Contract">
                  Contract
                </option>
                <option value="Intern">
                  Intern
                </option>
              </select>

              <select
                name="priority_level"
                style={styles.input}
                value={formData.priority_level}
                onChange={handleChange}
              >
                <option value="">
                  Select Priority
                </option>
                <option value="High">
                  High
                </option>
                <option value="Medium">
                  Medium
                </option>
                <option value="Low">
                  Low
                </option>
              </select>
            </div>

            <div style={styles.row}>
              <input
                type="date"
                name="target_date"
                style={styles.input}
                value={formData.target_date}
                onChange={handleChange}
              />
            </div>
          </EnterpriseCard>

          <EnterpriseCard
            title="Approval"
            subtitle="Select approved position and approval route for this demand"
          >
            <div style={styles.row}>
              <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                <InputLabel id="approved-position-label">
                  Approved Position
                </InputLabel>
                <Select
                  labelId="approved-position-label"
                  id="approved-position"
                  name="approved_position_id"
                  label="Approved Position"
                  value={formData.approved_position_id}
                  onChange={handleChange}
                  disabled={draftActionsDisabled}
                  sx={{
                    borderRadius: 2,
                    fontSize: 15,
                    bgcolor: "background.paper"
                  }}
                >
                  <MenuItem value="">
                    <em>Select Approved Position</em>
                  </MenuItem>
                  {approvedPositions.map((position) => (
                    <MenuItem
                      key={position.position_id}
                      value={position.position_id}
                    >
                      {position.position_title}
                      {position.department
                        ? ` — ${position.department}`
                        : ""}
                      {position.grade ? ` (${position.grade})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div style={styles.row}>
              <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                <InputLabel id="approval-route-label">Approval Route</InputLabel>
                <Select
                  labelId="approval-route-label"
                  id="approval-route"
                  name="route_id"
                  label="Approval Route"
                  value={formData.route_id}
                  onChange={handleChange}
                  disabled={draftActionsDisabled}
                  sx={{
                    borderRadius: 2,
                    fontSize: 15,
                    bgcolor: "background.paper"
                  }}
                >
                  <MenuItem value="">
                    <em>Select Approval Route</em>
                  </MenuItem>
                  {approvalRoutes.map((route) => (
                    <MenuItem key={route.route_id} value={route.route_id}>
                      {route.route_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </EnterpriseCard>

          <EnterpriseCard title="Actions">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="flex-end"
              alignItems={{ xs: "stretch", sm: "center" }}
              flexWrap="wrap"
              gap={1}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={handleSaveDraft}
                disabled={draftActionsDisabled}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {isSavingDraft
                  ? isEditMode
                    ? "Saving…"
                    : draftId
                      ? "Updating…"
                      : "Saving…"
                  : isEditMode
                    ? "Save"
                    : draftId
                      ? "Update Draft"
                      : "Save Draft"}
              </Button>
              {isDraftSubmitted ? (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Submitted
                </Button>
              ) : (
                <Button
                  variant={isEditMode ? "contained" : "outlined"}
                  size="small"
                  onClick={handleSubmitDraft}
                  disabled={
                    (!isEditMode && !draftId) ||
                    isSavingDraft ||
                    isSubmittingDraft ||
                    isLoadingDraft
                  }
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {isSubmittingDraft
                    ? "Submitting…"
                    : isEditMode
                      ? "Submit"
                      : "Submit Draft"}
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                disabled
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Clear
              </Button>
              {!isEditMode ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCreateRequisition}
                  disabled={
                    isCheckingAuthorization ||
                    isSubmittingDraft ||
                    isDraftSubmitted ||
                    isLoadingDraft
                  }
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {isSubmittingDraft ? "Creating…" : "Create Requisition"}
                </Button>
              ) : null}
            </Stack>
          </EnterpriseCard>
        </Box>
      </Box>

      <Dialog
        open={authorizationDialogOpen}
        onClose={() => setAuthorizationDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Authorization Required
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            You are not authorized to raise requisitions. Please contact your
            system administrator if you require this access.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            onClick={() => setAuthorizationDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 96 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={submitSuccessOpen}
        onClose={() => setSubmitSuccessOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Talent Demand Submitted Successfully
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 1.5 }}>
          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              Draft {draftCode || draftId} has been submitted successfully.
            </Typography>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontWeight={600}
              >
                Operational Requisition
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {resultRequisitionCode || "—"}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Workflow has been initiated.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setSubmitSuccessOpen(false);
              navigate("/requisitions/my-drafts");
            }}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            View My Drafts
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setSubmitSuccessOpen(false);
              if (resultRequisitionCode) {
                navigate("/requisitions", {
                  replace: true,
                  state: { createdRequisitionCode: resultRequisitionCode }
                });
              }
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 96
            }}
          >
            Continue to Requisition
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={submitErrorOpen}
        onClose={() => setSubmitErrorOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Submit Failed
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {submitErrorMessage}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => setSubmitErrorOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 96
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ message: "", severity: "success" })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  </WorkspaceLayout>
  );
}

const styles = {
  row: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px"
  },
  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px"
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px"
  }
};

export default RequisitionPage;

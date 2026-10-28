import { useEffect, useRef, useState } from "react";
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
import EnterpriseConfirmationDialog from "../components/enterprise/EnterpriseConfirmationDialog";
import RecruiterAssignmentPanel from "../components/requisitions/RecruiterAssignmentPanel";
import RequisitionHeadcountChangePanel from "../components/requisitions/RequisitionHeadcountChangePanel";
import RequisitionBudgetChangePanel from "../components/requisitions/RequisitionBudgetChangePanel";
import useRequisitionManagement from "../hooks/useRequisitionManagement";
import AuthorizationService from "../services/authorizationService";
import TalentDemandDraftService from "../services/talentDemandDraftService";
import ApprovedPositionService from "../services/approvedPositionService";
import RequisitionFieldResolutionService from "../services/requisitionFieldResolutionService";
import recruitmentRepository from "../repositories/recruitmentRepository";
import { REQUISITION_STATUS } from "../constants/requisitionStatus";
import { useCopilotContext } from "../components/copilot/CopilotContext";
import { dispatchApprovalNotificationsUpdated } from "@/utils/enterpriseNotificationEvents";
import useEnterpriseStore from "@/store/enterpriseStore";
import RequisitionSkillMultiSelect from "../components/requisitions/RequisitionSkillMultiSelect";
import { collectExperienceRangeErrors, sanitizeExperienceInput } from "../utils/experienceRangeValidation";
import { collectOpeningsCountErrors } from "../utils/nonNegativeNumericValidation";

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
  if (typeof value === "number") return String(value);
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
    recruiter_id: draft.recruiter_id || "",
    hiring_manager_id: toFormValue(draft.hiring_manager_id),
    hiring_manager: draft.hiring_manager || "",
    target_date: formatDateForInput(draft.target_date),
    route_id: toFormValue(draft.approval_route_id),
    approved_position_id: toFormValue(draft.approved_position_id),
    budget_approved: "",
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
    secondary_skill: requisition.secondary_skill || "",
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
    budget_approved: requisition.budget_approved ?? "",
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
    removeRecruiterFromRequisition,
    publishRequisitionToCandidatePortal,
    unpublishRequisitionFromCandidatePortal,
    closeRequisitionAsFilled,
    closeRequisitionAsCancelled
  } = useRequisitionManagement();

  const masterData = useEnterpriseStore((state) => state.masterData);

  const [authorizationDialogOpen, setAuthorizationDialogOpen] = useState(false);
  const [isCheckingAuthorization, setIsCheckingAuthorization] = useState(false);
  const [canRaiseRequisition, setCanRaiseRequisition] = useState(false);
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
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submitErrorOpen, setSubmitErrorOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [approvedPositions, setApprovedPositions] = useState([]);
  const [fieldResolution, setFieldResolution] = useState(null);
  const [fieldResolutionError, setFieldResolutionError] = useState("");
  const [fieldResolutionLoading, setFieldResolutionLoading] = useState(false);

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
    budget_approved: "",
    created_by: loggedInUser?.full_name || ""
  });

  const isDraftSubmitted =
    String(draftStatus || "").toUpperCase() === "SUBMITTED";
  /** Existing operational requisition opened for edit (not a blank NEW create). */
  const isEditMode = Boolean(resultRequisitionCode);
  const positionLocked =
    isEditMode ||
    Boolean(navApprovedPositionId) ||
    fieldResolution?.position_locked;
  const catalogueApprovedPositionId =
    searchParams.get("approvedPositionId") || navApprovedPositionId || null;
  const catalogueEntryFlow = Boolean(
    suppliedDraftId || catalogueApprovedPositionId
  );
  const hasApprovedPositionOnForm = Boolean(
    String(formData.approved_position_id || "").trim()
  );
  const openingsCountReadOnly =
    hasApprovedPositionOnForm && !isEditMode;
  const jobTitleReadOnly =
    hasApprovedPositionOnForm &&
    (Boolean(catalogueApprovedPositionId) ||
      fieldResolution?.position_locked === true ||
      Boolean(suppliedDraftId) ||
      isEditMode);
  const resolvedJobTitleDisplay = (() => {
    const positionId = formData.approved_position_id;
    if (
      positionId &&
      fieldResolution?.approved_position_id != null &&
      String(fieldResolution.approved_position_id) === String(positionId) &&
      fieldResolution.approved_position_title
    ) {
      return fieldResolution.approved_position_title;
    }
    return formData.job_title || "";
  })();
  const formPanelRef = useRef(null);
  const scrolledForEntryRef = useRef(null);
  const draftHydratedRef = useRef(false);
  const entryScrollKey = catalogueEntryFlow
    ? `${suppliedDraftId || ""}|${catalogueApprovedPositionId || ""}`
    : null;
  const positionSelectionRequired =
    fieldResolution?.position_selection_required === true ||
    (approvedPositions.length > 1 && !positionLocked);
  const resolvedPositionLabel = (() => {
    const positionId = formData.approved_position_id;
    if (!positionId) {
      return "";
    }
    if (fieldResolution?.approved_position_id === positionId) {
      const parts = [
        fieldResolution.approved_position_title,
        fieldResolution.approved_position_department,
        fieldResolution.approved_position_grade
          ? `(${fieldResolution.approved_position_grade})`
          : ""
      ].filter(Boolean);
      if (parts.length) {
        return parts.join(" — ");
      }
    }
    const fromList = approvedPositions.find(
      (row) => String(row.position_id) === String(positionId)
    );
    if (fromList) {
      return `${fromList.position_title || positionId}${
        fromList.department ? ` — ${fromList.department}` : ""
      }${fromList.grade ? ` (${fromList.grade})` : ""}`;
    }
    return String(positionId);
  })();
  const isApprovedRequisition =
    String(formData.req_status || "").trim() === REQUISITION_STATUS.APPROVED;
  const draftActionsDisabled =
    isSavingDraft ||
    isSubmittingDraft ||
    isLoadingDraft ||
    isDraftSubmitted ||
    isApprovedRequisition;
  const loggedInEmployeeCode = loggedInUser?.employee_code ?? null;

  useEffect(() => {
    setCurrentPage("Requisitions");
  }, [setCurrentPage]);

  useEffect(() => {
    let cancelled = false;

    AuthorizationService.canRaiseRequisition()
      .then((allowed) => {
        if (!cancelled) {
          setCanRaiseRequisition(Boolean(allowed));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanRaiseRequisition(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearUnlockedApprovedPositionSelection = () => {
      if (positionLocked || isEditMode || suppliedDraftId || navApprovedPositionId) {
        return;
      }
      setFormData((prev) => {
        if (!String(prev.approved_position_id || "").trim()) {
          return prev;
        }
        return { ...prev, approved_position_id: "" };
      });
    };

    const loadApprovedPositions = async () => {
      let allowed = false;

      try {
        allowed = await AuthorizationService.canRaiseRequisition();
        if (cancelled) {
          return;
        }

        if (!allowed) {
          setApprovedPositions([]);
          clearUnlockedApprovedPositionSelection();
          return;
        }

        const response = await ApprovedPositionService.listApprovedPositions();
        if (!cancelled) {
          setApprovedPositions(
            Array.isArray(response?.data) ? response.data : []
          );
        }
      } catch (_error) {
        if (!cancelled) {
          setApprovedPositions([]);
          if (!allowed) {
            clearUnlockedApprovedPositionSelection();
          } else if (_error.response?.status === 403) {
            clearUnlockedApprovedPositionSelection();
          }
        }
      }
    };

    loadApprovedPositions();

    return () => {
      cancelled = true;
    };
  }, [
    isEditMode,
    navApprovedPositionId,
    positionLocked,
    suppliedDraftId
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadFieldResolution = async () => {
      setFieldResolutionLoading(true);
      setFieldResolutionError("");

      try {
        const params = {};
        if (formData.approved_position_id) {
          params.approved_position_id = formData.approved_position_id;
        }
        if (resultRequisitionCode) {
          params.requisition_code = resultRequisitionCode;
        }

        const response =
          await RequisitionFieldResolutionService.getTalentDemandFieldResolution(
            params
          );
        const data = response?.data || null;

        if (cancelled) {
          return;
        }

        setFieldResolution(data);

        if (
          data?.approved_position_id &&
          !formData.approved_position_id &&
          !isEditMode &&
          !navApprovedPositionId
        ) {
          setFormData((prev) => ({
            ...prev,
            approved_position_id: String(data.approved_position_id)
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setFieldResolution(null);
          setFieldResolutionError(
            error.response?.data?.message ||
              error.message ||
              "Unable to resolve approval settings."
          );
        }
      } finally {
        if (!cancelled) {
          setFieldResolutionLoading(false);
        }
      }
    };

    loadFieldResolution();

    return () => {
      cancelled = true;
    };
  }, [
    formData.approved_position_id,
    resultRequisitionCode,
    isEditMode,
    navApprovedPositionId
  ]);

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
      draftHydratedRef.current = false;

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

        if (draft.client_id) {
          await loadRequisitionFormProjects(draft.client_id);
        }

        if (cancelled) {
          return;
        }

        if (draft.project_id) {
          await loadRequisitionFormHiringManagers(draft.project_id);
        }

        if (cancelled) {
          return;
        }

        setDraftId(draft.draft_id ?? suppliedDraftId);
        setDraftCode(draft.draft_code ?? null);
        setDraftStatus(draft.status ?? "DRAFT");
        setRowVersion(draft.row_version ?? null);
        setResultRequisitionCode(draft.result_requisition_code ?? null);
        setFormData(
          mapDraftToFormData(draft, {
            employee_code: loggedInEmployeeCode,
            full_name: loggedInUser?.full_name
          })
        );
        draftHydratedRef.current = true;
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
    loadRequisitionFormHiringManagers,
    loggedInUser?.full_name
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

  useEffect(() => {
    if (!hasApprovedPositionOnForm || !jobTitleReadOnly) {
      return;
    }

    const positionId = formData.approved_position_id;
    const resolvedTitle =
      fieldResolution?.approved_position_id != null &&
      String(fieldResolution.approved_position_id) === String(positionId) &&
      fieldResolution.approved_position_title
        ? fieldResolution.approved_position_title
        : null;

    if (!resolvedTitle || formData.job_title === resolvedTitle) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      job_title: resolvedTitle
    }));
  }, [
    hasApprovedPositionOnForm,
    jobTitleReadOnly,
    formData.approved_position_id,
    formData.job_title,
    fieldResolution?.approved_position_id,
    fieldResolution?.approved_position_title
  ]);

  useEffect(() => {
    if (isLoadingDraft) {
      return;
    }

    if (!fieldResolution?.approval_route_id) {
      return;
    }

    const resolvedRouteId = String(fieldResolution.approval_route_id);
    if (String(formData.route_id || "") === resolvedRouteId) {
      return;
    }

    if (suppliedDraftId && draftHydratedRef.current && formData.route_id) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      route_id: resolvedRouteId
    }));
  }, [
    fieldResolution?.approval_route_id,
    formData.route_id,
    isLoadingDraft,
    suppliedDraftId
  ]);

  useEffect(() => {
    if (isLoadingDraft) {
      return;
    }

    const positionId = formData.approved_position_id;
    if (
      !positionId ||
      fieldResolution?.approved_position_id == null ||
      String(fieldResolution.approved_position_id) !== String(positionId)
    ) {
      return;
    }

    setFormData((prev) => {
      const next = { ...prev };

      if (
        fieldResolution.approved_headcount != null &&
        Number(prev.openings_count) !== Number(fieldResolution.approved_headcount)
      ) {
        next.openings_count = fieldResolution.approved_headcount;
      }

      if (
        fieldResolution.budget_approved != null &&
        fieldResolution.budget_approved !== "" &&
        prev.budget_approved !== fieldResolution.budget_approved
      ) {
        next.budget_approved = fieldResolution.budget_approved;
      }

      return next;
    });
  }, [
    fieldResolution?.approved_position_id,
    fieldResolution?.approved_headcount,
    fieldResolution?.budget_approved,
    formData.approved_position_id,
    isLoadingDraft
  ]);

  const assertExperienceFieldsValid = () => {
    const errors = collectExperienceRangeErrors(
      formData.experience_min,
      formData.experience_max
    );
    if (errors.length === 0) {
      return true;
    }
    setSubmitErrorMessage(errors.join(" "));
    setSubmitErrorOpen(true);
    return false;
  };

  useEffect(() => {
    if (!catalogueEntryFlow || !entryScrollKey || isLoadingDraft) {
      return;
    }
    if (
      catalogueApprovedPositionId &&
      !String(formData.approved_position_id || "").trim()
    ) {
      return;
    }
    if (hasApprovedPositionOnForm && fieldResolutionLoading) {
      return;
    }
    if (scrolledForEntryRef.current === entryScrollKey) {
      return;
    }
    const panel = formPanelRef.current;
    if (!panel) {
      return;
    }

    scrolledForEntryRef.current = entryScrollKey;
    requestAnimationFrame(() => {
      panel.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }, [
    catalogueEntryFlow,
    entryScrollKey,
    isLoadingDraft,
    catalogueApprovedPositionId,
    formData.approved_position_id,
    hasApprovedPositionOnForm,
    fieldResolutionLoading
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "job_title" && jobTitleReadOnly) {
      return;
    }

    if (name === "approved_position_id" && positionLocked) {
      return;
    }

    if (name === "openings_count" && openingsCountReadOnly) {
      return;
    }

    if (name === "experience_min" || name === "experience_max") {
      const sanitized = sanitizeExperienceInput(value);
      if (sanitized === null) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: sanitized
      }));
      return;
    }

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

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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

  const syncDraftResumeUrl = (savedDraft) => {
    const nextDraftId = savedDraft?.draft_id ?? draftId;
    if (!nextDraftId) {
      return;
    }

    const params = new URLSearchParams(location.search);
    params.set("draftId", String(nextDraftId));
    const approvedId = String(formData.approved_position_id || "").trim();
    if (approvedId) {
      params.set("approvedPositionId", approvedId);
    }
    params.delete("requisitionCode");

    const nextSearch = params.toString();
    const currentDraftParam = searchParams.get("draftId");
    if (currentDraftParam === String(nextDraftId) && location.search === `?${nextSearch}`) {
      return;
    }

    navigate(
      {
        pathname: "/requisitions",
        search: nextSearch ? `?${nextSearch}` : ""
      },
      {
        replace: true,
        state: {
          ...location.state,
          draftId: nextDraftId,
          approvedPositionId:
            approvedId || location.state?.approvedPositionId || null
        }
      }
    );
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

    const experienceErrors = collectExperienceRangeErrors(
      formData.experience_min,
      formData.experience_max
    );
    if (experienceErrors.length > 0) {
      setToast({
        message: experienceErrors.join(" "),
        severity: "error"
      });
      return;
    }

    const openingsErrors = collectOpeningsCountErrors(formData.openings_count);
    if (openingsErrors.length > 0) {
      setToast({
        message: openingsErrors[0],
        severity: "error"
      });
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

    if (!assertExperienceFieldsValid()) {
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
      dispatchApprovalNotificationsUpdated();
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

    if (!String(formData.approved_position_id || "").trim()) {
      setToast({
        message:
          "Select an approved position from Workforce Planning before saving a Talent Demand draft.",
        severity: "error"
      });
      return;
    }

    if (!draftId) {
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
    }

    const experienceErrors = collectExperienceRangeErrors(
      formData.experience_min,
      formData.experience_max
    );
    if (experienceErrors.length > 0) {
      setToast({
        message: experienceErrors.join(" "),
        severity: "error"
      });
      return;
    }

    const openingsErrors = collectOpeningsCountErrors(formData.openings_count);
    if (openingsErrors.length > 0) {
      setToast({
        message: openingsErrors[0],
        severity: "error"
      });
      return;
    }

    setIsSavingDraft(true);
    const wasExisting = Boolean(draftId);

    try {
      const savedDraft = await persistDraftFromForm();
      syncDraftResumeUrl(savedDraft);
      setToast({
        message: wasExisting
          ? "Draft updated successfully."
          : "Draft saved successfully. Resume it anytime from Draft Requisitions.",
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

  const performSubmitDraft = async () => {
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

    if (!assertExperienceFieldsValid()) {
      return;
    }

    const openingsErrors = collectOpeningsCountErrors(formData.openings_count);
    if (openingsErrors.length > 0) {
      setSubmitErrorMessage(openingsErrors[0]);
      setSubmitErrorOpen(true);
      return;
    }

    setIsSubmittingDraft(true);

    try {
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

  const handleSubmitDraft = async () => {
    if (isEditMode) {
      await handleSubmitExistingRequisition();
      return;
    }

    if (isDraftSubmitted || isSubmittingDraft) {
      return;
    }

    setSubmitConfirmOpen(true);
  };

  const handleConfirmSubmitDraft = async () => {
    setSubmitConfirmOpen(false);
    await performSubmitDraft();
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
          canRaiseRequisition ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate("/requisitions/my-drafts")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Draft Requisitions
            </Button>
          ) : null
        }
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1,
          alignItems: "stretch",
          mt: 1,
          minWidth: 0
        }}
      >
        {/* LEFT PANEL — Talent Demand Directory */}
        <Box
          sx={{
            width: { xs: "100%", md: "34%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            order: catalogueEntryFlow ? { xs: 2, sm: 2, md: 1 } : undefined
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
            publishRequisitionToCandidatePortal={publishRequisitionToCandidatePortal}
            unpublishRequisitionFromCandidatePortal={unpublishRequisitionFromCandidatePortal}
            closeRequisitionAsFilled={closeRequisitionAsFilled}
            closeRequisitionAsCancelled={closeRequisitionAsCancelled}
          />
        </Box>

        {/* RIGHT PANEL — Talent Demand Sheet */}
        <Box
          ref={formPanelRef}
          sx={{
            width: { xs: "100%", md: "66%" },
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            order: catalogueEntryFlow ? { xs: 1, sm: 1, md: 2 } : undefined,
            scrollMarginTop: { xs: "88px", sm: "88px", md: 0 }
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
                value={
                  jobTitleReadOnly
                    ? resolvedJobTitleDisplay
                    : formData.job_title
                }
                onChange={handleChange}
                readOnly={jobTitleReadOnly}
                disabled={jobTitleReadOnly}
                title={
                  jobTitleReadOnly
                    ? "Designation is inherited from the approved WFP position."
                    : undefined
                }
              />

              <input
                type="text"
                inputMode="numeric"
                name="openings_count"
                placeholder="No. of positions"
                style={styles.input}
                value={formData.openings_count}
                onChange={handleChange}
                readOnly={openingsCountReadOnly || isApprovedRequisition}
                disabled={openingsCountReadOnly || isApprovedRequisition}
                title={
                  openingsCountReadOnly
                    ? "Headcount is inherited from the approved workforce position."
                    : isApprovedRequisition
                      ? "Approved requisitions require a governed headcount change request."
                      : undefined
                }
              />
            </div>

            <div style={styles.row}>
              <input
                type="text"
                inputMode="decimal"
                name="experience_min"
                placeholder="Min Experience"
                style={styles.input}
                value={formData.experience_min}
                onChange={handleChange}
              />

              <input
                type="text"
                inputMode="decimal"
                name="experience_max"
                placeholder="Max Experience"
                style={styles.input}
                value={formData.experience_max}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <input
                name="budget_approved_display"
                placeholder="Approved Budget"
                style={styles.input}
                value={
                  formData.budget_approved === "" || formData.budget_approved == null
                    ? ""
                    : new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0
                      }).format(Number(formData.budget_approved))
                }
                readOnly
                disabled
                title={
                  isApprovedRequisition
                    ? "Approved requisitions require a governed budget change request."
                    : "Budget is inherited from the approved WFP position."
                }
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

          {isEditMode && isApprovedRequisition && resultRequisitionCode ? (
            <EnterpriseCard
              title="Budget Change"
              subtitle="Governed post-approval budget adjustments"
            >
              <RequisitionBudgetChangePanel
                requisitionCode={resultRequisitionCode}
                reqStatus={formData.req_status}
              />
            </EnterpriseCard>
          ) : null}

          {isEditMode && isApprovedRequisition && resultRequisitionCode ? (
            <EnterpriseCard
              title="Headcount Change"
              subtitle="Governed post-approval headcount adjustments"
            >
              <RequisitionHeadcountChangePanel
                requisitionCode={resultRequisitionCode}
                reqStatus={formData.req_status}
              />
            </EnterpriseCard>
          ) : null}

          <EnterpriseCard
            title="Skills"
            subtitle="Primary and secondary skill requirements"
          >
            <Stack spacing={2}>
              <RequisitionSkillMultiSelect
                label="Primary Skills"
                value={formData.primary_skill}
                masterData={masterData}
                required
                disabled={draftActionsDisabled}
                placeholder="Select primary skills"
                onChange={(nextValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    primary_skill: nextValue
                  }))
                }
              />
              <RequisitionSkillMultiSelect
                label="Secondary Skills"
                value={formData.secondary_skill}
                masterData={masterData}
                disabled={draftActionsDisabled}
                placeholder="Select secondary skills"
                onChange={(nextValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    secondary_skill: nextValue
                  }))
                }
              />
            </Stack>
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
            subtitle="Approved position and route are resolved from workforce planning and approval policy"
          >
            {fieldResolutionError ? (
              <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2 }}>
                {fieldResolutionError}
              </Alert>
            ) : null}

            <div style={styles.row}>
              {positionSelectionRequired && !positionLocked ? (
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
              ) : (
                <TextField
                  label="Approved Position"
                  value={
                    fieldResolutionLoading && !resolvedPositionLabel
                      ? "Resolving…"
                      : resolvedPositionLabel ||
                        (formData.approved_position_id
                          ? formData.approved_position_id
                          : "Not available")
                  }
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    "& .MuiInputBase-input": { fontSize: 15 }
                  }}
                />
              )}
            </div>

            <div style={styles.row}>
              <TextField
                label="Approval Route"
                value={
                  fieldResolutionLoading
                    ? "Resolving…"
                    : fieldResolution?.approval_route_name ||
                      (fieldResolution?.approval_route_id
                        ? `Route #${fieldResolution.approval_route_id}`
                        : formData.approved_position_id
                          ? "Resolved when you submit"
                          : "Select or resolve an approved position first")
                }
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
                helperText="Determined automatically from approval policy at submit"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& .MuiInputBase-input": { fontSize: 15 }
                }}
              />
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
                    ? "Save Progress"
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
              ) : isApprovedRequisition ? (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Approved — use governed changes
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
                  {isSubmittingDraft ? "Submitting…" : "Submit for Approval"}
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

      <EnterpriseConfirmationDialog
        open={submitConfirmOpen}
        title="Submit draft for approval?"
        message="This will validate your Talent Demand draft and start the requisition approval workflow. You can cancel to keep editing."
        confirmLabel="Submit for approval"
        loading={isSubmittingDraft}
        onConfirm={handleConfirmSubmitDraft}
        onClose={() => {
          if (!isSubmittingDraft) {
            setSubmitConfirmOpen(false);
          }
        }}
      />

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
          {canRaiseRequisition ? (
            <Button
              variant="outlined"
              onClick={() => {
                setSubmitSuccessOpen(false);
                navigate("/requisitions/my-drafts");
              }}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
            >
              View Draft Requisitions
            </Button>
          ) : null}
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

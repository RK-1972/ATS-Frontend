import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useEnterpriseStore from "@/store/enterpriseStore";
import candidateRepository from "@/repositories/candidateRepository";
import { executeLegacyCandidateRegistration } from "@/pages/CandidatePage";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";
import { useNavigationFilters } from "@/copilot/core/useNavigationFilters";
import {
  buildTimelineEvents,
  calculateProfileCompletion,
  calculateProfileCompletionBreakdown,
  getCandidateDisplayName,
  parseSkillChips,
  parseSkillsFromCandidate,
  resolveMasterLabel,
  skillsToPrimaryString
} from "@/enterprise/candidateWorkspaceUtils";

function useCandidateWorkspace() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const masterData = useEnterpriseStore((state) => state.masterData);

  const loggedInUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const isRecruiter = loggedInUser?.role_name === "Recruiter";

  const [candidates, setCandidates] = useState([]);
  const [profile, setProfile] = useState(candidateRepository.getInitialProfile());
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceView, setWorkspaceView] = useState("pool");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", severity: "success" });
  const [skills, setSkills] = useState([]);
  const [localNotes, setLocalNotes] = useState({});
  const [localEducation, setLocalEducation] = useState([]);
  const [ownership, setOwnership] = useState(null);
  const [ownerDisplayName, setOwnerDisplayName] = useState("");
  const resumeInputRef = useRef(null);
  const candidateIdRef = useRef(candidateId);
  candidateIdRef.current = candidateId;

  const skillNameByCode = useMemo(() => {
    const map = new Map();
    getPublishedRecords(masterData, "skills").forEach((record) => {
      map.set(record.code, record.name);
    });
    return map;
  }, [masterData]);

  const loadCandidates = useCallback(async () => {
    setIsLoadingList(true);
    setError("");

    try {
      const rows = await candidateRepository.listCandidates(
        workspaceView,
        isRecruiter
      );
      setCandidates(rows);

      const currentId = candidateIdRef.current;

      // Empty list: show index Empty State; do not pick another candidate.
      if (rows.length === 0) {
        if (currentId) {
          navigate("/candidates");
        }
        return;
      }

      const currentExists = rows.some(
        (row) => String(row.candidate_id) === String(currentId)
      );

      // Keep selection if it belongs to this list; otherwise open the first.
      if (!currentExists) {
        navigate(`/candidates/${rows[0].candidate_id}`);
      }
    } catch (loadError) {
      setError(loadError.message || "Failed to load candidates");
    } finally {
      setIsLoadingList(false);
    }
  }, [workspaceView, isRecruiter, navigate]);

  const loadProfile = useCallback(async (id) => {
    if (!id) {
      setProfile(candidateRepository.getInitialProfile());
      setSkills([]);
      return;
    }

    setIsLoadingProfile(true);
    setError("");

    try {
      const [nextProfile, ownershipData, experienceRecords] =
        await Promise.all([
          candidateRepository.loadCandidateProfile(id),
          candidateRepository.getCandidateOwnership(id),
          candidateRepository.listExperience(id)
        ]);

      setProfile({
        ...nextProfile,
        children: {
          ...nextProfile.children,
          experience: experienceRecords
        }
      });

      setOwnership(ownershipData);

      setOwnerDisplayName(
        ownershipData?.owner_display_name || ""
      );

      setSkills(
        parseSkillsFromCandidate(nextProfile.master || {}, skillNameByCode)
      );
      setLocalNotes({});
      setLocalEducation([]);
    } catch (loadError) {
      setError(loadError.message || "Failed to load candidate profile");
      setProfile(candidateRepository.getInitialProfile());
    } finally {
      setIsLoadingProfile(false);
    }
  }, [skillNameByCode]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    loadProfile(candidateId);
  }, [candidateId, loadProfile]);

  const candidate = profile.master || {};
  const mapping = profile.mapping || {};
  const isOwner = Boolean(ownership?.is_owner);
  const pendingRequest = Boolean(ownership?.pending_request);
  const displayName = getCandidateDisplayName(candidate);
  const profileCompletionBreakdown = calculateProfileCompletionBreakdown(
    candidate,
    profile.children.document,
    skills
  );
  const profileCompletion = profileCompletionBreakdown.total;
  const skillChips = parseSkillChips(candidate, skills);
  const timelineEvents = buildTimelineEvents(candidate, mapping);

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return candidates.filter((row) => {
      const name = getCandidateDisplayName(row).toLowerCase();
      const code = String(row.candidate_code || "").toLowerCase();
      const email = String(row.email_id || "").toLowerCase();
      const primarySkill = String(row.primary_skill || "").toLowerCase();
      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        email.includes(query) ||
        primarySkill.includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (statusFilter === "all") {
        return true;
      }

      if (statusFilter === "mapped") {
        return Boolean(row.stage_name || row.req_id);
      }

      if (statusFilter === "active") {
        return String(row.candidate_status || "").toLowerCase().includes("active");
      }

      if (statusFilter === "screen") {
        return String(row.candidate_status || "").toLowerCase().includes("screen");
      }
    });
  }, [candidates, searchQuery, statusFilter]);

  // Generic navigation filters (any producer may set location.state.filters).
  useNavigationFilters((filters) => {
    if (filters.search != null && filters.search !== "") {
      setSearchQuery(String(filters.search));
    }
  });

  const masterLabels = useMemo(
    () => ({
      source: resolveMasterLabel(masterData, "candidate_sources", candidate.source_channel),
      status: candidate.candidate_status || mapping.candidate_status || "—",
      stage: mapping.stage_name || candidate.current_stage || "—",
      employmentType: resolveMasterLabel(
        masterData,
        "employment_types",
        candidate.employment_type_code
      ),
      workArrangement: resolveMasterLabel(
        masterData,
        "work_locations",
        candidate.work_arrangement_code || candidate.preferred_location
      ),
      designation: resolveMasterLabel(
        masterData,
        "designations",
        candidate.designation_code
      ),
      department: resolveMasterLabel(
        masterData,
        "departments",
        candidate.department_code
      ),
      currency: resolveMasterLabel(masterData, "currencies", candidate.currency_code)
    }),
    [candidate, mapping, masterData]
  );

  const selectCandidate = useCallback(
    (id) => {
      navigate(`/candidates/${id}`);
      setMobileSidebarOpen(false);
    },
    [navigate]
  );

  const showToast = useCallback((message, severity = "success") => {
    setToast({ message, severity });
  }, []);

  const registerCandidate = useCallback(
  async (legacyFormData, resumeFile) => {
    setIsSaving(true);

    try {
      const created = await executeLegacyCandidateRegistration(
        legacyFormData,
        resumeFile,
        { skipConfirm: true }
      );

      if (!created) {
        return null;
      }

      await loadCandidates();
      showToast("Candidate created successfully");
      setNewDialogOpen(false);
      navigate(`/candidates/${created.candidate_id}`);
      return created;

    } catch (saveError) {

      showToast(
        saveError.message || "Failed to create candidate",
        "error"
      );

      throw saveError;

    } finally {

      setIsSaving(false);

    }
  },
  [loadCandidates, navigate, showToast]
);

const requestOwnership = useCallback(
  async (reason) => {
    if (!candidateId) return;

    try {

      await candidateRepository.requestCandidateOwnership(
      candidateId,
      reason
    );

      showToast(
        "Ownership request submitted successfully.",
        "success"
      );

      const ownershipData =
        await candidateRepository.getCandidateOwnership(candidateId);

      setOwnership(ownershipData);

      setOwnerDisplayName(
        ownershipData?.owner_display_name || ""
      );

    } catch (ex) {

      showToast(
        ex.message || "Ownership request failed.",
        "error"
      );

    }

  },
  [
    candidateId,
    showToast
  ]
);

const saveCandidate = useCallback(
  async (partial = {}, resumeFile = null) => {
    if (!candidateId) {
      return null;
    }

    setIsSaving(true);

    try {
      const merged = {
        ...candidate,
        ...partial,
        primary_skill:
          partial.primary_skill ??
          skillsToPrimaryString(skills)
      };

      const updated =
        await candidateRepository.updateCandidate(
          candidateId,
          merged,
          loggedInUser,
          resumeFile
        );

      setProfile((prev) => ({
        ...prev,
        master: updated
      }));

      await loadCandidates();

      showToast("Candidate saved successfully");

      return updated;

    } catch (saveError) {

      showToast(
        saveError.message ||
        "Failed to save candidate",
        "error"
      );

      throw saveError;

    } finally {

      setIsSaving(false);

    }
  },
  [
    candidate,
    candidateId,
    loadCandidates,
    loggedInUser,
    showToast,
    skills
  ]
);

  // ======================================================
// NEW - Map Candidate To Requisition
// ======================================================

const mapCandidateToRequisition = useCallback(

  async (payload) => {

    setIsSaving(true);

    try {

      const result =
        await candidateRepository.mapCandidateToRequisition(payload);

      await loadCandidates();

      if (candidateId) {
        await loadProfile(candidateId);
      }

      showToast(
        "Candidate mapped successfully."
      );

      return result;

    }

    catch (error) {

      showToast(
        error.message ||
        "Failed to map candidate",
        "error"
      );

      throw error;

    }

    finally {

      setIsSaving(false);

    }

  },

  [
    candidateId,
    loadCandidates,
    loadProfile,
    showToast
  ]

);

// ======================================================


  const saveSkills = useCallback(
    async (nextSkills) => {
      setSkills(nextSkills);
      await saveCandidate({ primary_skill: skillsToPrimaryString(nextSkills) });
    },
    [saveCandidate]
  );

  const triggerResumeUpload = useCallback(() => {
    resumeInputRef.current?.click();
  }, []);

  const handleResumeSelected = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file || !candidateId) {
        return;
      }

      await saveCandidate({}, file);
    },
    [candidateId, saveCandidate]
  );

  return {
    user: loggedInUser,
    isRecruiter,
    masterData,
    candidates: filteredCandidates,
    candidate,
    mapping,
    profile,
    displayName,
    profileCompletion,
    profileCompletionBreakdown,
    skillChips,
    skills,
    setSkills,
    saveSkills,
    timelineEvents,
    masterLabels,
    candidateId,
    activeTab,
    setActiveTab,
    aiPanelOpen,
    setAiPanelOpen,
    searchQuery,
    setSearchQuery,
    workspaceView,
    setWorkspaceView,
    newDialogOpen,
    setNewDialogOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isLoadingList,
    isLoadingProfile,
    isSaving,
    error,
    toast,
    setToast,
    showToast,
    loadCandidates,
    loadProfile,
    selectCandidate,
    registerCandidate,
    saveCandidate,
    mapCandidateToRequisition,
    localNotes,
    setLocalNotes,
    localEducation,
    setLocalEducation,
    ownerDisplayName,
    isOwner,
    pendingRequest,
    requestOwnership,
    resumeInputRef,
    triggerResumeUpload,
    handleResumeSelected
  };
}

export default useCandidateWorkspace;

import { isLiveMode } from "@/api/config";
import masterDataRepository from "@/repositories/masterDataRepository";
import platformConfigRepository from "@/repositories/platformConfigRepository";
import businessRulesRepository from "@/repositories/businessRulesRepository";
import workflowsRepository from "@/repositories/workflowsRepository";
import workforcePlanningRepository from "@/repositories/workforcePlanningRepository";
import recruitmentRepository from "@/repositories/recruitmentRepository";
import taskRepository from "@/repositories/taskRepository";
import interviewRepository from "@/repositories/interviewRepository";
import offerRepository from "@/repositories/offerRepository";
import hiringControlTowerRepository from "@/repositories/hiringControlTowerRepository";
import useEnterpriseStore from "@/store/enterpriseStore";

function settledValue(result, fallback) {
  return result.status === "fulfilled" ? result.value : fallback;
}

export async function bootstrapEnterpriseData() {
  if (!isLiveMode()) {
    console.warn("[bootstrap] Skipped — VITE_API_MODE is not live");
    return;
  }

  const token = typeof localStorage !== "undefined"
    ? localStorage.getItem("token")
    : null;

  let workspaceBundle = null;

  if (token) {
    try {
      workspaceBundle = await recruitmentRepository.getRecruiterWorkspaceBundle();
      console.info("[bootstrap] Recruiter workspace loaded", {
        requisitions: workspaceBundle.recruitment.requisitions.length,
        pipeline: workspaceBundle.recruitment.pipeline.length,
        tasks: workspaceBundle.taskInbox.tasks.length,
        interviews: workspaceBundle.interviews.interviews.length
      });
    } catch (error) {
      console.error(
        "[bootstrap] Failed to load recruiter workspace:",
        error?.response?.data || error.message
      );
    }
  }

  const [
    masterDataResult,
    platformBundleResult,
    businessRulesBundleResult,
    workflowsBundleResult,
    workforceBundleResult,
    taskBundleResult,
    interviewBundleResult,
    offerBundleResult
  ] = await Promise.allSettled([
    masterDataRepository.getAll(),
    platformConfigRepository.getAll(),
    businessRulesRepository.getAll(),
    workflowsRepository.getAll(),
    workforcePlanningRepository.getAll(),
    taskRepository.getAll(),
    interviewRepository.getAll(),
    offerRepository.getAll()
  ]);

  const masterData = settledValue(masterDataResult, masterDataRepository.getInitialState());
  const platformBundle = settledValue(platformBundleResult, {
    config: platformConfigRepository.getInitialState(),
    baseline: platformConfigRepository.getInitialState(),
    isDirty: false
  });
  const businessRulesBundle = settledValue(businessRulesBundleResult, {
    config: businessRulesRepository.getInitialState(),
    baseline: businessRulesRepository.getInitialState(),
    isDirty: false
  });
  const workflowsBundle = settledValue(workflowsBundleResult, {
    config: workflowsRepository.getInitialState(),
    baseline: workflowsRepository.getInitialState(),
    isDirty: false,
    primaryInstance: null
  });
  const workforceBundle = settledValue(workforceBundleResult, {
    config: workforcePlanningRepository.getInitialState(),
    baseline: workforcePlanningRepository.getInitialState(),
    isDirty: false
  });
  const taskBundle = workspaceBundle?.taskInbox
    || settledValue(taskBundleResult, taskRepository.getInitialState());
  const interviewBundle = workspaceBundle?.interviews
    || settledValue(interviewBundleResult, interviewRepository.getInitialState());
  const offerBundle = settledValue(offerBundleResult, offerRepository.getInitialState());
  const recruitmentBundle = workspaceBundle?.recruitment
    || recruitmentRepository.getInitialState();

  let hiringProcess = hiringControlTowerRepository.getInitialState();

  if (workflowsBundle?.primaryInstance) {
    hiringProcess = {
      ...workflowsBundle.primaryInstance,
      linkedPositionId: workflowsBundle.primaryInstance.linkedPositionId || "AP-ENG-042",
      linkedRequisitionId:
        workflowsBundle.primaryInstance.linkedRequisitionId
        || workflowsBundle.primaryInstance.meta?.requisition_id
    };
  } else {
    try {
      hiringProcess = await hiringControlTowerRepository.getAll();
    } catch (error) {
      console.error("[bootstrap] Failed to load hiring control tower:", error.message);
    }
  }

  useEnterpriseStore.setState({
    masterData,
    platformConfig: platformBundle.config,
    platformConfigBaseline: structuredClone(platformBundle.baseline),
    platformConfigDirty: platformBundle.isDirty,
    businessRules: businessRulesBundle.config,
    businessRulesBaseline: structuredClone(businessRulesBundle.baseline),
    businessRulesDirty: businessRulesBundle.isDirty,
    workflows: workflowsBundle.config,
    workflowsBaseline: structuredClone(workflowsBundle.baseline),
    workflowsDirty: workflowsBundle.isDirty,
    workforce: workforceBundle.config,
    workforceBaseline: structuredClone(workforceBundle.baseline),
    workforceDirty: workforceBundle.isDirty,
    recruitment: recruitmentBundle,
    taskInbox: taskBundle,
    interviews: interviewBundle,
    offers: offerBundle,
    recruiterUi: {
      ...useEnterpriseStore.getState().recruiterUi,
      initialLoadComplete: Boolean(workspaceBundle),
      toastMessage: "",
      toastSeverity: "success"
    },
    workforceUi: {
      selectedRequestId: workforcePlanningRepository.getDefaultSelectedRequestId(
        workforceBundle.config
      ),
      toastMessage: ""
    },
    hiringProcess
  });
}

export default bootstrapEnterpriseData;

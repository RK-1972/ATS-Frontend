import { isLiveMode } from "@/api/config";

import recruitmentClient from "@/api/clients/recruitmentClient";

import { cloneData } from "@/utils/cloneData";



function getInitialState() {

  return {

    requisitions: [],

    recruiterAssignments: [],

    pipeline: [],

    summary: {

      openRequisitions: 0,

      activeCandidates: 0

    }

  };

}



function emptyTaskInbox() {

  return {

    tasks: [],

    summary: { pending: 0, escalated: 0, overdue: 0 }

  };

}



function emptyInterviews() {

  return {

    interviews: [],

    panelAssignments: [],

    summary: { scheduled: 0, completed: 0, pendingFeedback: 0 }

  };

}



function normalizeDashboard(response) {

  if (!response?.requisitions) {

    return {

      recruitment: getInitialState(),

      taskInbox: emptyTaskInbox(),

      interviews: emptyInterviews()

    };

  }



  return {

    recruitment: cloneData({

      requisitions: response.requisitions || [],

      recruiterAssignments: response.recruiterAssignments || [],

      pipeline: response.pipeline || [],

      summary: response.summary || getInitialState().summary

    }),

    taskInbox: cloneData({

      tasks: response.tasks || [],

      summary: response.taskSummary || {

        pending: response.tasks?.length || 0,

        escalated: 0,

        overdue: 0

      }

    }),

    interviews: cloneData({

      interviews: response.interviews || [],

      panelAssignments: [],

      summary: response.interviewSummary || emptyInterviews().summary

    })

  };

}



async function getRecruiterWorkspaceBundle() {

  if (!isLiveMode()) {

    return {

      recruitment: getInitialState(),

      taskInbox: emptyTaskInbox(),

      interviews: emptyInterviews()

    };

  }



  const response = await recruitmentClient.getMyDashboard();

  return normalizeDashboard(response);

}



async function getAll(currentData) {

  if (!isLiveMode()) {

    return currentData ? cloneData(currentData) : getInitialState();

  }



  const bundle = await getRecruiterWorkspaceBundle();

  return bundle.recruitment;

}



async function refreshWorkspaceBundle() {

  return getRecruiterWorkspaceBundle();

}



async function assignRecruiter(recruitment, requisitionCode, recruiterCode) {

  if (!isLiveMode()) {

    return {

      recruitment,

      toastMessage: "Recruiter assigned."

    };

  }



  const result = await recruitmentClient.assignRecruiter(requisitionCode, recruiterCode);

  const bundle = await getRecruiterWorkspaceBundle();



  return {

    ...bundle,

    toastMessage: result.toastMessage

  };

}



async function mapCandidate(recruitment, payload) {

  if (!isLiveMode()) {

    return {

      recruitment,

      toastMessage: "Candidate mapped."

    };

  }



  const result = await recruitmentClient.mapCandidate(payload);

  const bundle = await getRecruiterWorkspaceBundle();



  return {

    ...bundle,

    mapping: result.mapping,

    toastMessage: result.toastMessage

  };

}



async function updateCandidateStage(recruitment, mapId, stageName, remarks) {

  if (!isLiveMode()) {

    return {

      recruitment,

      eventType: "StageChanged",

      toastMessage: "Stage updated."

    };

  }



  const result = await recruitmentClient.updateCandidateStage(mapId, stageName, remarks);

  const bundle = await getRecruiterWorkspaceBundle();



  return {

    ...bundle,

    eventType: result.eventType || "StageChanged",

    toastMessage: result.toastMessage

  };

}



async function approveRequisition(recruitment, requisitionCode, comment) {

  if (!isLiveMode()) {

    return {

      recruitment,

      toastMessage: "Requisition approved."

    };

  }



  const result = await recruitmentClient.approveRequisition(requisitionCode, comment);



  return {

    recruitment: normalizeDashboard(result).recruitment,

    toastMessage: result.toastMessage

  };

}



async function listManagementRequisitions() {
  if (!isLiveMode()) {
    return [];
  }

  const response = await recruitmentClient.listRequisitions();
  return response.data || [];
}

async function getAssignedRecruiters(reqId) {
  if (!isLiveMode()) {
    return [];
  }

  const response = await recruitmentClient.getAssignedRecruiters(reqId);
  return response.data || [];
}

async function listFormRecruiters() {
  if (!isLiveMode()) {
    return [];
  }

  const response = await recruitmentClient.listFormRecruiters();
  return response.data || [];
}

async function listFormClients() {
  if (!isLiveMode()) {
    return [];
  }

  const response = await recruitmentClient.listFormClients();
  return response.data || [];
}

async function listFormProjects(clientId) {
  if (!isLiveMode()) {
    return [];
  }

  const response = await recruitmentClient.listFormProjects(clientId);
  return response.data || [];
}

async function listFormHiringManagers(projectId) {
  if (!isLiveMode()) {
    return [];
  }

  const response = await recruitmentClient.listFormHiringManagers(projectId);
  return response.data || [];
}

async function createRequisitionFromForm(formData) {
  if (!isLiveMode()) {
    return { success: true, message: "Requisition Created Successfully" };
  }

  return recruitmentClient.createRequisitionFromForm(formData);
}

async function assignRecruiterToRequisition(reqId, recruiterCode) {
  if (!isLiveMode()) {
    return { toastMessage: "Recruiter assigned successfully." };
  }

  return recruitmentClient.assignRecruiterToRequisition(reqId, recruiterCode);
}

async function removeRecruiterFromRequisition(assignmentId) {
  if (!isLiveMode()) {
    return { message: "Recruiter removed successfully." };
  }

  return recruitmentClient.removeRecruiterAssignment(assignmentId);
}

async function refreshManagementAssignments(reqId) {
  return getAssignedRecruiters(reqId);
}

const recruitmentRepository = {

  getInitialState,

  getAll,

  getRecruiterWorkspaceBundle,

  refreshWorkspaceBundle,

  assignRecruiter,

  mapCandidate,

  updateCandidateStage,

  approveRequisition,

  listManagementRequisitions,

  getAssignedRecruiters,

  listFormRecruiters,

  listFormClients,

  listFormProjects,

  listFormHiringManagers,

  createRequisitionFromForm,

  assignRecruiterToRequisition,

  removeRecruiterFromRequisition,

  refreshManagementAssignments

};



export default recruitmentRepository;



import { isLiveMode } from "@/api/config";
import interviewClient from "@/api/clients/interviewClient";
import { cloneData } from "@/utils/cloneData";

function getInitialState() {
  return {
    interviews: [],
    panelAssignments: [],
    summary: { scheduled: 0, completed: 0, pendingFeedback: 0 }
  };
}

function normalizeBundle(response) {
  if (response?.interviews) {
    return cloneData(response);
  }

  return getInitialState();
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const response = await interviewClient.getAll();
    return normalizeBundle(response);
  }

  return cloneData(currentData);
}

async function scheduleInterview(interviews, payload) {
  if (!isLiveMode()) {
    return { interviews, toastMessage: "Interview scheduled." };
  }

  const result = await interviewClient.scheduleInterview(payload);
  const bundle = await interviewClient.getAll();

  return {
    interviews: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

async function submitFeedback(interviews, interviewId, payload) {
  if (!isLiveMode()) {
    return { interviews, toastMessage: "Feedback submitted." };
  }

  const result = await interviewClient.submitFeedback(interviewId, payload);
  const bundle = await interviewClient.getAll();

  return {
    interviews: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

async function completeInterview(interviews, interviewId, comment) {
  if (!isLiveMode()) {
    return { interviews, toastMessage: "Interview completed." };
  }

  const result = await interviewClient.completeInterview(interviewId, comment);
  const bundle = await interviewClient.getAll();

  return {
    interviews: normalizeBundle(bundle),
    toastMessage: result.toastMessage
  };
}

const interviewRepository = {
  getInitialState,
  getAll,
  scheduleInterview,
  submitFeedback,
  completeInterview
};

export default interviewRepository;

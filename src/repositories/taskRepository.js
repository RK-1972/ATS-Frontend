import { isLiveMode } from "@/api/config";
import taskClient from "@/api/clients/taskClient";
import { cloneData } from "@/utils/cloneData";

function getInitialState() {
  return {
    tasks: [],
    summary: { pending: 0, escalated: 0, overdue: 0 }
  };
}

function normalizeBundle(response) {
  if (response?.tasks) {
    return cloneData(response);
  }

  if (response?.data) {
    return { tasks: cloneData(response.data), summary: { pending: response.data.length, escalated: 0, overdue: 0 } };
  }

  return getInitialState();
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const response = await taskClient.getAll();
    return normalizeBundle(response);
  }

  return cloneData(currentData);
}

async function getMyTasks(currentData) {
  if (!isLiveMode()) {
    return currentData?.tasks || [];
  }

  const response = await taskClient.getMyTasks();
  return response.data || [];
}

async function completeTask(tasks, taskId, comment) {
  if (!isLiveMode()) {
    return {
      tasks,
      toastMessage: "Task completed."
    };
  }

  await taskClient.completeTask(taskId, comment);
  const bundle = await taskClient.getAll();

  return {
    tasks: normalizeBundle(bundle),
    toastMessage: "Task completed."
  };
}

const taskRepository = {
  getInitialState,
  getAll,
  getMyTasks,
  completeTask
};

export default taskRepository;

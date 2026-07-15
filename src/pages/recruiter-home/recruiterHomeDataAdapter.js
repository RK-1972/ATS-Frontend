/** Normalizes my-dashboard API response for Recruiter Cockpit (recruiter-home scope). */

export function normalizeCockpitDashboard(response = {}) {
  if (!response?.requisitions) {
    return {
      recruitment: {
        requisitions: [],
        recruiterAssignments: [],
        pipeline: [],
        activePipeline: [],
        offerCandidates: [],
        summary: {
          openRequisitions: 0,
          activeCandidates: 0,
          pendingTasks: 0,
          interviewsInRange: 0,
          pendingFeedbackInRange: 0,
          offersInRange: 0,
          pipelineStageCounts: {}
        }
      },
      taskInbox: { tasks: [], summary: { pending: 0, escalated: 0, overdue: 0 } },
      interviews: { interviews: [], summary: { scheduled: 0, completed: 0, pendingFeedback: 0 } },
      filter: response.filter || null
    };
  }

  return {
    recruitment: {
      requisitions: response.requisitions || [],
      recruiterAssignments: response.recruiterAssignments || [],
      pipeline: response.pipeline || [],
      activePipeline: response.activePipeline || response.pipeline || [],
      offerCandidates: response.offerCandidates || [],
      summary: response.summary || {}
    },
    taskInbox: {
      tasks: response.tasks || [],
      summary: response.taskSummary || {
        pending: response.tasks?.length || 0,
        escalated: 0,
        overdue: 0
      }
    },
    interviews: {
      interviews: response.interviews || [],
      summary: response.interviewSummary || {
        scheduled: 0,
        completed: 0,
        pendingFeedback: 0
      }
    },
    filter: response.filter || null
  };
}

export function formatInterviewPreviewDateTime(dateValue, timeValue) {
  if (!dateValue && !timeValue) {
    return null;
  }

  const dateText = dateValue ? String(dateValue).trim() : "";
  const timeText = timeValue ? String(timeValue).trim() : "";

  if (dateText && timeText) {
    const combined = new Date(`${dateText}T${timeText}`);
    if (!Number.isNaN(combined.getTime())) {
      return combined.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  if (dateText) {
    const parsed = new Date(dateText);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: timeText ? "2-digit" : undefined,
        minute: timeText ? "2-digit" : undefined
      });
    }
  }

  return [dateText, timeText].filter(Boolean).join(" ");
}

function formatShortInterviewDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return String(dateValue);
  }

  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function roundSortKey(round) {
  const dateText = round?.interviewDate ? String(round.interviewDate).trim() : "";
  const timeText = round?.interviewTime
    ? String(round.interviewTime).trim()
    : "00:00:00";

  if (dateText) {
    const combined = new Date(`${dateText}T${timeText}`);
    if (!Number.isNaN(combined.getTime())) {
      return combined.getTime();
    }
  }

  return Number(round?.roundNo || 0) * 1e12;
}

function sortInterviewRounds(rounds) {
  return [...rounds].sort((left, right) => {
    const byDate = roundSortKey(left) - roundSortKey(right);

    if (byDate !== 0) {
      return byDate;
    }

    return (left?.roundNo || 0) - (right?.roundNo || 0);
  });
}

function resolveRoundTitle(round, index) {
  if (round?.roundType) {
    return round.roundType;
  }

  if (round?.roundNo) {
    return `Round ${round.roundNo}`;
  }

  return `Round ${index + 1}`;
}

function resolveDistinctRoundTitle(round, index, titleCounts) {
  const baseTitle = resolveRoundTitle(round, index);

  if ((titleCounts.get(baseTitle) || 0) <= 1) {
    return baseTitle;
  }

  const shortDate = formatShortInterviewDate(round?.interviewDate);

  return shortDate ? `${baseTitle} · ${shortDate}` : baseTitle;
}

function resolveInitialRoundPhase(round) {
  const status = String(round?.interviewStatus || "").trim();
  const outcome = String(round?.finalOutcome || "").trim();

  if (outcome === "Rejected") {
    return {
      phase: "special",
      statusLabel: "Rejected"
    };
  }

  if (status === "Completed" && round?.feedbackSubmitted) {
    return {
      phase: "completed",
      statusLabel: "Completed"
    };
  }

  if (status === "Completed" && !round?.feedbackSubmitted) {
    return {
      phase: "pending-feedback",
      statusLabel: "Pending Feedback"
    };
  }

  return {
    phase: "scheduled",
    statusLabel: status || "Scheduled"
  };
}

export function buildInterviewProgressPreviewStages(context = {}) {
  const rounds = sortInterviewRounds(
    Array.isArray(context?.rounds) ? context.rounds : []
  );

  if (rounds.length === 0) {
    return [];
  }

  const titleCounts = new Map();

  rounds.forEach((round, index) => {
    const baseTitle = resolveRoundTitle(round, index);
    titleCounts.set(baseTitle, (titleCounts.get(baseTitle) || 0) + 1);
  });

  const stages = rounds.map((round, index) => {
    const { phase, statusLabel } = resolveInitialRoundPhase(round);
    const scheduledAt = formatInterviewPreviewDateTime(
      round.interviewDate,
      round.interviewTime
    );
    const actionOn = round.actionOn
      ? formatInterviewPreviewDateTime(round.actionOn, null)
      : null;
    const detailLine = [
      round.interviewerName || null,
      phase === "completed" || phase === "special"
        ? actionOn || scheduledAt
        : scheduledAt,
      round.assignmentStatus || null
    ].filter(Boolean).join(" · ");

    return {
      key: `interview-${round.interviewId || round.scheduleId || index}`,
      title: resolveDistinctRoundTitle(round, index, titleCounts),
      phase,
      statusLabel,
      detailLine: detailLine || null,
      finalOutcome: round.finalOutcome || null,
      feedbackSubmitted: Boolean(round.feedbackSubmitted)
    };
  });

  let currentAssigned = false;

  stages.forEach((stage) => {
    if (stage.phase === "completed") {
      return;
    }

    if (stage.phase === "special") {
      if (!currentAssigned) {
        stage.phase = "current";
        currentAssigned = true;
      }
      return;
    }

    if (stage.phase === "pending-feedback") {
      if (!currentAssigned) {
        stage.phase = "current";
        currentAssigned = true;
      } else {
        stage.phase = "special";
      }
      return;
    }

    if (!currentAssigned) {
      stage.phase = "current";
      stage.statusLabel = "Current";
      currentAssigned = true;
      return;
    }

    stage.phase = "upcoming";
    stage.statusLabel = "Upcoming";
  });

  return stages;
}

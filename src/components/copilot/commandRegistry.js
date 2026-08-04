/**
 * Optalynx Copilot command registry.
 * Recognition (command string) is separate from execution (execute).
 * Types: "navigation" | "response"
 */

export function createCopilotCommandRegistry({ navigate, getCurrentCandidate }) {
  return [
    {
      command: "Open Dashboard",
      type: "navigation",
      execute: () => navigate("/recruiter")
    },
    {
      command: "Open Candidates",
      type: "navigation",
      execute: () => navigate("/candidates")
    },
    {
      command: "Open Requisitions",
      type: "navigation",
      execute: () => navigate("/requisitions")
    },
    {
      command: "Open Interviews",
      type: "navigation",
      execute: () => navigate("/interview-schedule")
    },
    {
      command: "Open Reports",
      type: "navigation",
      execute: () => navigate("/reports")
    },
    {
      command: "Who am I looking at?",
      type: "response",
      execute: () => {
        const candidate = getCurrentCandidate?.();

        if (!candidate) {
          return "No candidate is currently selected.";
        }

        return [
          `Candidate Name: ${candidate.candidateName || "—"}`,
          `Candidate Code: ${candidate.candidateCode || "—"}`
        ].join("\n");
      }
    }
  ];
}

/**
 * Exact match after trim; comparison is case-insensitive.
 */
export function findCopilotCommand(registry, enteredText) {
  const normalized = String(enteredText ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    registry.find(
      (entry) => String(entry.command).trim().toLowerCase() === normalized
    ) || null
  );
}

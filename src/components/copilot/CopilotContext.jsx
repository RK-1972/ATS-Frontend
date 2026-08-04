import { createContext, useContext, useMemo, useState } from "react";

const CopilotContext = createContext(null);

export function CopilotProvider({ children }) {
  const [currentPage, setCurrentPage] = useState("");
  const [currentCandidate, setCurrentCandidate] = useState(null);

  const value = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      currentCandidate,
      setCurrentCandidate
    }),
    [currentPage, currentCandidate]
  );

  return (
    <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
  );
}

export function useCopilotContext() {
  const context = useContext(CopilotContext);

  if (!context) {
    throw new Error("useCopilotContext must be used within CopilotProvider");
  }

  return context;
}

import { Navigate } from "react-router-dom";

import { enforceCandidateSession } from "../utils/candidateSessionAuth";

function CandidateProtectedRoute({ children }) {
  const session = enforceCandidateSession();

  if (!session.ok) {
    return <Navigate to="/candidate/login" replace />;
  }

  return children;
}

export default CandidateProtectedRoute;

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem("token");


  // =========================================
  // If Not Logged In
  // =========================================

  if (!token) {

    return <Navigate to="/login" />;

  }


  // =========================================
  // If Logged In
  // =========================================

  return children;

}

export default ProtectedRoute;
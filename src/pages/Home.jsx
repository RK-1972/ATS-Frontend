import { Navigate } from "react-router-dom";
import AdminHomePage from "./admin-home/AdminHomePage";

function Home() {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name;

  if (userRole === "Recruiter") {
    return <Navigate to="/recruiter" replace />;
  }

  return <AdminHomePage />;
}

export default Home;

import {

  BrowserRouter,
  Routes,
  Route,
  Navigate

} from "react-router-dom";

import Home from "./pages/Home";
import CandidatePage from "./pages/CandidatePage";
import LoginPage from "./pages/LoginPage";
import RequisitionPage from "./pages/RequisitionPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MasterManagementPage from "./pages/MasterManagementPage";
import ReportsAnalyticsPage from "./pages/ReportsAnalyticsPage";
import InterviewPanelPage from "./pages/InterviewPanelPage";
import InterviewSchedulePage from "./pages/InterviewSchedulePage";
import InterviewerHome from "./pages/InterviewerHome";
import InterviewFeedbackPage from "./pages/InterviewFeedbackPage";
import ViewFeedback from "./pages/ViewFeedback";


function App() {

  return (

    <BrowserRouter>

      <Routes>


{/* =====================================
    Login Route
===================================== */}

<Route
  path="/login"
  element={<LoginPage />}
/>

{/* =====================================
    Interviewer Route
===================================== */}

<Route
  path="/interviewer"
  element={
    <ProtectedRoute>
      <InterviewerHome />
    </ProtectedRoute>
  }
/>

{/* =====================================
    Protected ATS Routes
===================================== */}

        <Route

          path="/"

          element={

            <ProtectedRoute>

              <Home />

            </ProtectedRoute>

          }

        />


        <Route

          path="/candidates"

          element={

            <ProtectedRoute>

              <CandidatePage />

            </ProtectedRoute>

          }

        />


        {/* =====================================
            User Management Route
        ===================================== */}

        <Route

          path="/users"

          element={

            <ProtectedRoute>

              <UserManagementPage />

            </ProtectedRoute>

          }

        />
        <Route

        path="/masters"

        element={

        <ProtectedRoute>

        <MasterManagementPage />

            </ProtectedRoute>

          }

        />
        <Route

          path="/requisitions"

          element={

            <ProtectedRoute>

              <RequisitionPage />

           </ProtectedRoute>

           }

        />

        <Route

  path="/reports"

  element={

    <ProtectedRoute>

      <ReportsAnalyticsPage />

    </ProtectedRoute>

  }

/>

<Route
  path="/interview-panel"
  element={
    <ProtectedRoute>
      <InterviewPanelPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/interview-schedule"
  element={
    <ProtectedRoute>
      <InterviewSchedulePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/feedback/:scheduleId"
  element={
    <InterviewFeedbackPage />
  }
    />
    <Route

      path="/view-feedback/:scheduleId"

      element={
        <ViewFeedback />
      }

    />
        {/* =====================================
            Default Redirect
        ===================================== */}

        <Route

          path="*"

          element={<Navigate to="/" />}

        />


      </Routes>

    </BrowserRouter>

  );

}

export default App;
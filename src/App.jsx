import { lazy, Suspense } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import Home from "./pages/Home";
import UITestPage from "./pages/UITestPage";
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
import ResetPassword from "./pages/ResetPassword";

const PlatformConfigLayout = lazy(
  () => import("./components/platform-config/PlatformConfigLayout")
);
const PlatformConfigurationOverview = lazy(
  () => import("./pages/platform-config/PlatformConfigurationOverview")
);
const ModulesConfigSection = lazy(
  () => import("./pages/platform-config/ModulesConfigSection")
);
const WorkflowsConfigSection = lazy(
  () => import("./pages/platform-config/WorkflowsConfigSection")
);
const BudgetConfigSection = lazy(
  () => import("./pages/platform-config/BudgetConfigSection")
);
const NotificationsConfigSection = lazy(
  () => import("./pages/platform-config/NotificationsConfigSection")
);
const AiConfigSection = lazy(
  () => import("./pages/platform-config/AiConfigSection")
);
const RolesConfigSection = lazy(
  () => import("./pages/platform-config/RolesConfigSection")
);

const WorkforcePlanningLayout = lazy(
  () => import("./components/workforce-planning/WorkforcePlanningLayout")
);
const WorkforceDashboardPage = lazy(
  () => import("./pages/workforce-planning/WorkforceDashboardPage")
);
const BudgetRequestsPage = lazy(
  () => import("./pages/workforce-planning/BudgetRequestsPage")
);
const BudgetApprovalWorkspacePage = lazy(
  () => import("./pages/workforce-planning/BudgetApprovalWorkspacePage")
);
const ApprovedPositionCataloguePage = lazy(
  () => import("./pages/workforce-planning/ApprovedPositionCataloguePage")
);
const BudgetExceptionMonitorPage = lazy(
  () => import("./pages/workforce-planning/BudgetExceptionMonitorPage")
);
const WorkforceAnalyticsPage = lazy(
  () => import("./pages/workforce-planning/WorkforceAnalyticsPage")
);

const BusinessRulesLayout = lazy(
  () => import("./components/business-rules/BusinessRulesLayout")
);
const RulesDashboardPage = lazy(
  () => import("./pages/business-rules/RulesDashboardPage")
);
const RuleLibraryPage = lazy(
  () => import("./pages/business-rules/RuleLibraryPage")
);
const RuleDesignerPage = lazy(
  () => import("./pages/business-rules/RuleDesignerPage")
);
const ApprovalMatrixPage = lazy(
  () => import("./pages/business-rules/ApprovalMatrixPage")
);
const RuleSimulatorPage = lazy(
  () => import("./pages/business-rules/RuleSimulatorPage")
);
const RuleVersionHistoryPage = lazy(
  () => import("./pages/business-rules/RuleVersionHistoryPage")
);

const HiringControlTowerLayout = lazy(
  () => import("./components/hiring-control-tower/HiringControlTowerLayout")
);

const MasterDataLayout = lazy(
  () => import("./components/master-data/MasterDataLayout")
);
const MasterDataPage = lazy(
  () => import("./pages/master-data/MasterDataPage")
);

const RecruiterWorkspaceLayout = lazy(
  () => import("./components/workspaces/RecruiterWorkspaceLayout")
);
const RecruiterWorkspacePage = lazy(
  () => import("./pages/workspaces/recruiter/RecruiterWorkspacePage")
);
const WorkspacePickerPage = lazy(
  () => import("./pages/workspaces/WorkspacePickerPage")
);

function RouteLoader() {

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "40vh"
      }}
    >
      <CircularProgress size={32} />
    </Box>
  );

}

function LazyRoute({ children }) {

  return (
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  );

}

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

      <Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>

<Route

    path="/ui-test"

    element={<UITestPage />}

/>

<Route
  path="/workspace"
  element={
    <ProtectedRoute>
      <LazyRoute>
        <WorkspacePickerPage />
      </LazyRoute>
    </ProtectedRoute>
  }
/>

{/* =====================================
    Recruiter Workspace (Wave 1)
===================================== */}

<Route
  path="/recruiter"
  element={
    <ProtectedRoute>
      <LazyRoute>
        <RecruiterWorkspaceLayout />
      </LazyRoute>
    </ProtectedRoute>
  }
>
  <Route
    index
    element={
      <LazyRoute>
        <RecruiterWorkspacePage />
      </LazyRoute>
    }
  />
</Route>

{/* =====================================
    Platform Configuration Center
===================================== */}

<Route

  path="/platform-configuration"

  element={

    <ProtectedRoute>

      <LazyRoute>
        <PlatformConfigLayout />
      </LazyRoute>

    </ProtectedRoute>

  }

>

  <Route
    index
    element={
      <LazyRoute>
        <PlatformConfigurationOverview />
      </LazyRoute>
    }
  />

  <Route
    path="modules"
    element={
      <LazyRoute>
        <ModulesConfigSection />
      </LazyRoute>
    }
  />

  <Route
    path="workflows"
    element={
      <LazyRoute>
        <WorkflowsConfigSection />
      </LazyRoute>
    }
  />

  <Route
    path="budget"
    element={
      <LazyRoute>
        <BudgetConfigSection />
      </LazyRoute>
    }
  />

  <Route
    path="notifications"
    element={
      <LazyRoute>
        <NotificationsConfigSection />
      </LazyRoute>
    }
  />

  <Route
    path="ai"
    element={
      <LazyRoute>
        <AiConfigSection />
      </LazyRoute>
    }
  />

  <Route
    path="roles"
    element={
      <LazyRoute>
        <RolesConfigSection />
      </LazyRoute>
    }
  />

</Route>

{/* =====================================
    Workforce Planning & Budget
===================================== */}

<Route

  path="/workforce-planning"

  element={

    <ProtectedRoute>

      <LazyRoute>
        <WorkforcePlanningLayout />
      </LazyRoute>

    </ProtectedRoute>

  }

>

  <Route
    index
    element={
      <LazyRoute>
        <WorkforceDashboardPage />
      </LazyRoute>
    }
  />

  <Route
    path="requests"
    element={
      <LazyRoute>
        <BudgetRequestsPage />
      </LazyRoute>
    }
  />

  <Route
    path="approvals"
    element={
      <LazyRoute>
        <BudgetApprovalWorkspacePage />
      </LazyRoute>
    }
  />

  <Route
    path="catalogue"
    element={
      <LazyRoute>
        <ApprovedPositionCataloguePage />
      </LazyRoute>
    }
  />

  <Route
    path="exceptions"
    element={
      <LazyRoute>
        <BudgetExceptionMonitorPage />
      </LazyRoute>
    }
  />

  <Route
    path="analytics"
    element={
      <LazyRoute>
        <WorkforceAnalyticsPage />
      </LazyRoute>
    }
  />

</Route>

{/* =====================================
    Business Rules & Approval Engine
===================================== */}

<Route

  path="/business-rules"

  element={

    <ProtectedRoute>

      <LazyRoute>
        <BusinessRulesLayout />
      </LazyRoute>

    </ProtectedRoute>

  }

>

  <Route
    index
    element={
      <LazyRoute>
        <RulesDashboardPage />
      </LazyRoute>
    }
  />

  <Route
    path="library"
    element={
      <LazyRoute>
        <RuleLibraryPage />
      </LazyRoute>
    }
  />

  <Route
    path="designer"
    element={
      <LazyRoute>
        <RuleDesignerPage />
      </LazyRoute>
    }
  />

  <Route
    path="approval-matrix"
    element={
      <LazyRoute>
        <ApprovalMatrixPage />
      </LazyRoute>
    }
  />

  <Route
    path="simulator"
    element={
      <LazyRoute>
        <RuleSimulatorPage />
      </LazyRoute>
    }
  />

  <Route
    path="history"
    element={
      <LazyRoute>
        <RuleVersionHistoryPage />
      </LazyRoute>
    }
  />

</Route>

{/* =====================================
    Enterprise Master Data
===================================== */}

<Route

  path="/master-data"

  element={

    <ProtectedRoute>

      <LazyRoute>
        <MasterDataLayout />
      </LazyRoute>

    </ProtectedRoute>

  }

>

  <Route
    index
    element={
      <LazyRoute>
        <MasterDataPage />
      </LazyRoute>
    }
  />

</Route>

{/* =====================================
    Hiring Control Tower
===================================== */}

<Route

  path="/hiring-control-tower"

  element={

    <ProtectedRoute>

      <LazyRoute>
        <HiringControlTowerLayout />
      </LazyRoute>

    </ProtectedRoute>

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
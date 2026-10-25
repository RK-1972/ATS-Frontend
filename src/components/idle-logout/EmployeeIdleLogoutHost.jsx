import EmployeeIdleWarningDialog from "./EmployeeIdleWarningDialog";
import useEmployeeIdleLogout from "@/hooks/useEmployeeIdleLogout";

export default function EmployeeIdleLogoutHost() {
  const {
    warningOpen,
    secondsRemaining,
    totalWarningSeconds,
    submitting,
    errorMessage,
    handleStayLoggedIn,
    handleLogOut
  } = useEmployeeIdleLogout({ enabled: true });

  return (
    <EmployeeIdleWarningDialog
      open={warningOpen}
      secondsRemaining={secondsRemaining}
      totalWarningSeconds={totalWarningSeconds}
      submitting={submitting}
      errorMessage={errorMessage}
      onStayLoggedIn={handleStayLoggedIn}
      onLogOut={handleLogOut}
    />
  );
}

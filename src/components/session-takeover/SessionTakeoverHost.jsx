import { useNavigate } from "react-router-dom";

import SessionTakeoverDialog from "./SessionTakeoverDialog";
import useSessionTakeoverInbox from "@/hooks/useSessionTakeoverInbox";

export default function SessionTakeoverHost() {
  const navigate = useNavigate();

  const { pending, handleResolved, handleSessionRevoked } = useSessionTakeoverInbox({
    enabled: true,
    onSessionRevoked: () => {
      navigate("/login", {
        replace: true,
        state: {
          sessionMessage:
            "Your session ended because sign-in was approved on another device."
        }
      });
    }
  });

  return (
    <SessionTakeoverDialog
      pending={pending}
      onResolved={handleResolved}
      onSessionRevoked={handleSessionRevoked}
    />
  );
}

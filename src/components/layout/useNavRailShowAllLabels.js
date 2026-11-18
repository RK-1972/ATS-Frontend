import { useCallback, useEffect, useRef, useState } from "react";

const CLOSE_DELAY_MS = 80;

/**
 * Show all inline nav labels while the pointer is anywhere on the rail.
 */
function useNavRailShowAllLabels() {
  const [showLabels, setShowLabels] = useState(false);
  const closeTimerRef = useRef(null);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const navHoverProps = {
    onMouseEnter: () => {
      cancelScheduledClose();
      setShowLabels(true);
    },
    onMouseLeave: () => {
      cancelScheduledClose();
      closeTimerRef.current = setTimeout(() => {
        setShowLabels(false);
        closeTimerRef.current = null;
      }, CLOSE_DELAY_MS);
    }
  };

  useEffect(
    () => () => {
      cancelScheduledClose();
    },
    [cancelScheduledClose]
  );

  return { showLabels, navHoverProps };
}

export default useNavRailShowAllLabels;
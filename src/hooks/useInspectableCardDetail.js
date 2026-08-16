import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared hover/focus detail affordance for inspectable motion cards.
 * Used by DenseM3MotionCard and available for lifecycle cards later.
 */
function useInspectableCardDetail({ enabled = true, hoverDelay = 200 } = {}) {

  const [detailOpen, setDetailOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const hoverTimerRef = useRef(null);

  const openDetail = useCallback((immediate = false) => {
    if (!enabled) {
      return;
    }

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    if (immediate) {
      setDetailOpen(true);
      return;
    }

    hoverTimerRef.current = setTimeout(() => {
      setDetailOpen(true);
    }, hoverDelay);
  }, [enabled, hoverDelay]);

  const closeDetail = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    setDetailOpen(false);
  }, []);

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  }, []);

  const cardHandlers = enabled ? {
    onMouseEnter: () => openDetail(false),
    onMouseLeave: closeDetail,
    onFocus: () => openDetail(true),
    onBlur: closeDetail
  } : {};

  const popperHandlers = enabled ? {
    onMouseEnter: () => openDetail(false),
    onMouseLeave: closeDetail
  } : {};

  return {
    setAnchorEl,
    anchorEl,
    detailOpen,
    openDetail,
    closeDetail,
    cardHandlers,
    popperHandlers
  };

}

export default useInspectableCardDetail;

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Popover,
  Typography
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import RequisitionWorkflowProgressPreview from "./RequisitionWorkflowProgressPreview";
import { useApprovalWorkflowPreview } from "@/hooks/useRequisitionWorkflowPreview";

function resolveDocumentTypeKey(row) {
  return String(row?.document_type || row?.workflow_type || "")
    .trim()
    .toUpperCase();
}

function resolveRequisitionDocumentCode(row) {
  const documentNumber = String(row?.document_number || "").trim();

  if (row?.requisition_code) {
    return row.requisition_code;
  }

  if (/^REQ-/i.test(documentNumber)) {
    return documentNumber;
  }

  return null;
}

function resolveBudgetDocumentId(row) {
  const documentNumber = String(row?.document_number || "").trim();
  return documentNumber || null;
}

function resolveWorkflowPreviewContext(row) {
  const documentType = resolveDocumentTypeKey(row);

  if (documentType === "BUDGET") {
    const documentId = resolveBudgetDocumentId(row);

    return documentId
      ? { documentType: "BUDGET", documentId, documentCode: documentId }
      : null;
  }

  const requisitionCode = resolveRequisitionDocumentCode(row);

  return requisitionCode
    ? {
        documentType: "REQUISITION",
        documentId: requisitionCode,
        documentCode: requisitionCode
      }
    : null;
}

function RequisitionWorkflowStepCell({ row, value }) {
  const previewContext = resolveWorkflowPreviewContext(row);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pinned, setPinned] = useState(false);
  const closeTimerRef = useRef(null);
  const open = Boolean(anchorEl);
  const { data, loading, error, load } = useApprovalWorkflowPreview(
    previewContext?.documentType,
    previewContext?.documentId
  );

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (open && previewContext?.documentId) {
      load();
    }
  }, [open, previewContext?.documentId, previewContext?.documentType, load]);

  const handleOpen = (event) => {
    clearCloseTimer();
    setAnchorEl(event.currentTarget);
  };

  const scheduleClose = () => {
    clearCloseTimer();

    if (pinned) {
      return;
    }

    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 120);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    clearCloseTimer();
    setPinned((current) => !current);
    setAnchorEl(event.currentTarget);

    if (!open) {
      load();
    }
  };

  const handlePopoverClose = () => {
    setPinned(false);
    setAnchorEl(null);
  };

  const displayValue = value || "—";

  if (!previewContext) {
    return (
      <Typography
        variant="body2"
        noWrap
        sx={{
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {displayValue}
      </Typography>
    );
  }

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-label={`View approval progress for ${previewContext.documentCode}`}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        onFocus={handleOpen}
        onBlur={scheduleClose}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(event);
          }
        }}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          minWidth: 0,
          cursor: "pointer",
          borderRadius: 1,
          px: 0.5,
          mx: -0.5,
          "&:hover": {
            bgcolor: "action.hover"
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 1
          }
        }}
      >
        <AccountTreeOutlinedIcon
          sx={{ fontSize: 15, color: "primary.main", flexShrink: 0 }}
        />
        <Typography
          variant="body2"
          noWrap
          sx={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {displayValue}
        </Typography>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: "none" }}
        slotProps={{
          paper: {
            elevation: 3,
            onMouseEnter: clearCloseTimer,
            onMouseLeave: scheduleClose,
            sx: {
              pointerEvents: "auto",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              mt: 0.25
            }
          }
        }}
      >
        <RequisitionWorkflowProgressPreview
          documentCode={previewContext.documentCode}
          requisitionCode={previewContext.documentCode}
          row={row}
          context={data}
          loading={loading}
          error={error}
        />
      </Popover>
    </>
  );
}

export default RequisitionWorkflowStepCell;

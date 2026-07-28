import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

/**
 * Read-only resume preview dialog.
 *
 * Reuses the existing iframe pattern (CandidateIntakePage) with
 * #toolbar=0&navpanes=0 so the browser PDF viewer chrome (download/print)
 * is not surfaced. Scrolling is allowed; zoom is whatever the embedded
 * viewer already supports. No download / print / upload / edit actions.
 */
function ResumePreviewDialog({ open, onClose, resumeUrl, title = "Resume" }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { height: { xs: "90vh", sm: "85vh" }, borderRadius: 2 }
        }
      }}
    >
      <DialogTitle sx={{ p: 1.5, pl: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PictureAsPdfOutlinedIcon color="primary" fontSize="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              Resume Preview
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close resume preview">
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, bgcolor: "action.hover" }}>
        {resumeUrl ? (
          <iframe
            src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            title="Resume Preview"
            style={{
              width: "100%",
              height: "100%",
              minHeight: 480,
              border: "none",
              display: "block"
            }}
          />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No resume available for this candidate.
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ResumePreviewDialog;

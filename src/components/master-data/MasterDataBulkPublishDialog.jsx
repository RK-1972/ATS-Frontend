import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@mui/material";

function MasterDataBulkPublishDialog({
  open,
  phase,
  selectedCount,
  entityLabel,
  failed = [],
  onClose,
  onConfirm
}) {
  const isResult = phase === "result";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isResult ? "Bulk publish results" : "Publish selected drafts"}
      </DialogTitle>

      <DialogContent>
        {isResult ? (
          <>
            {failed.length ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Some records could not be published. Successful records are now published.
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                All selected draft records were published.
              </Alert>
            )}

            {failed.length ? (
              <List dense disablePadding>
                {failed.map((item) => (
                  <ListItem key={item.id} disableGutters sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={item.id}
                      secondary={item.message}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : null}
          </>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              You are about to publish{" "}
              <strong>{selectedCount}</strong>{" "}
              draft {entityLabel.toLowerCase()} record{selectedCount === 1 ? "" : "s"}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Publishing makes the selected records available to enterprise modules according
              to the existing master data lifecycle. Each record is validated independently.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        {isResult ? (
          <Button onClick={onClose} variant="contained" sx={{ fontWeight: 600 }}>
            Close
          </Button>
        ) : (
          <>
            <Button onClick={onClose} sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              variant="contained"
              sx={{ fontWeight: 600 }}
            >
              Publish Selected ({selectedCount})
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default MasterDataBulkPublishDialog;
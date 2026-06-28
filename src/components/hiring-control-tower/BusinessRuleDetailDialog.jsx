import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Chip,
  Stack,
  IconButton
} from "@mui/material";

import { MdClose } from "react-icons/md";

function BusinessRuleDetailDialog({ ruleName, details, open, onClose }) {

  if (!details) return null;

  return (

    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          fontSize: 15
        }}
      >

        {ruleName}

        <IconButton size="small" onClick={onClose}>
          <MdClose size={18} />
        </IconButton>

      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 2 }}>

        <Stack spacing={1.25}>

          <Chip
            label={details.category}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ alignSelf: "flex-start", fontWeight: 600 }}
          />

          <BoxRow label="Trigger" value={details.trigger} />
          <BoxRow label="Condition" value={details.condition} />
          <BoxRow label="Action" value={details.action} />

        </Stack>

      </DialogContent>

    </Dialog>

  );

}

function BoxRow({ label, value }) {

  return (

    <div>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="body2" fontSize={13}>
        {value}
      </Typography>
    </div>

  );

}

export default BusinessRuleDetailDialog;

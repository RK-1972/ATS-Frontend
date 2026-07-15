import {
  Card,
  CardContent,
  CardActions,
  Stack,
  Typography,
  Chip,
  Button,
  Divider
} from "@mui/material";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

function CandidateOwnershipCard({
  ownerDisplayName = "—",
  isOwner = false,
  pendingRequest = false,
  mapping = {},
  onRequestOwnership,
  onMapRequisition
}) {
  const isAssigned = Boolean(mapping?.req_id);

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (theme) => theme.shadows[1]
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.25}>
          <PersonOutlineOutlinedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Ownership
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Current Owner
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {ownerDisplayName}
            </Typography>
            <Chip
              size="small"
              color={
                isOwner
                  ? "success"
                  : pendingRequest
                    ? "warning"
                    : "info"
              }
              label={
                isOwner
                  ? "You are the Owner"
                  : pendingRequest
                    ? "Ownership Transfer Pending"
                    : "Owned by Recruiter"
              }
              sx={{ alignSelf: "flex-start", fontWeight: 600, height: 22, mt: 0.25 }}
            />
          </Stack>

          <Divider sx={{ my: 0.25 }} />

          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Talent Pool Status
            </Typography>
            <Chip
              size="small"
              color="success"
              label="Available"
              sx={{ alignSelf: "flex-start", fontWeight: 600, height: 22, mt: 0.25 }}
            />
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: "flex-end" }}>
        {isOwner ? (
          <Button
            variant="contained"
            disabled={isAssigned}
            onClick={onMapRequisition}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              height: 40,
              minHeight: 40,
              py: 0,
              px: 2
            }}
          >
            {isAssigned ? "Already Assigned" : "Map to Requisition"}
          </Button>
        ) : pendingRequest ? (
          <Button
            variant="contained"
            disabled
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              height: 40,
              minHeight: 40,
              py: 0,
              px: 2
            }}
          >
            Ownership Request Submitted
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onRequestOwnership}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              height: 40,
              minHeight: 40,
              py: 0,
              px: 2
            }}
          >
            Request Ownership
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default CandidateOwnershipCard;

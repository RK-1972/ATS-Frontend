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
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";

function CandidateOwnershipCard({
  ownerDisplayName = "—",
  isOwner = false,
  pendingRequest = false,
  mapping = {},
  candidateContainer = "",
  ownerEmployeeCode = null,
  onRequestOwnership,
  onMapRequisition,
  onReturnToTalentPool
}) {
  const isAssigned = Boolean(mapping?.req_id);
  const container = String(candidateContainer || "").trim().toUpperCase();
  const hasOwner = Boolean(
    ownerEmployeeCode !== null &&
      ownerEmployeeCode !== undefined &&
      String(ownerEmployeeCode).trim() !== ""
  );

  const isTalentPoolShared =
    container === "TALENT_POOL" && !hasOwner;

  const canRequestOwnership =
    container === "PIPELINE" &&
    hasOwner &&
    !isOwner &&
    !pendingRequest;

  const canReturnToTalentPool =
    container === "PIPELINE" &&
    isOwner &&
    !isAssigned;

  const displayOwnerName = isTalentPoolShared
    ? "None"
    : ownerDisplayName || "—";

  const mapRequisitionButton = (
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
  );

  const returnToTalentPoolButton = (
    <Button
      variant="outlined"
      color="primary"
      onClick={onReturnToTalentPool}
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
      Return to Talent Pool
    </Button>
  );

  let primaryAction = mapRequisitionButton;

  if (isTalentPoolShared) {
    primaryAction = mapRequisitionButton;
  } else if (canReturnToTalentPool) {
    primaryAction = (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {mapRequisitionButton}
        {returnToTalentPoolButton}
      </Stack>
    );
  } else if (isOwner) {
    primaryAction = mapRequisitionButton;
  } else if (pendingRequest) {
    primaryAction = (
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
    );
  } else if (canRequestOwnership) {
    primaryAction = (
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
    );
  }

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
          <EnterpriseModuleIcon
            icon={PersonOutlineOutlinedIcon}
            module="recruitment"
            density="sm"
            size={28}
            iconSize={16}
          />
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
              {displayOwnerName}
            </Typography>

            {isTalentPoolShared ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                Shared Enterprise Candidate
              </Typography>
            ) : null}

            {isOwner && !isTalentPoolShared ? (
              <Chip
                size="small"
                color="success"
                label="You are the Owner"
                sx={{ alignSelf: "flex-start", fontWeight: 600, height: 22, mt: 0.25 }}
              />
            ) : null}

            {pendingRequest && !isTalentPoolShared && !isOwner ? (
              <Chip
                size="small"
                color="warning"
                label="Ownership Transfer Pending"
                sx={{ alignSelf: "flex-start", fontWeight: 600, height: 22, mt: 0.25 }}
              />
            ) : null}
          </Stack>

          {!isTalentPoolShared ? (
            <>
              <Divider sx={{ my: 0.25 }} />

              <Stack spacing={0.25}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Talent Pool Status
                </Typography>
                <Chip
                  size="small"
                  color="success"
                  label="Available"
                  sx={{
                    alignSelf: "flex-start",
                    fontWeight: 600,
                    height: 22,
                    mt: 0.25
                  }}
                />
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: "flex-end" }}>
        {primaryAction}
      </CardActions>
    </Card>
  );
}

export default CandidateOwnershipCard;

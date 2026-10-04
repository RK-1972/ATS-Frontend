import { Box, Typography } from "@mui/material";

import {
  formatPersonIdentity,
  getCandidateDisplayName,
  splitPersonIdentity
} from "@/enterprise/candidateWorkspaceUtils";

function PersonIdentityText({
  name,
  id,
  candidate,
  variant = "body2",
  fontWeight = 600,
  noWrap = false,
  align = "inherit",
  primarySx = {},
  idSx = {}
}) {
  const identity = candidate
    ? splitPersonIdentity(
        getCandidateDisplayName(candidate),
        candidate.candidate_code || candidate.candidate_id
      )
    : splitPersonIdentity(name, id);

  const tooltip = formatPersonIdentity(
    candidate ? getCandidateDisplayName(candidate) : name,
    candidate ? candidate.candidate_code || candidate.candidate_id : id
  );

  if (!identity.primary) {
    return (
      <Typography variant={variant} color="text.secondary" fontWeight={fontWeight} sx={primarySx}>
        —
      </Typography>
    );
  }

  return (
    <Box
      component="span"
      title={tooltip}
      sx={{
        display: noWrap ? "block" : "inline",
        minWidth: 0,
        maxWidth: "100%",
        textAlign: align,
        ...(noWrap
          ? {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }
          : {})
      }}
    >
      <Typography
        component="span"
        variant={variant}
        fontWeight={fontWeight}
        color="text.primary"
        sx={primarySx}
      >
        {identity.primary}
      </Typography>
      {identity.secondary ? (
        <>
          {" "}
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500, ...idSx }}
          >
            ({identity.secondary})
          </Typography>
        </>
      ) : null}
    </Box>
  );
}

export default PersonIdentityText;

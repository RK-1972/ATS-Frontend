import { Box, Chip, Stack, Typography } from "@mui/material";
import { MdBolt } from "react-icons/md";
import { DESIGN } from "./recruiterHomeTokens";

function RecruiterOpsHeader({ actionCount = 0 }) {
  return (
    <Box sx={{ mb: 0.5, flexShrink: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.2,
            color: DESIGN.textPrimary,
            letterSpacing: "-0.02em"
          }}
        >
          Recruiter Operations
        </Typography>
        <Chip
          icon={<MdBolt size={14} color={DESIGN.blue} />}
          label="Actions Today"
          size="small"
          sx={{
            height: 26,
            fontSize: 12,
            fontWeight: 600,
            bgcolor: DESIGN.blueBg,
            color: DESIGN.blue,
            border: `1px solid #B2DDFF`,
            "& .MuiChip-icon": { ml: 0.75 }
          }}
        />
      </Stack>
      <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary, lineHeight: 1.4 }}>
        Your workspace for managing candidates and requisitions
        {actionCount > 0 ? ` · ${actionCount} action${actionCount === 1 ? "" : "s"} pending` : ""}
      </Typography>
    </Box>
  );
}

export default RecruiterOpsHeader;

import {
  Box,
  Typography,
  Chip,
  Stack
} from "@mui/material";

import { MdHub } from "react-icons/md";

function DependencyPanel({ usedBy = [], recordName }) {

  return (

    <Box>

      <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
        <MdHub size={18} style={{ opacity: 0.9 }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Used By
        </Typography>
      </Stack>

      {recordName && (
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          {recordName} is referenced by the following enterprise modules.
        </Typography>
      )}

      {!usedBy.length ? (
        <Typography variant="body2" color="text.secondary">
          No downstream dependencies recorded for this entity type.
        </Typography>
      ) : (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {usedBy.map((module) => (
            <Chip
              key={module}
              label={module}
              size="small"
              variant="outlined"
              color="primary"
              sx={{
                fontWeight: 600,
                height: 24,
                fontSize: 11
              }}
            />
          ))}
        </Stack>
      )}

    </Box>

  );

}

export default DependencyPanel;

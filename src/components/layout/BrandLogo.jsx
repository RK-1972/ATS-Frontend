import React from "react";

import {

  Box,

  Typography

} from "@mui/material";

import OptalynxLogo from "../../assets/OptalynxLogo";

function BrandLogo({ compact = false, showTagline }) {
  const shouldShowTagline = showTagline ?? !compact;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 0.75 : 1.8,
        minWidth: 0,
        flexShrink: 0
      }}
    >
      <Box sx={{ flexShrink: 0, lineHeight: 0 }}>
        <OptalynxLogo size={compact ? 32 : 56} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: compact ? 15 : 30,
            letterSpacing: compact ? 0.5 : 2,
            lineHeight: 1,
            whiteSpace: "nowrap"
          }}
        >
          OPTALYNX
        </Typography>

        {shouldShowTagline ? (
          <Typography
            sx={{
              color: "#DBEAFE",
              fontSize: compact ? 10 : 13,
              mt: compact ? 0.15 : 0.4,
              lineHeight: 1.25,
              whiteSpace: compact ? "normal" : "nowrap",
              maxWidth: compact ? "min(100vw - 120px, 280px)" : "none"
            }}
          >
            Linking Talent with Opportunity
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default BrandLogo;
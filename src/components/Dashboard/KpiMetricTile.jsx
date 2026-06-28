import React from "react";

import { Card, CardContent, Typography, Box } from "@mui/material";

function KpiMetricTile({

  label,
  value,
  subtitle,
  highlight = false,
  placeholder = false

}) {

  const displayValue =
    value === null || value === undefined
      ? "—"
      : String(value).padStart(2, "0");

  return (

    <Card

      elevation={0}

      sx={{

        height: "100%",
        borderRadius: 3,
        border: 2,
        borderColor: highlight ? "primary.main" : "divider",
        bgcolor: highlight ? "rgba(31, 59, 99, 0.04)" : "background.paper",
        opacity: placeholder ? 0.85 : 1

      }}

    >

      <CardContent sx={{ p: 2.5 }}>

        <Typography

          variant="h4"

          fontWeight={800}

          color={highlight ? "primary.main" : "text.primary"}

          lineHeight={1}

        >

          {displayValue}

        </Typography>

        <Typography variant="subtitle2" fontWeight={700} mt={1.5}>

          {label}

        </Typography>

        {subtitle && (

          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>

            {subtitle}

          </Typography>

        )}

        {placeholder && (

          <Box

            sx={{

              mt: 1.5,
              pt: 1,
              borderTop: 1,
              borderColor: "divider"

            }}

          >

            <Typography variant="caption" color="text.disabled">

              Coming soon

            </Typography>

          </Box>

        )}

      </CardContent>

    </Card>

  );

}

export default KpiMetricTile;

import React from "react";

import { Box, Typography } from "@mui/material";

function DashboardSection({ title, subtitle, children, action }) {

  return (

    <Box component="section" sx={{ mb: 4 }}>

      <Box

        sx={{

          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
          gap: 2

        }}

      >

        <Box>

          <Typography variant="h6" fontWeight={700} color="text.primary">

            {title}

          </Typography>

          {subtitle && (

            <Typography variant="body2" color="text.secondary" mt={0.5}>

              {subtitle}

            </Typography>

          )}

        </Box>

        {action}

      </Box>

      {children}

    </Box>

  );

}

export default DashboardSection;

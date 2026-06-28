import React from "react";

import {

  Box,

  Typography,

  Stack,

  Chip

} from "@mui/material";

import WavingHandOutlinedIcon from "@mui/icons-material/WavingHandOutlined";

function DashboardHeader({

  loggedInUser,

  title = "Recruiter Command Center"

}) {

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";

  else if (hour < 17) greeting = "Good Afternoon";

  return (

    <Box
      mb={4}
    >

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >

        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
          >

            {greeting},{" "}

            {loggedInUser?.full_name?.split(" ")[0] || "User"}

            <WavingHandOutlinedIcon
              sx={{
                ml:1,
                color:"#f39c12"
              }}
            />

          </Typography>

          <Typography
            mt={1}
            color="text.secondary"
          >

            Welcome back to OPTALYNX.

          </Typography>

        </Box>

        <Chip

          label={title}

          color="primary"

          sx={{

            px:2,

            py:2.5,

            fontWeight:600

          }}

        />

      </Stack>

    </Box>

  );

}

export default DashboardHeader;
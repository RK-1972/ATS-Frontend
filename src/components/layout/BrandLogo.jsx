import React from "react";

import {

  Box,

  Typography

} from "@mui/material";

import OptalynxLogo from "../../assets/OptalynxLogo";

function BrandLogo() {

  return (

    <Box

      sx={{

        display:"flex",

        alignItems:"center",

        gap:1.8

      }}

    >

      <OptalynxLogo

        size={56}

      />

      <Box>

        <Typography

          sx={{

            color:"#FFFFFF",

            fontWeight:700,

            fontSize:30,

            letterSpacing:2,

            lineHeight:1

          }}

        >

          OPTALYNX

        </Typography>

        <Typography

          sx={{

            color:"#DBEAFE",

            fontSize:13,

            mt:.4

          }}

        >

          Linking Talent with Opportunity

        </Typography>

      </Box>

    </Box>

  );

}

export default BrandLogo;
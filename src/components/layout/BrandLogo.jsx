import React from "react";

import {

  Box,

  Typography

} from "@mui/material";

import OptalynxLogo from "../../assets/OptalynxLogo";

function BrandLogo({ compact = false }) {

  return (

    <Box

      sx={{

        display:"flex",

        alignItems:"center",

        gap: compact ? 1 : 1.8

      }}

    >

      <OptalynxLogo

        size={compact ? 40 : 56}

      />

      <Box>

        <Typography

          sx={{

            color:"#FFFFFF",

            fontWeight:700,

            fontSize: compact ? 20 : 30,

            letterSpacing: compact ? 1.2 : 2,

            lineHeight:1

          }}

        >

          OPTALYNX

        </Typography>

        {!compact ? (
        <Typography

          sx={{

            color:"#DBEAFE",

            fontSize:13,

            mt:.4

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
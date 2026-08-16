import {

  Box,

  Chip,

  Typography

} from "@mui/material";



import ReportChipWrap from "./ReportChipWrap";
import reportChipSx from "./reportChipTokens";



function ReportGroupBuilder({ groupableFields, groupByCodes, onToggleGroupField }) {

  if (!groupableFields.length) {

    return null;

  }



  return (

    <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>

      <Typography

        variant="caption"

        sx={{

          color: "text.secondary",

          fontWeight: 700,

          letterSpacing: 0.6,

          textTransform: "uppercase",

          display: "block",

          mb: 1

        }}

      >

        Group By

      </Typography>



      <ReportChipWrap>

        {groupableFields.map((field) => {

          const selected = groupByCodes.includes(field.code);



          return (

            <Chip

              key={field.code}

              label={field.label}

              size="small"

              color={selected ? "primary" : "default"}

              variant={selected ? "filled" : "outlined"}

              onClick={() => onToggleGroupField(field.code)}

              aria-pressed={selected}

              sx={reportChipSx}

            />

          );

        })}

      </ReportChipWrap>



      {groupByCodes.length > 0 ? (

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>

          All selected output fields must be included in group by.

        </Typography>

      ) : null}

    </Box>

  );

}



export default ReportGroupBuilder;


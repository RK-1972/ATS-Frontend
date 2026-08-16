import {

  Box,

  Chip,

  Typography

} from "@mui/material";



import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";



import ReportFieldSelector from "./ReportFieldSelector";

import ReportChipWrap from "./ReportChipWrap";
import reportChipSx from "./reportChipTokens";



function ReportSelectedFields({ fields, selectedFieldCodes, onRemoveField, onAddField }) {

  const selectedFields = selectedFieldCodes

    .map((code) => fields.find((field) => field.code === code))

    .filter(Boolean);



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

        Selected Fields

      </Typography>



      <ReportChipWrap>

        {selectedFields.map((field) => (

          <Chip

            key={field.code}

            label={`${field.label} · ${field.data_type}`}

            size="small"

            onDelete={() => onRemoveField(field.code)}

            deleteIcon={<CloseOutlinedIcon aria-label={`Remove ${field.label}`} />}

            sx={reportChipSx}

          />

        ))}



        <Box component="span" sx={{ flexShrink: 0, display: "inline-flex" }}>

          <ReportFieldSelector

            fields={fields}

            selectedFieldCodes={selectedFieldCodes}

            onAddField={onAddField}

          />

        </Box>

      </ReportChipWrap>



      {selectedFields.length === 0 ? (

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 13 }}>

          Select at least one field to generate a report.

        </Typography>

      ) : null}

    </Box>

  );

}



export default ReportSelectedFields;


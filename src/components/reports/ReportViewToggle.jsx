import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";

function ReportViewToggle({ value, onChange }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_event, nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
      sx={{
        "& .MuiToggleButton-root": {
          textTransform: "none",
          fontWeight: 600,
          px: 1.5
        }
      }}
    >
      <ToggleButton value="visual">
        <BarChartOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
        Visual
      </ToggleButton>
      <ToggleButton value="table">
        <TableRowsOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
        Table
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ReportViewToggle;

import {

  Box,

  Typography,

  Stack,

  LinearProgress

} from "@mui/material";



import ConfigSurface from "../platform-config/ConfigSurface";

import { formatCurrency } from "@/utils/formatCurrency";



function DepartmentUtilizationChart({ departments }) {



  return (



    <ConfigSurface>



      <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>

        Department-wise utilization

      </Typography>



      <Box

        sx={{

          display: "grid",

          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },

          gap: 1.5

        }}

      >



        {departments.map((dept) => (



          <Box key={dept.department}>



            <Stack direction="row" justifyContent="space-between" mb={0.25}>



              <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>

                {dept.department}

              </Typography>



              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>

                {dept.pct}%

              </Typography>



            </Stack>



            <LinearProgress

              variant="determinate"

              value={dept.pct}

              color={dept.pct > 85 ? "warning" : "primary"}

              sx={{ height: 6, borderRadius: 1, mb: 0.25 }}

            />



            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>

              {formatCurrency(dept.utilized)} of {formatCurrency(dept.approved)}

            </Typography>



          </Box>



        ))}



      </Box>



    </ConfigSurface>



  );



}



export default DepartmentUtilizationChart;



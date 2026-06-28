import { Box, Typography, Stack } from "@mui/material";



import ConfigSurface from "../platform-config/ConfigSurface";

import { formatCurrency } from "@/utils/formatCurrency";



function BudgetTrendChart({ monthlyTrend }) {



  const maxValue = Math.max(

    ...monthlyTrend.flatMap((m) => [m.budget, m.actual])

  );



  return (



    <ConfigSurface sx={{ height: "100%" }}>



      <Typography variant="body2" fontWeight={700} sx={{ fontSize: 14 }}>

        Budget vs actual (monthly)

      </Typography>



      <Stack

        direction="row"

        spacing={0.75}

        alignItems="flex-end"

        sx={{ height: 140, mt: 1.5, px: 0.5 }}

      >



        {monthlyTrend.map((month) => {



          const budgetHeight = (month.budget / maxValue) * 100;

          const actualHeight = (month.actual / maxValue) * 100;



          return (



            <Box

              key={month.month}

              sx={{

                flex: 1,

                display: "flex",

                flexDirection: "column",

                alignItems: "center",

                gap: 0.25

              }}

            >



              <Box

                sx={{

                  display: "flex",

                  alignItems: "flex-end",

                  gap: 0.25,

                  height: 110,

                  width: "100%",

                  justifyContent: "center"

                }}

              >



                <Box

                  sx={{

                    width: "42%",

                    height: `${budgetHeight}%`,

                    bgcolor: "rgba(31, 59, 99, 0.2)",

                    borderRadius: "3px 3px 0 0",

                    minHeight: 3

                  }}

                  title={`Budget: ${formatCurrency(month.budget)}`}

                />



                <Box

                  sx={{

                    width: "42%",

                    height: `${actualHeight}%`,

                    bgcolor: "primary.main",

                    borderRadius: "3px 3px 0 0",

                    minHeight: 3

                  }}

                  title={`Actual: ${formatCurrency(month.actual)}`}

                />



              </Box>



              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>

                {month.month}

              </Typography>



            </Box>



          );



        })}



      </Stack>



      <Stack direction="row" spacing={2} mt={1} justifyContent="center">



        <Stack direction="row" spacing={0.5} alignItems="center">

          <Box sx={{ width: 10, height: 10, bgcolor: "rgba(31,59,99,0.2)", borderRadius: 0.5 }} />

          <Typography variant="caption" sx={{ fontSize: 11 }}>Budget</Typography>

        </Stack>



        <Stack direction="row" spacing={0.5} alignItems="center">

          <Box sx={{ width: 10, height: 10, bgcolor: "primary.main", borderRadius: 0.5 }} />

          <Typography variant="caption" sx={{ fontSize: 11 }}>Actual</Typography>

        </Stack>



      </Stack>



    </ConfigSurface>



  );



}



export default BudgetTrendChart;



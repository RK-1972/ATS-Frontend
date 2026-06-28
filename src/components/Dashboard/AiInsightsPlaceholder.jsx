import React from "react";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip
} from "@mui/material";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

const PLACEHOLDER_INSIGHTS = [
  {
    id: "pipeline-health",
    title: "Pipeline Health",
    description: "AI will summarize bottlenecks across your active requisitions.",
    icon: TrendingUpOutlinedIcon
  },
  {
    id: "priority-actions",
    title: "Priority Actions",
    description: "OpenAI will recommend candidates and reqs needing attention today.",
    icon: LightbulbOutlinedIcon
  },
  {
    id: "hiring-forecast",
    title: "Hiring Forecast",
    description: "Predictive fill-rate and time-to-hire insights will appear here.",
    icon: AutoAwesomeOutlinedIcon
  }
];

function AiInsightsPlaceholder() {

  return (

    <Grid container spacing={2}>

      {PLACEHOLDER_INSIGHTS.map((insight) => {

        const Icon = insight.icon;

        return (

          <Grid key={insight.id} size={{ xs: 12, md: 4 }}>

            <Card

              elevation={0}

              sx={{

                height: "100%",
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "secondary.main",
                bgcolor: "rgba(243, 156, 18, 0.04)"

              }}

            >

              <CardContent sx={{ p: 2.5 }}>

                <Box display="flex" alignItems="center" gap={1} mb={1.5}>

                  <Box

                    sx={{

                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "rgba(243, 156, 18, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "secondary.main"

                    }}

                  >

                    <Icon fontSize="small" />

                  </Box>

                  <Chip

                    label="AI Preview"

                    size="small"

                    color="secondary"

                    variant="outlined"

                    sx={{ fontWeight: 600 }}

                  />

                </Box>

                <Typography variant="subtitle1" fontWeight={700} gutterBottom>

                  {insight.title}

                </Typography>

                <Typography variant="body2" color="text.secondary">

                  {insight.description}

                </Typography>

              </CardContent>

            </Card>

          </Grid>

        );

      })}

    </Grid>

  );

}

export default AiInsightsPlaceholder;

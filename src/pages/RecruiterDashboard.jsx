import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import {
  Box,
  Container,
  Grid,
  Paper,
  Typography
} from "@mui/material";

import AppHeader from "../components/layout/AppHeader";
import RecruiterNavRail from "../components/layout/RecruiterNavRail";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardSection from "../components/Dashboard/DashboardSection";
import KpiMetricTile from "../components/Dashboard/KpiMetricTile";
import AiInsightsPlaceholder from "../components/Dashboard/AiInsightsPlaceholder";
import OptalynxLoader from "../components/OptalynxLoader";
import API from "../api/axios";

function RecruiterDashboard() {

  const navigate = useNavigate();

  const loggedInUser =
    JSON.parse(localStorage.getItem("user"));

  const userRole =
    loggedInUser?.role_name;

  const [dashboardData, setDashboardData] =
    useState({});

  const [myRequisitions, setMyRequisitions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");

  };

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const response =
          await API.get("/recruiter-dashboard");

        setDashboardData(
          response.data.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };

    const fetchRequisitions = async () => {

      try {

        const response =
          await API.get("/my-requisitions");

        setMyRequisitions(
          response.data.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };

    const loadData = async () => {

      setLoading(true);

      await Promise.all([
        fetchDashboard(),
        fetchRequisitions()
      ]);

      setLoading(false);

    };

    loadData();

  }, []);

  const executiveKpis = [
    {
      label: "My Candidates",
      value: dashboardData.my_candidates,
      highlight: true
    },
    {
      label: "My Requisitions",
      value: dashboardData.my_requisitions
    },
    {
      label: "Interviews Today",
      value: null,
      placeholder: true,
      subtitle: "Requires future API"
    },
    {
      label: "Pending Actions",
      value: null,
      placeholder: true,
      subtitle: "Requires future API"
    }
  ];

  const pipelineKpis = [
    { label: "Applied", value: dashboardData.applied },
    { label: "Screening", value: dashboardData.screening },
    { label: "L1 Interview", value: dashboardData.l1_interview },
    { label: "L2 Interview", value: dashboardData.l2_interview },
    { label: "Client Interview", value: dashboardData.client_interview },
    { label: "Offer", value: dashboardData.offer },
    { label: "Joined", value: dashboardData.joined }
  ];

  return (

    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default"
      }}
    >

      <AppHeader
        loggedInUser={loggedInUser}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <Box sx={{ display: "flex" }}>

        <RecruiterNavRail
          loggedInUser={loggedInUser}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0
          }}
        >

          <Container
            maxWidth="xl"
            sx={{
              pt: 4,
              pb: 4
            }}
          >

            <DashboardHeader
              loggedInUser={loggedInUser}
              title="Recruiter Command Center"
            />

            {loading ? (

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 10
                }}
              >

                <OptalynxLoader
                  size={48}
                  text="Loading dashboard..."
                />

              </Box>

            ) : (

              <>

                <DashboardSection
                  title="Executive Overview"
                  subtitle="What needs your attention right now"
                >

                  <Grid container spacing={2}>

                    {executiveKpis.map((kpi) => (

                      <Grid
                        key={kpi.label}
                        size={{ xs: 12, sm: 6, md: 3 }}
                      >

                        <KpiMetricTile
                          label={kpi.label}
                          value={kpi.value}
                          subtitle={kpi.subtitle}
                          highlight={kpi.highlight}
                          placeholder={kpi.placeholder}
                        />

                      </Grid>

                    ))}

                  </Grid>

                </DashboardSection>

                <DashboardSection
                  title="Recruitment Pipeline"
                  subtitle="Candidate stage distribution across your active assignments"
                >

                  <Grid container spacing={2}>

                    {pipelineKpis.map((kpi) => (

                      <Grid
                        key={kpi.label}
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 4,
                          lg: 12 / 7
                        }}
                      >

                        <KpiMetricTile
                          label={kpi.label}
                          value={kpi.value}
                        />

                      </Grid>

                    ))}

                  </Grid>

                </DashboardSection>

                <DashboardSection
                  title="AI Insights"
                  subtitle="Reserved for OpenAI-powered recruiting intelligence"
                >

                  <AiInsightsPlaceholder />

                </DashboardSection>

                <DashboardSection
                  title="Assigned Requisitions"
                  subtitle="Phase 2 — MUI DataGrid"
                >

                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: 1,
                      borderColor: "divider",
                      textAlign: "center"
                    }}
                  >

                    <Typography
                      variant="body1"
                      color="text.secondary"
                    >
                      {myRequisitions.length} requisition
                      {myRequisitions.length === 1 ? "" : "s"} loaded.
                      DataGrid table ships in Phase 2.
                    </Typography>

                  </Paper>

                </DashboardSection>

              </>

            )}

          </Container>

        </Box>

      </Box>

    </Box>

  );

}

export default RecruiterDashboard;

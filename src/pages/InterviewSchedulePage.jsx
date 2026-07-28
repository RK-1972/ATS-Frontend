import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Autocomplete,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";

import API from "../api/axios";
import masterDataClient from "../api/clients/masterDataClient";
import { getPublishedRecords } from "../enterprise/masterDataHelpers";
import AppHeader from "../components/layout/AppHeader";
import RecruiterNavRail from "../components/layout/RecruiterNavRail";
import {
  EnterpriseDataGrid,
  EnterpriseSurface,
  SearchBar,
  StatusChip
} from "../components/enterprise";

const denseFieldSx = {
  "& .MuiInputBase-root": {
    fontSize: 13
  },
  "& .MuiInputLabel-root": {
    fontSize: 13
  }
};

function InterviewSchedulePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const workspacePrefillApplied = useRef(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name;

  const [candidates, setCandidates] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [roundOptions, setRoundOptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [formData, setFormData] = useState({
    req_id: "",
    map_id: "",
    interviewer_id: "",
    round_type: "",
    interview_date: "",
    interview_time: "",
    remarks: ""
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("work_assignments");
    localStorage.removeItem("work_assignment_status");
    localStorage.removeItem("workspace");
    navigate("/login");
  };

  const fetchRequisitions = async () => {
    try {
      const response = await API.get("/my-requisitions");
      setRequisitions(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await API.get("/interview-candidates");
      setCandidates(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const response = await API.get("/active-interviewers");
      setInterviewers(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await API.get("/interview-schedules");
      setSchedules(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // EMD interview_types via the token-only bundle endpoint (per-entity route is
  // admin-only). Backend validates round_type against this master (interviewService).
  const fetchRoundOptions = async () => {
    try {
      const bundle = await masterDataClient.getAll();
      setRoundOptions(
        getPublishedRecords(bundle, "interview_types").map((record) => record.name)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const searchValue = searchText.toLowerCase();

  const filteredSchedules = schedules.filter(
    (s) =>
      (s.req_code || "").toLowerCase().includes(searchValue) ||
      (s.job_title || "").toLowerCase().includes(searchValue) ||
      (s.candidate_code || "").toLowerCase().includes(searchValue) ||
      (s.candidate_name || "").toLowerCase().includes(searchValue) ||
      (s.interviewer_name || "").toLowerCase().includes(searchValue) ||
      (s.round_type || "").toLowerCase().includes(searchValue) ||
      (s.interview_date || "").toLowerCase().includes(searchValue)
  );

  useEffect(() => {
    fetchRequisitions();
    fetchInterviewers();
    fetchRoundOptions();
    fetchSchedules();
  }, []);

  // Prefill from Enterprise Candidate Workspace deep-link (req_id + map_id).
  // Other entry points have no location.state — behaviour unchanged.
  useEffect(() => {
    const reqId = location.state?.req_id;
    const mapId = location.state?.map_id;

    if (!reqId || !mapId || workspacePrefillApplied.current) {
      return;
    }

    workspacePrefillApplied.current = true;

    let cancelled = false;

    (async () => {
      setFormData((prev) => ({
        ...prev,
        req_id: Number(reqId),
        map_id: Number(mapId)
      }));

      try {
        const response = await API.get(`/interview-candidates/${reqId}`);
        if (!cancelled) {
          setCandidates(response.data.data || []);
        }
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadCandidatesByRequisition = async (reqId) => {
    try {
      const response = await API.get(`/interview-candidates/${reqId}`);
      setCandidates(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      await API.post("/schedule-interview", {
        req_id: Number(formData.req_id),
        map_id: Number(formData.map_id),
        interviewer_id: Number(formData.interviewer_id),
        round_type: formData.round_type,
        interview_date: formData.interview_date,
        interview_time: formData.interview_time,
        remarks: formData.remarks
      });

      alert("Interview Scheduled Successfully");

      fetchSchedules();

      setFormData({
        req_id: "",
        map_id: "",
        interviewer_id: "",
        round_type: "",
        interview_date: "",
        interview_time: "",
        remarks: ""
      });
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to Schedule Interview");
    }
  };

  const candidateOptions = candidates.map((c) => ({
    value: c.map_id,
    label: `${c.candidate_code} - ${c.candidate_name}`
  }));

  const requisitionOptions = requisitions.map((r) => ({
    value: r.req_id,
    label: `${r.req_code} - ${r.job_title}`
  }));

  console.log("Requisitions:", requisitions);
  console.log("Options:", requisitionOptions);

  const scheduleColumns = [
    {
      field: "req_code",
      headerName: "Req Code",
      minWidth: 110,
      flex: 0.7
    },
    {
      field: "job_title",
      headerName: "Position",
      minWidth: 140,
      flex: 1
    },
    {
      field: "candidate_code",
      headerName: "Candidate Code",
      minWidth: 120,
      flex: 0.7
    },
    {
      field: "candidate_name",
      headerName: "Candidate Name",
      minWidth: 140,
      flex: 1
    },
    {
      field: "round_type",
      headerName: "Round",
      minWidth: 120,
      flex: 0.8
    },
    {
      field: "interviewer_name",
      headerName: "Interviewer",
      minWidth: 130,
      flex: 0.9
    },
    {
      field: "interview_date",
      headerName: "Date",
      minWidth: 100,
      width: 110
    },
    {
      field: "interview_time",
      headerName: "Time",
      minWidth: 90,
      width: 100
    },
    {
      field: "interview_status",
      headerName: "Status",
      minWidth: 110,
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <StatusChip status={params.value || "Scheduled"} variant="soft" size="small" />
      )
    },
    {
      field: "feedback_submitted",
      headerName: "Feedback",
      minWidth: 100,
      width: 110,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate(`/view-feedback/${params.row.schedule_id}`)}
            sx={{ textTransform: "none", minWidth: 0, px: 1.25, py: 0.25 }}
          >
            View
          </Button>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader
        loggedInUser={loggedInUser}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <Box sx={{ display: "flex" }}>
        <RecruiterNavRail loggedInUser={loggedInUser} />

        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "text.primary", letterSpacing: "-0.01em" }}
                >
                  Interview Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Schedule interviews for mapped candidates and track feedback status.
                </Typography>
              </Box>

              <EnterpriseSurface>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1.5, color: "text.primary" }}
                >
                  New Interview
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      size="small"
                      disableClearable
                      options={requisitionOptions}
                      getOptionLabel={(option) => option.label || ""}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      value={
                        requisitionOptions.find(
                          (option) => option.value === Number(formData.req_id)
                        ) || null
                      }
                      onChange={(_event, selected) => {
                        setFormData({
                          ...formData,
                          req_id: selected.value,
                          map_id: ""
                        });
                        loadCandidatesByRequisition(selected.value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Requisition"
                          placeholder="Search requisition…"
                          variant="outlined"
                          sx={denseFieldSx}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      size="small"
                      disableClearable
                      options={candidateOptions}
                      getOptionLabel={(option) => option.label || ""}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      value={
                        candidateOptions.find(
                          (option) => option.value === Number(formData.map_id)
                        ) || null
                      }
                      onChange={(_event, selected) => {
                        setFormData({
                          ...formData,
                          map_id: selected.value
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Candidate"
                          placeholder="Search candidate…"
                          variant="outlined"
                          sx={denseFieldSx}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" sx={denseFieldSx}>
                      <InputLabel id="interviewer-label">Interviewer</InputLabel>
                      <Select
                        labelId="interviewer-label"
                        name="interviewer_id"
                        label="Interviewer"
                        value={formData.interviewer_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">
                          <em>Select Interviewer</em>
                        </MenuItem>
                        {interviewers.map((i) => (
                          <MenuItem key={i.panel_id} value={i.panel_id}>
                            {i.interviewer_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" sx={denseFieldSx}>
                      <InputLabel id="round-label">Round</InputLabel>
                      <Select
                        labelId="round-label"
                        name="round_type"
                        label="Round"
                        value={formData.round_type}
                        onChange={handleChange}
                      >
                        <MenuItem value="">
                          <em>Select Round</em>
                        </MenuItem>
                        {roundOptions.map((round) => (
                          <MenuItem key={round} value={round}>
                            {round}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="interview_date"
                      label="Interview Date"
                      value={formData.interview_date}
                      onChange={handleChange}
                      variant="outlined"
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={denseFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      name="interview_time"
                      label="Interview Time"
                      value={formData.interview_time}
                      onChange={handleChange}
                      variant="outlined"
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={denseFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      name="remarks"
                      label="Remarks"
                      placeholder="Optional remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      multiline
                      minRows={2}
                      variant="filled"
                      sx={denseFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        startIcon={<EventAvailableOutlinedIcon />}
                        onClick={handleScheduleInterview}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          px: 2.5,
                          py: 0.75
                        }}
                      >
                        Schedule Interview
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </EnterpriseSurface>

              <Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Scheduled Interviews
                  </Typography>
                  <SearchBar
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search requisition, position, candidate, interviewer…"
                    width={360}
                  />
                </Stack>

                <EnterpriseDataGrid
                  rows={filteredSchedules}
                  columns={scheduleColumns}
                  getRowId={(row) =>
                    row.schedule_id ??
                    `${row.req_id ?? ""}-${row.candidate_code ?? ""}-${row.interview_date ?? ""}-${row.interview_time ?? ""}`
                  }
                  height={420}
                />
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default InterviewSchedulePage;

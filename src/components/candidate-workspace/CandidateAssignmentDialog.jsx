import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  Stack,
  TextField,
  Typography,
  InputAdornment
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import candidateRepository from "@/repositories/candidateRepository";

function CandidateAssignmentDialog({
  open,
  onClose,
  candidate,
  candidateId,
  onAssigned
}) {

  const [requisitions, setRequisitions] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {

    if (!open) return;

    loadRequisitions();

  }, [open]);

  async function loadRequisitions() {

    try {

      setLoading(true);
      setError("");

      const rows =
        await candidateRepository.getMyRequisitions();

      setRequisitions(rows);

    }

    catch (ex) {

      console.error(ex);

      setError(
        ex.message ||
        "Unable to load requisitions."
      );

    }

    finally {

      setLoading(false);

    }

  }

  const filteredRequisitions =
    useMemo(() => {

      const text =
        search.toLowerCase();

      return requisitions.filter((r) => {

        return (

          (r.req_code || "")
            .toLowerCase()
            .includes(text)

          ||

          (r.job_title || "")
            .toLowerCase()
            .includes(text)

        );

      });

    }, [search, requisitions]);

  async function executeAssignment() {

    if (!selectedReq) return;

    try {

      setAssigning(true);

      await candidateRepository.mapCandidateToRequisition({

        candidate_id: candidateId,

        req_id: selectedReq.req_id

      });

      setConfirmOpen(false);
      onAssigned?.();
     
      onClose();

    }

    catch (ex) {

      console.error(ex);

      setError(
        ex.response?.data?.message ||
        ex.message ||
        "Assignment failed."
      );

    }

    finally {

      setAssigning(false);

    }

}

function handleAssign() {

    if (!selectedReq) return;

    setConfirmOpen(true);

}


 return (
  <>
    <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="md"
  >

    <DialogTitle
      sx={{
        pb: 1
      }}
    >

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >

        <AssignmentTurnedInOutlinedIcon
          color="primary"
        />

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Assign Candidate to Requisition
        </Typography>

      </Stack>

    </DialogTitle>

    <Divider />

    <DialogContent
    sx={{
        py:3,
        overflow: "hidden"
    }}
>

      <TextField

        fullWidth

        size="small"

        placeholder="Search requisition..."

        value={search}

        onChange={(e) =>
          setSearch(e.target.value)
        }

        InputProps={{

          startAdornment: (

            <InputAdornment position="start">

              <SearchRoundedIcon />

            </InputAdornment>

          )

        }}

        sx={{
          mb: 2
        }}

      />

      {

        error && (

          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >

            {error}

          </Alert>

        )

      }

      {

        loading ?

        (

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5
            }}
          >

            <CircularProgress />

          </Box>

        )

        :

        (

          <List
            disablePadding
          >

            {

              filteredRequisitions.map((req) => (

                <ListItemButton

                  key={req.req_id}

                  selected={
                    selectedReq?.req_id ===
                    req.req_id
                  }

                  onClick={() =>
                    setSelectedReq(req)
                  }

                  sx={{

                    mb: 1,

                    borderRadius: 3,

                    border: "1px solid",

                    borderColor:

                      selectedReq?.req_id ===
                      req.req_id

                        ? "primary.main"

                        : "divider",

                    alignItems: "flex-start",

                    py: 1.5

                  }}

                >

                  <Radio

                    checked={

                      selectedReq?.req_id ===
                      req.req_id

                    }

                  />

                  <ListItemText

                    primary={

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                      >

                        <Typography
                          fontWeight={700}
                        >

                          {req.req_code}

                        </Typography>

                        <Typography
                          variant="caption"
                          color="primary"
                        >

                          ACTIVE

                        </Typography>

                      </Stack>

                    }

                    secondary={

                      <>

                        <Typography
                          variant="body2"
                          sx={{ mt: .4 }}
                        >

                          {req.job_title}

                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >

                          {req.location || "Bangalore"}

                        </Typography>

                      </>

                    }

                  />

                </ListItemButton>

              ))

            }

          </List>

        )

      }

    </DialogContent>

    <Divider />

    <DialogActions
      sx={{
        p: 2
      }}
    >

      <Button
        onClick={onClose}
      >
        Cancel
      </Button>

      <Button

        variant="contained"

        disabled={
          !selectedReq ||
          assigning
        }

        onClick={handleAssign}

      >

        {

          assigning ?

          "Assigning..."

          :

          "Assign Candidate"

        }

      </Button>

    </DialogActions>

  </Dialog>
<Dialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 4
    }
  }}
>

  <DialogTitle
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      pb: 1
    }}
  >
    <AssignmentTurnedInOutlinedIcon color="primary" />

    <Box>

      <Typography variant="h6" fontWeight={700}>
        Assign Candidate
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Review the details before continuing.
      </Typography>

    </Box>

  </DialogTitle>

  <Divider />

  <DialogContent sx={{ py: 3 }}>

    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 3,
        mb: 2
      }}
    >

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
      >

        <Avatar sx={{ bgcolor: "primary.main" }}>
          <PersonOutlineRoundedIcon />
        </Avatar>

        <Box>

          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
          >
            CANDIDATE
          </Typography>

          <Typography
          fontWeight={700}
          variant="h6"
      >
          {`${candidate?.first_name || ""} ${candidate?.last_name || ""}`.trim()}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
            >
                {candidate?.candidate_code}
            </Typography>

        </Box>

      </Stack>

    </Paper>

    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 3,
        mb: 2
      }}
    >

      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
      >

        <Avatar
          sx={{
            bgcolor: "success.main"
          }}
        >
          <WorkOutlineRoundedIcon />
        </Avatar>

        <Box>

          <Typography
            variant="overline"
            color="text.secondary"
          >
            Requisition
          </Typography>

          <Typography fontWeight={700}>
            {selectedReq?.req_code}
          </Typography>

          <Typography>
            {selectedReq?.job_title}
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            mt={0.5}
          >

            <PlaceOutlinedIcon
              sx={{ fontSize: 16 }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {selectedReq?.location || "Bangalore"}
            </Typography>

          </Stack>

        </Box>

      </Stack>

    </Paper>

    <Paper
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: "warning.50",
        border: 1,
        borderColor: "warning.light"
      }}
    >

      <Stack
        direction="row"
        spacing={1.5}
      >

        <WarningAmberRoundedIcon
          color="warning"
        />

        <Typography variant="body2">

          Please verify that the selected candidate is
          being assigned to the correct requisition.

        </Typography>

      </Stack>

    </Paper>

  </DialogContent>

  <Divider />

  <DialogActions sx={{ p: 2 }}>

    <Button
      disabled={assigning}
      onClick={() => setConfirmOpen(false)}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      disabled={assigning}
      onClick={executeAssignment}
      startIcon={
        assigning
          ? <CircularProgress size={18} color="inherit" />
          : <AssignmentTurnedInOutlinedIcon />
      }
    >
      {assigning
        ? "Assigning..."
        : "Confirm Candidate Assignment"}
    </Button>

  </DialogActions>

</Dialog>

</>

);

}

export default CandidateAssignmentDialog;
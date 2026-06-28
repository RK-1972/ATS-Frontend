import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Stack,
  Divider
} from "@mui/material";

import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";

import useEnterpriseStore from "@/store/enterpriseStore";
import {
  getMasterDataOptions,
  getPublishedRecordNames
} from "@/enterprise/masterDataHelpers";

const FALLBACK_DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Operations",
  "Finance"
];

const FALLBACK_GRADES = [
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
  "G11",
  "G12"
];

const FALLBACK_LOCATIONS = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune"
];

const FALLBACK_EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Intern"
];

function mergeOptions(primary, fallback) {
  if (!primary.length) {
    return fallback;
  }
  return [...new Set([...primary, ...fallback])];
}

function RuleSimulatorPanel({

  input,
  result,
  onUpdateInput,
  onRun

}) {

  const masterData = useEnterpriseStore((state) => state.masterData);

  const DEPARTMENTS = mergeOptions(
    getPublishedRecordNames(masterData, "departments"),
    FALLBACK_DEPARTMENTS
  );

  const GRADES = getMasterDataOptions(masterData, "grades", FALLBACK_GRADES);

  const LOCATIONS = mergeOptions(
    getPublishedRecordNames(masterData, "cities"),
    FALLBACK_LOCATIONS
  );

  const EMPLOYMENT_TYPES = mergeOptions(
    getPublishedRecordNames(masterData, "employment_types"),
    FALLBACK_EMPLOYMENT_TYPES
  );

  return (

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 2
      }}
    >

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper"
        }}
      >

        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          Simulation Input
        </Typography>

        <Stack spacing={1.5}>

          <TextField
            label="Offered Salary (LPA)"
            type="number"
            size="small"
            fullWidth
            value={input.offered_salary_lpa}
            onChange={(e) =>
              onUpdateInput(
                "offered_salary_lpa",
                Number(e.target.value)
              )
            }
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={input.department}
              onChange={(e) =>
                onUpdateInput("department", e.target.value)
              }
            >
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Grade</InputLabel>
            <Select
              label="Grade"
              value={input.grade}
              onChange={(e) =>
                onUpdateInput("grade", e.target.value)
              }
            >
              {GRADES.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              label="Location"
              value={input.location}
              onChange={(e) =>
                onUpdateInput("location", e.target.value)
              }
            >
              {LOCATIONS.map((l) => (
                <MenuItem key={l} value={l}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Employment Type</InputLabel>
            <Select
              label="Employment Type"
              value={input.employment_type}
              onChange={(e) =>
                onUpdateInput("employment_type", e.target.value)
              }
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PlayArrowOutlinedIcon />}
            onClick={onRun}
            sx={{ alignSelf: "flex-start", fontWeight: 600 }}
          >
            Run simulation
          </Button>

        </Stack>

      </Box>

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          bgcolor: result
            ? "rgba(31, 59, 99, 0.02)"
            : "background.paper"
        }}
      >

        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          Simulation Output
        </Typography>

        {!result ? (
          <Typography variant="body2" color="text.secondary">
            Configure input parameters and run simulation to preview
            triggered rules, approvers, and notifications.
          </Typography>
        ) : (
          <Stack spacing={1.5}>

            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
              >
                Triggered Rules
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={0.5}>
                {result.triggered_rules.map((rule) => (
                  <Chip
                    key={rule}
                    label={rule}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
              >
                Approvers
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={0.5}>
                {result.approvers.map((approver) => (
                  <Chip
                    key={approver}
                    label={approver}
                    size="small"
                    variant="outlined"
                    sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
              >
                Notifications
              </Typography>
              <Stack spacing={0.5} mt={0.5}>
                {result.notifications.map((note) => (
                  <Typography key={note} variant="caption">
                    • {note}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
              >
                Estimated SLA
              </Typography>
              <Typography variant="body2" fontWeight={700} mt={0.5}>
                {result.estimated_sla}
              </Typography>
            </Box>

          </Stack>
        )}

      </Box>

    </Box>

  );

}

export default RuleSimulatorPanel;

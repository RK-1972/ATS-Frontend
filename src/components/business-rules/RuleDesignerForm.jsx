import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Button,
  Divider
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const CATEGORIES = [
  "Recruitment",
  "Requisition",
  "Interview",
  "Offer",
  "Vendor",
  "Budget",
  "Notifications",
  "AI"
];

const PRIORITIES = ["High", "Medium", "Low"];

const STATUSES = ["Draft", "Pending Approval", "Active"];

function RuleDesignerForm({

  rule,
  onUpdate,
  onUpdateList,
  onAddListItem,
  onSave

}) {

  if (!rule) {
    return (
      <Typography variant="body2" color="text.secondary">
        Select a rule from the library or create a new rule to begin designing.
      </Typography>
    );
  }

  return (

    <Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        mb={2}
      >

        <TextField
          label="Rule Name"
          size="small"
          fullWidth
          value={rule.name}
          onChange={(e) => onUpdate("name", e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={rule.category}
            onChange={(e) => onUpdate("category", e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            label="Priority"
            value={rule.priority}
            onChange={(e) => onUpdate("priority", e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={rule.status}
            onChange={(e) => onUpdate("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip
          label={`v${rule.version}`}
          size="small"
          variant="outlined"
          sx={{ alignSelf: "center", fontWeight: 600 }}
        />

      </Stack>

      <TextField
        label="Description"
        size="small"
        fullWidth
        multiline
        minRows={2}
        value={rule.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Trigger Event"
        size="small"
        fullWidth
        value={rule.trigger_event}
        onChange={(e) => onUpdate("trigger_event", e.target.value)}
        sx={{ mb: 2 }}
      />

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2
        }}
      >

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 1.5,
            bgcolor: "rgba(31, 59, 99, 0.02)"
          }}
        >

          <Typography
            variant="caption"
            fontWeight={700}
            color="primary.main"
            textTransform="uppercase"
            letterSpacing={0.5}
          >
            When — Conditions
          </Typography>

          <Stack spacing={1} mt={1}>

            {rule.conditions.map((condition, index) => (

              <TextField
                key={`cond-${index}`}
                size="small"
                fullWidth
                placeholder="Enter condition"
                value={condition}
                onChange={(e) =>
                  onUpdateList("conditions", index, e.target.value)
                }
              />

            ))}

            <Button
              size="small"
              startIcon={<AddOutlinedIcon />}
              onClick={() => onAddListItem("conditions")}
              sx={{ alignSelf: "flex-start", fontWeight: 600 }}
            >
              Add condition
            </Button>

          </Stack>

        </Box>

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 1.5,
            bgcolor: "rgba(243, 156, 18, 0.04)"
          }}
        >

          <Typography
            variant="caption"
            fontWeight={700}
            color="secondary.main"
            textTransform="uppercase"
            letterSpacing={0.5}
          >
            Then — Actions
          </Typography>

          <Stack spacing={1} mt={1}>

            {rule.actions.map((action, index) => (

              <TextField
                key={`act-${index}`}
                size="small"
                fullWidth
                placeholder="Enter action"
                value={action}
                onChange={(e) =>
                  onUpdateList("actions", index, e.target.value)
                }
              />

            ))}

            <Button
              size="small"
              startIcon={<AddOutlinedIcon />}
              onClick={() => onAddListItem("actions")}
              sx={{ alignSelf: "flex-start", fontWeight: 600 }}
            >
              Add action
            </Button>

          </Stack>

        </Box>

      </Box>

      <Stack direction="row" spacing={1} mt={2}>

        <Button
          variant="contained"
          size="small"
          onClick={onSave}
        >
          Save rule draft
        </Button>

      </Stack>

    </Box>

  );

}

export default RuleDesignerForm;

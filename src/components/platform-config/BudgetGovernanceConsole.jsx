import {
  Box,
  Typography,
  Switch,
  TextField,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl
} from "@mui/material";

import ConfigSection from "./ConfigSection";
import ConfigDenseField from "./ConfigDenseField";

function ApprovalChainDisplay({ chain }) {

  return (

    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>

      {chain.map((step, index) => (

        <Stack
          key={step}
          direction="row"
          alignItems="center"
          spacing={0.5}
        >

          <Chip
            label={step}
            size="small"
            variant="outlined"
            sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
          />

          {index < chain.length - 1 && (
            <Typography variant="caption" color="text.secondary">
              →
            </Typography>
          )}

        </Stack>

      ))}

    </Stack>

  );

}

function BudgetGovernanceConsole({ budget, onUpdate }) {

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        px: 2,
        py: 1.5
      }}
    >

      <ConfigSection
        title="Budget approval policy"
        subtitle="Controls when requisitions and offers require budget sign-off"
        noPadding
      >

        <ConfigDenseField
          label="Budget approval required"
          helper="All requisitions must pass budget validation before opening"
        >
          <Switch
            checked={budget.budget_approval_required}
            onChange={(e) =>
              onUpdate("budget_approval_required", e.target.checked)
            }
            size="small"
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Allow offer above budget"
          helper="Permit offers that exceed allocated headcount budget"
        >
          <Switch
            checked={budget.allow_offer_above_budget}
            onChange={(e) =>
              onUpdate("allow_offer_above_budget", e.target.checked)
            }
            size="small"
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Approval chain"
          helper="Sequential approvers for budget requests"
          align="left"
        >
          <ApprovalChainDisplay chain={budget.approval_chain} />
        </ConfigDenseField>

      </ConfigSection>

      <ConfigSection
        title="Variance & thresholds"
        subtitle="Default limits and automatic rejection rules"
        noPadding
      >

        <ConfigDenseField
          label="Max budget variance"
          helper="Allowed deviation from approved budget (%)"
        >
          <TextField
            type="number"
            size="small"
            value={budget.max_budget_variance_pct}
            onChange={(e) =>
              onUpdate(
                "max_budget_variance_pct",
                Number(e.target.value)
              )
            }
            slotProps={{
              input: { sx: { width: 72, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Auto-reject above"
          helper="Requests exceeding this variance are rejected automatically"
        >
          <TextField
            type="number"
            size="small"
            value={budget.auto_reject_above_pct}
            onChange={(e) =>
              onUpdate(
                "auto_reject_above_pct",
                Number(e.target.value)
              )
            }
            slotProps={{
              input: { sx: { width: 72, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Default headcount buffer"
          helper="Reserved capacity above approved headcount (%)"
        >
          <TextField
            type="number"
            size="small"
            value={budget.default_headcount_buffer_pct}
            onChange={(e) =>
              onUpdate(
                "default_headcount_buffer_pct",
                Number(e.target.value)
              )
            }
            slotProps={{
              input: { sx: { width: 72, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Default currency"
          helper="Organization-wide budget currency"
        >
          <FormControl size="small">
            <Select
              value={budget.default_currency}
              onChange={(e) =>
                onUpdate("default_currency", e.target.value)
              }
              sx={{ minWidth: 88, fontSize: 14 }}
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </FormControl>
        </ConfigDenseField>

      </ConfigSection>

      <ConfigSection
        title="Exception workflow"
        subtitle="Handling for over-budget and policy override requests"
        noPadding
      >

        <ConfigDenseField
          label="Exception workflow enabled"
          helper="Route over-budget requests through exception approvers"
        >
          <Switch
            checked={budget.exception_workflow_enabled}
            onChange={(e) =>
              onUpdate(
                "exception_workflow_enabled",
                e.target.checked
              )
            }
            size="small"
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Exception approvers"
          helper="Roles authorized to approve budget exceptions"
          align="left"
        >
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {budget.exception_approvers.map((role) => (
              <Chip
                key={role}
                label={role}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
              />
            ))}
          </Stack>
        </ConfigDenseField>

      </ConfigSection>

      <Box>

        <Typography variant="subtitle2" fontWeight={700}>
          Escalation policy
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Automatic escalation when approvals are pending
        </Typography>

        <ConfigDenseField
          label="Escalate after"
          helper="Hours before pending approval escalates"
        >
          <TextField
            type="number"
            size="small"
            value={budget.escalation_after_hours}
            onChange={(e) =>
              onUpdate(
                "escalation_after_hours",
                Number(e.target.value)
              )
            }
            slotProps={{
              input: { sx: { width: 72, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Escalate to"
          helper="Role receiving escalated approvals"
        >
          <Chip
            label={budget.escalation_to}
            size="small"
            variant="outlined"
            sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
          />
        </ConfigDenseField>

      </Box>

    </Box>

  );

}

export default BudgetGovernanceConsole;

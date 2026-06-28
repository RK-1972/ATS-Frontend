import {
  Box,
  Typography,
  Switch,
  TextField,
  Chip,
  MenuItem,
  Select,
  FormControl,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

import {
  MdAutoAwesome,
  MdQuiz,
  MdSort,
  MdTrendingDown
} from "react-icons/md";

import ConfigSection from "./ConfigSection";
import ConfigDenseField from "./ConfigDenseField";
import ConfigMetricSlab from "./ConfigMetricSlab";

const AI_ICONS = {
  resume_matching: MdAutoAwesome,
  candidate_ranking: MdSort,
  interview_questions: MdQuiz,
  offer_risk: MdTrendingDown
};

function AiGovernanceConsole({

  governance,
  features,
  aiModuleEnabled,
  onUpdateGovernance,
  onToggleFeature

}) {

  const tokenPct = Math.min(
    100,
    Math.round(
      (governance.tokens_used / governance.monthly_token_limit) * 100
    )
  );

  const costPct = Math.min(
    100,
    Math.round(
      (governance.cost_mtd_usd / governance.monthly_cost_cap_usd) * 100
    )
  );

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        opacity: aiModuleEnabled ? 1 : 0.65,
        pointerEvents: aiModuleEnabled ? "auto" : "none"
      }}
    >

      {!aiModuleEnabled && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Chip
            label="Enable the AI module to configure governance"
            color="warning"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}

      <Box sx={{ px: 2, py: 1.5 }}>

        <ConfigMetricSlab
          metrics={[
            {
              key: "tokens",
              value: `${(governance.tokens_used / 1000).toFixed(0)}K`,
              label: "Tokens used (MTD)"
            },
            {
              key: "cost",
              value: `$${governance.cost_mtd_usd}`,
              label: "Cost (MTD)"
            },
            {
              key: "threshold",
              value: `${Math.round(governance.confidence_threshold * 100)}%`,
              label: "Confidence threshold"
            },
            {
              key: "retention",
              value: `${governance.data_retention_days}d`,
              label: "Data retention"
            }
          ]}
          highlightKey="tokens"
        />

      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>

        <ConfigSection
          title="Provider & model"
          subtitle="Primary AI service configuration"
          noPadding
        >

          <ConfigDenseField
            label="Provider"
            helper="Cloud AI service provider"
          >
            <FormControl size="small">
              <Select
                value={governance.provider}
                onChange={(e) =>
                  onUpdateGovernance("provider", e.target.value)
                }
                sx={{ minWidth: 140, fontSize: 14 }}
              >
                <MenuItem value="Azure OpenAI">Azure OpenAI</MenuItem>
                <MenuItem value="OpenAI">OpenAI</MenuItem>
                <MenuItem value="AWS Bedrock">AWS Bedrock</MenuItem>
              </Select>
            </FormControl>
          </ConfigDenseField>

          <ConfigDenseField
            label="Model"
            helper="Default model for advisory features"
          >
            <FormControl size="small">
              <Select
                value={governance.model}
                onChange={(e) =>
                  onUpdateGovernance("model", e.target.value)
                }
                sx={{ minWidth: 120, fontSize: 14 }}
              >
                <MenuItem value="gpt-4.1">gpt-4.1</MenuItem>
                <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
              </Select>
            </FormControl>
          </ConfigDenseField>

          <ConfigDenseField
            label="Confidence threshold"
            helper="Minimum score to surface AI recommendations"
          >
            <TextField
              type="number"
              size="small"
              value={governance.confidence_threshold}
              onChange={(e) =>
                onUpdateGovernance(
                  "confidence_threshold",
                  Number(e.target.value)
                )
              }
              slotProps={{
                input: {
                  sx: { width: 72, fontSize: 14 },
                  inputProps: { min: 0, max: 1, step: 0.05 }
                }
              }}
            />
          </ConfigDenseField>

        </ConfigSection>

        <ConfigSection
          title="Usage & cost controls"
          subtitle="Token budgets and spending limits"
          noPadding
        >

          <Box sx={{ py: 1 }}>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                Token usage
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {governance.tokens_used.toLocaleString()} /{" "}
                {governance.monthly_token_limit.toLocaleString()}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={tokenPct}
              sx={{ height: 6, borderRadius: 1 }}
            />

          </Box>

          <ConfigDenseField
            label="Monthly token limit"
            helper="Hard cap on tokens per billing period"
          >
            <TextField
              type="number"
              size="small"
              value={governance.monthly_token_limit}
              onChange={(e) =>
                onUpdateGovernance(
                  "monthly_token_limit",
                  Number(e.target.value)
                )
              }
              slotProps={{
                input: { sx: { width: 100, fontSize: 14 } }
              }}
            />
          </ConfigDenseField>

          <Box sx={{ py: 1 }}>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5
              }}
            >
              <Typography variant="caption" fontWeight={600}>
                Cost (MTD)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${governance.cost_mtd_usd} / $
                {governance.monthly_cost_cap_usd}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={costPct}
              color="secondary"
              sx={{ height: 6, borderRadius: 1 }}
            />

          </Box>

          <ConfigDenseField
            label="Monthly cost cap (USD)"
            helper="Alert when spend exceeds this threshold"
          >
            <TextField
              type="number"
              size="small"
              value={governance.monthly_cost_cap_usd}
              onChange={(e) =>
                onUpdateGovernance(
                  "monthly_cost_cap_usd",
                  Number(e.target.value)
                )
              }
              slotProps={{
                input: { sx: { width: 88, fontSize: 14 } }
              }}
            />
          </ConfigDenseField>

        </ConfigSection>

        <ConfigSection
          title="Audit & compliance"
          subtitle="Logging, privacy, and human-in-the-loop controls"
          noPadding
        >

          <ConfigDenseField
            label="Audit logging"
            helper="Log all AI requests and responses"
          >
            <Switch
              checked={governance.audit_logging}
              onChange={(e) =>
                onUpdateGovernance("audit_logging", e.target.checked)
              }
              size="small"
            />
          </ConfigDenseField>

          <ConfigDenseField
            label="PII masking"
            helper="Redact personally identifiable information in prompts"
          >
            <Switch
              checked={governance.pii_masking}
              onChange={(e) =>
                onUpdateGovernance("pii_masking", e.target.checked)
              }
              size="small"
            />
          </ConfigDenseField>

          <ConfigDenseField
            label="Require human confirmation"
            helper="AI recommendations require explicit user acceptance"
          >
            <Switch
              checked={governance.require_human_confirmation}
              onChange={(e) =>
                onUpdateGovernance(
                  "require_human_confirmation",
                  e.target.checked
                )
              }
              size="small"
            />
          </ConfigDenseField>

          <ConfigDenseField
            label="Data retention"
            helper="Days to retain AI interaction logs"
          >
            <TextField
              type="number"
              size="small"
              value={governance.data_retention_days}
              onChange={(e) =>
                onUpdateGovernance(
                  "data_retention_days",
                  Number(e.target.value)
                )
              }
              slotProps={{
                input: { sx: { width: 72, fontSize: 14 } }
              }}
            />
          </ConfigDenseField>

        </ConfigSection>

        <Box>

          <Typography variant="subtitle2" fontWeight={700}>
            Feature controls
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Enable advisory features individually with per-feature thresholds
          </Typography>

          <TableContainer sx={{ mt: 1 }}>

            <Table size="small">

              <TableHead>

                <TableRow sx={{ bgcolor: "action.hover" }}>

                  <TableCell sx={{ fontWeight: 700, width: 40 }} />

                  <TableCell sx={{ fontWeight: 700 }}>
                    Feature
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Min confidence
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Max tokens
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Enable
                  </TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {features.map((feature) => {

                  const Icon = AI_ICONS[feature.key];

                  return (

                    <TableRow key={feature.key} hover>

                      <TableCell>
                        {Icon && (
                          <Icon size={18} style={{ opacity: 0.6 }} />
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {feature.description}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="caption">
                          {feature.confidence_min}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="caption">
                          {feature.max_tokens}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Switch
                          checked={feature.enabled}
                          onChange={() => onToggleFeature(feature.key)}
                          size="small"
                        />
                      </TableCell>

                    </TableRow>

                  );

                })}

              </TableBody>

            </Table>

          </TableContainer>

        </Box>

      </Box>

    </Box>

  );

}

export default AiGovernanceConsole;

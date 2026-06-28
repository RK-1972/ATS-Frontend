import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Typography,
  Box
} from "@mui/material";

import {
  MdEmail,
  MdGroups,
  MdNotificationsActive,
  MdSms
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

import ConfigSection from "./ConfigSection";
import ConfigDenseField from "./ConfigDenseField";

const CHANNEL_ICONS = {
  email: MdEmail,
  sms: MdSms,
  whatsapp: FaWhatsapp,
  teams: MdGroups,
  in_app: MdNotificationsActive
};

function NotificationCommConsole({

  channels,
  settings,
  onToggleChannel,
  onUpdateSettings

}) {

  const activeCount = channels.filter((c) => c.enabled).length;

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
        title="Delivery channels"
        subtitle={`${activeCount} of ${channels.length} channels active`}
        noPadding
      >

        <TableContainer>

          <Table size="small">

            <TableHead>

              <TableRow sx={{ bgcolor: "action.hover" }}>

                <TableCell sx={{ fontWeight: 700, width: 48 }} />

                <TableCell sx={{ fontWeight: 700 }}>Channel</TableCell>

                <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>

                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Templates
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Rate limit/hr
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Status
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Enable
                </TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {channels.map((channel) => {

                const Icon = CHANNEL_ICONS[channel.key];

                return (

                  <TableRow key={channel.key} hover>

                    <TableCell>
                      {Icon && (
                        <Icon
                          size={18}
                          style={{ opacity: 0.6 }}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {channel.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {channel.description}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" fontWeight={600}>
                        {channel.provider}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="caption">
                        {channel.template_count}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="caption">
                        {channel.rate_limit_per_hour}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={channel.enabled ? "Active" : "Off"}
                        size="small"
                        color={channel.enabled ? "success" : "default"}
                        variant={channel.enabled ? "filled" : "outlined"}
                        sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={channel.enabled}
                        onChange={() => onToggleChannel(channel.key)}
                        size="small"
                      />
                    </TableCell>

                  </TableRow>

                );

              })}

            </TableBody>

          </Table>

        </TableContainer>

      </ConfigSection>

      <ConfigSection
        title="Digest & scheduling"
        subtitle="Batch notification delivery preferences"
        noPadding
      >

        <ConfigDenseField
          label="Digest enabled"
          helper="Consolidate non-urgent notifications into scheduled digests"
        >
          <Switch
            checked={settings.digest_enabled}
            onChange={(e) =>
              onUpdateSettings("digest_enabled", e.target.checked)
            }
            size="small"
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Digest frequency"
          helper="How often digest emails are sent"
        >
          <FormControl size="small">
            <Select
              value={settings.digest_frequency}
              onChange={(e) =>
                onUpdateSettings("digest_frequency", e.target.value)
              }
              sx={{ minWidth: 100, fontSize: 14 }}
            >
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </ConfigDenseField>

        <ConfigDenseField
          label="Digest time"
          helper="Local time for daily digest delivery"
        >
          <TextField
            size="small"
            value={settings.digest_time}
            onChange={(e) =>
              onUpdateSettings("digest_time", e.target.value)
            }
            slotProps={{
              input: { sx: { width: 88, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

      </ConfigSection>

      <ConfigSection
        title="Quiet hours & delivery policy"
        subtitle="Suppress notifications outside business hours"
        noPadding
      >

        <ConfigDenseField
          label="Quiet hours enabled"
          helper="Hold non-critical notifications during quiet hours"
        >
          <Switch
            checked={settings.quiet_hours_enabled}
            onChange={(e) =>
              onUpdateSettings(
                "quiet_hours_enabled",
                e.target.checked
              )
            }
            size="small"
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Quiet hours window"
          helper="Start and end times (24h format)"
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              value={settings.quiet_hours_start}
              onChange={(e) =>
                onUpdateSettings("quiet_hours_start", e.target.value)
              }
              slotProps={{
                input: { sx: { width: 72, fontSize: 14 } }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              to
            </Typography>
            <TextField
              size="small"
              value={settings.quiet_hours_end}
              onChange={(e) =>
                onUpdateSettings("quiet_hours_end", e.target.value)
              }
              slotProps={{
                input: { sx: { width: 72, fontSize: 14 } }
              }}
            />
          </Box>
        </ConfigDenseField>

        <ConfigDenseField
          label="Default sender"
          helper="From address for system notifications"
        >
          <TextField
            size="small"
            value={settings.default_sender}
            onChange={(e) =>
              onUpdateSettings("default_sender", e.target.value)
            }
            slotProps={{
              input: { sx: { width: 200, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Retry attempts"
          helper="Delivery retries on transient failure"
        >
          <TextField
            type="number"
            size="small"
            value={settings.retry_attempts}
            onChange={(e) =>
              onUpdateSettings(
                "retry_attempts",
                Number(e.target.value)
              )
            }
            slotProps={{
              input: { sx: { width: 56, fontSize: 14 } }
            }}
          />
        </ConfigDenseField>

        <ConfigDenseField
          label="Escalate on failure"
          helper="Notify admins when delivery fails after retries"
        >
          <Switch
            checked={settings.escalation_on_failure}
            onChange={(e) =>
              onUpdateSettings(
                "escalation_on_failure",
                e.target.checked
              )
            }
            size="small"
          />
        </ConfigDenseField>

      </ConfigSection>

    </Box>

  );

}

export default NotificationCommConsole;

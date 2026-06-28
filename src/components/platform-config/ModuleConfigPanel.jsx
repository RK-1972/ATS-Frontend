import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Stack
} from "@mui/material";

import { MdLink, MdSettings } from "react-icons/md";

function ModuleConfigPanel({ modules, onToggle, onConfigure }) {

  const getDependencyTitle = (dependsOn) =>
    modules.find((m) => m.key === dependsOn)?.title;

  return (

    <TableContainer>

      <Table size="small">

        <TableHead>

          <TableRow sx={{ bgcolor: "action.hover" }}>

            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
              Module
            </TableCell>

            <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
              Purpose
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 120 }}>
              Dependencies
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 90 }}>
              Status
            </TableCell>

            <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>
              Configuration
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">
              Enable
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 56 }} align="center">
              Actions
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {modules.map((module) => {

            const depTitle = module.depends_on
              ? getDependencyTitle(module.depends_on)
              : null;

            const depEnabled = module.depends_on
              ? modules.find((m) => m.key === module.depends_on)?.enabled
              : true;

            const blocked = depTitle && !depEnabled;

            return (

              <TableRow
                key={module.key}
                hover
                sx={{ opacity: blocked && !module.enabled ? 0.7 : 1 }}
              >

                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {module.title}
                  </Typography>
                  {module.required && (
                    <Chip
                      label="Core"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5, height: 20, fontSize: 11 }}
                    />
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {module.description}
                  </Typography>
                </TableCell>

                <TableCell>
                  {depTitle ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MdLink
                        size={14}
                        style={{ flexShrink: 0, opacity: 0.6 }}
                      />
                      <Typography variant="caption" fontWeight={600}>
                        {depTitle}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      None
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={module.enabled ? "Active" : "Inactive"}
                    size="small"
                    color={module.enabled ? "success" : "default"}
                    variant={module.enabled ? "filled" : "outlined"}
                    sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    {module.config_summary}
                  </Typography>
                  {module.policies > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {module.policies} policies
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  <Switch
                    checked={module.enabled}
                    onChange={() => onToggle(module.key)}
                    disabled={module.required || blocked}
                    size="small"
                    inputProps={{
                      "aria-label": `Enable ${module.title}`
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Configure module">
                    <IconButton
                      size="small"
                      onClick={() => onConfigure?.(module)}
                      disabled={!module.enabled}
                    >
                      <MdSettings size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>

              </TableRow>

            );

          })}

        </TableBody>

      </Table>

    </TableContainer>

  );

}

export default ModuleConfigPanel;

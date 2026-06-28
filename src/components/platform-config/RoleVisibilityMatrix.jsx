import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Box
} from "@mui/material";

function RoleVisibilityMatrix({

  roles,
  modules,
  matrix,
  onToggle

}) {

  return (

    <TableContainer
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: "divider"
      }}
    >

      <Table size="small">

        <TableHead>

          <TableRow sx={{ bgcolor: "action.hover" }}>

            <TableCell
              sx={{
                fontWeight: 700,
                minWidth: 160,
                position: "sticky",
                left: 0,
                bgcolor: "action.hover",
                zIndex: 1
              }}
            >
              Role
            </TableCell>

            {modules.map((module) => (

              <TableCell
                key={module.key}
                align="center"
                sx={{
                  fontWeight: 700,
                  minWidth: 100,
                  fontSize: 12
                }}
              >
                {module.label}
              </TableCell>

            ))}

          </TableRow>

        </TableHead>

        <TableBody>

          {roles.map((role) => (

            <TableRow
              key={role}
              hover
            >

              <TableCell
                sx={{
                  fontWeight: 600,
                  position: "sticky",
                  left: 0,
                  bgcolor: "background.paper",
                  zIndex: 1
                }}
              >
                {role}
              </TableCell>

              {modules.map((module) => {

                const checked =
                  matrix[role]?.[module.key] ?? false;

                const isAdminRole =
                  role === "Admin" || role === "TA Leader";

                return (

                  <TableCell
                    key={module.key}
                    align="center"
                  >

                    <Checkbox
                      checked={checked}
                      onChange={() =>
                        onToggle(role, module.key)
                      }
                      disabled={isAdminRole}
                      size="small"
                      inputProps={{
                        "aria-label":
                          `${role} visibility for ${module.label}`
                      }}
                    />

                  </TableCell>

                );

              })}

            </TableRow>

          ))}

        </TableBody>

      </Table>

      <Box sx={{ px: 2, py: 1, bgcolor: "action.hover" }}>

        <Typography variant="caption" color="text.secondary">
          Admin and TA Leader roles always have full module visibility.
          Changes apply on next publish.
        </Typography>

      </Box>

    </TableContainer>

  );

}

export default RoleVisibilityMatrix;

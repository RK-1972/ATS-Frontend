import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";

import { formatDateTime } from "@/utils/formatDateTime";

function NotificationPreviewPanel({ notification }) {

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden"
      }}
    >

      <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: "divider" }}>

        <Typography variant="subtitle2" fontWeight={700} mb={0.25}>
          Notification Preview
        </Typography>

        {notification && (
          <Typography variant="caption" color="text.secondary">
            {notification.title}
          </Typography>
        )}

      </Box>

      {!notification?.deliveries?.length ? (

        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" fontSize={13}>
            Select a stage with notification delivery records to preview.
          </Typography>
        </Box>

      ) : (

        <Table size="small">

          <TableHead>

            <TableRow sx={{ bgcolor: "action.hover" }}>

              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: 11, pl: 2 }}>
                Recipient
              </TableCell>

              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: 11 }}>
                Role
              </TableCell>

              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: 11 }}>
                Channel
              </TableCell>

              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: 11 }}>
                Template
              </TableCell>

              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: 11 }}>
                Status
              </TableCell>

              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: 11, pr: 2 }}>
                Time
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {notification.deliveries.map((row, index) => (

              <TableRow key={`${row.recipient}-${row.channel}-${index}`} hover>

                <TableCell sx={{ py: 1, fontSize: 12, fontWeight: 600, pl: 2 }}>
                  {row.recipient}
                </TableCell>

                <TableCell sx={{ py: 1, fontSize: 12 }}>
                  {row.role}
                </TableCell>

                <TableCell sx={{ py: 1, fontSize: 12 }}>
                  {row.channel}
                </TableCell>

                <TableCell sx={{ py: 1, fontSize: 11, color: "text.secondary" }}>
                  {row.template}
                </TableCell>

                <TableCell sx={{ py: 1 }}>

                  <Chip
                    label={row.status}
                    size="small"
                    color={
                      row.status === "Delivered"
                        ? "success"
                        : row.status === "Read"
                          ? "info"
                          : row.status === "Pending"
                            ? "warning"
                            : "default"
                    }
                    variant="outlined"
                    sx={{ height: 20, fontSize: 9, fontWeight: 700 }}
                  />

                </TableCell>

                <TableCell sx={{ py: 1, fontSize: 11, whiteSpace: "nowrap", pr: 2 }}>
                  {formatDateTime(row.time)}
                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      )}

    </Box>

  );

}

export default NotificationPreviewPanel;

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box
} from "@mui/material";

import { formatCurrency } from "@/utils/formatCurrency";
import WorkforceStatusChip from "./WorkforceStatusChip";

function BudgetRequestCard({ request, onClick, selected }) {

  return (

    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 2,
        border: 2,
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "rgba(31, 59, 99, 0.03)" : "background.paper",
        transition: "border-color 0.2s ease",
        "&:hover": onClick ? { borderColor: "primary.main" } : {}
      }}
    >

      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >

          <Box minWidth={0} flex={1}>

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: 11 }}
            >
              {request.id} · {request.department} · Grade {request.grade} · HC {request.headcount}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              mt={0.25}
              sx={{ fontSize: 14, lineHeight: 1.3 }}
            >
              {request.position}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              {request.submitted_by} · {formatCurrency(request.proposed_budget)}
            </Typography>

          </Box>

          <WorkforceStatusChip status={request.status} />

        </Stack>

      </CardContent>

    </Card>

  );

}

export default BudgetRequestCard;

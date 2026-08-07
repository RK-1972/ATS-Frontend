import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography
} from "@mui/material";

import { StatusChip } from "@/components/enterprise";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatApprovedDate } from "@/utils/offerLetterUtils";

function OfferLetterQueueCard({ item, selected, onOpen }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: 2,
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "rgba(31, 59, 99, 0.03)" : "background.paper",
        transition: "border-color 0.2s ease"
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack spacing={1}>
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
                {item.offerNumber}
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
                mt={0.25}
                sx={{ fontSize: 14, lineHeight: 1.3 }}
              >
                {item.candidateName || "Candidate"}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                {item.position || "—"} · {item.department || "—"}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                {item.businessUnit || "—"} · {formatCurrency(item.annualCtc || 0)}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                Approved {formatApprovedDate(item.approvedDate)} · {item.recruiter || "—"}
              </Typography>
            </Box>

            <StatusChip status={item.letterStatus || "Awaiting Letter"} />
          </Stack>

          <Button
            variant="outlined"
            size="small"
            onClick={() => onOpen?.(item.offerId)}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Open
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default OfferLetterQueueCard;

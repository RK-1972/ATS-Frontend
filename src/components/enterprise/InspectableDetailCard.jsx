import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Compact executive detail panel for inspectable motion cards.
 */
function InspectableDetailCard({ title, value, rows = [] }) {

  const theme = useTheme();
  const { radius } = theme.tokens;

  return (

    <Paper
      elevation={4}
      sx={{
        p: 1.25,
        minWidth: 210,
        maxWidth: 280,
        borderRadius: `${radius.lg}px`,
        border: 1,
        borderColor: "divider"
      }}
    >

      <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
        {title}
      </Typography>

      {value ? (
        <Typography
          fontWeight={700}
          sx={{
            fontSize: theme.tokens.denseMotionCard.value.fontSize,
            mt: 0.25,
            mb: 0.75,
            lineHeight: 1.15
          }}
        >
          {value}
        </Typography>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.625 }}>
        {rows.map((row) => (
          <Box key={`${row.label}-${row.value}`}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
              sx={{ lineHeight: 1.2, fontSize: 10.5 }}
            >
              {row.label}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.3, fontSize: 13 }}>
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>

    </Paper>

  );

}

export default InspectableDetailCard;

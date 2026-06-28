import { Box, Typography, Stack } from "@mui/material";

function ConfigDenseField({ label, helper, children, align = "right" }) {

  return (

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
        gap: { xs: 0.5, sm: 2 },
        alignItems: "center",
        py: 1,
        minHeight: 40
      }}
    >

      <Box>

        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>

        {helper && (
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        )}

      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent={align === "right" ? "flex-end" : "flex-start"}
        sx={{ minWidth: { sm: 160 } }}
      >
        {children}
      </Stack>

    </Box>

  );

}

export default ConfigDenseField;

import { Box, Typography, Divider } from "@mui/material";

function ConfigSection({ title, subtitle, action, children, noPadding = false }) {

  return (

    <Box sx={{ mb: 2 }}>

      {(title || action) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            px: noPadding ? 0 : 0
          }}
        >
          <Box>
            {title && (
              <Typography variant="subtitle2" fontWeight={700}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}

      <Box sx={{ px: noPadding ? 0 : 0 }}>
        {children}
      </Box>

      <Divider sx={{ mt: 2 }} />

    </Box>

  );

}

export default ConfigSection;

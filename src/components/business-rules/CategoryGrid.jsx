import {
  Box,
  Typography,
  Chip,
  Stack
} from "@mui/material";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const CATEGORY_COLORS = {
  Recruitment: "primary",
  Requisition: "info",
  Interview: "secondary",
  Offer: "success",
  Vendor: "warning",
  Budget: "error",
  Notifications: "default",
  AI: "default"
};

function CategoryGrid({ categories, onCategoryClick }) {

  return (

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(4, 1fr)"
        },
        gap: 1
      }}
    >

      {categories.map((category) => (

        <Box
          key={category.key}
          onClick={() => onCategoryClick?.(category.label)}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            px: 1.5,
            py: 1,
            bgcolor: "background.paper",
            cursor: onCategoryClick ? "pointer" : "default",
            transition: "border-color 0.2s ease",
            "&:hover": onCategoryClick
              ? { borderColor: "primary.main" }
              : {}
          }}
        >

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >

            <Typography variant="body2" fontWeight={700}>
              {category.label}
            </Typography>

            {onCategoryClick && (
              <ChevronRightIcon
                sx={{ fontSize: 16 }}
                color="action"
              />
            )}

          </Stack>

          <Chip
            label={`${category.rule_count} rules`}
            size="small"
            variant="outlined"
            color={CATEGORY_COLORS[category.label] || "default"}
            sx={{
              mt: 0.5,
              height: 20,
              fontSize: 10,
              fontWeight: 600
            }}
          />

        </Box>

      ))}

    </Box>

  );

}

export default CategoryGrid;

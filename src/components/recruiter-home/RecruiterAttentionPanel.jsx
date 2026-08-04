import { Box, Typography, Chip, Link } from "@mui/material";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { DESIGN, PANEL_HEADER, PANEL_SHELL, ROW_INTERACTIVE } from "./recruiterHomeTokens";
import { getAttentionItemMeta, PRIORITY_CHIP } from "./recruiterHomeUiHelpers";

function PriorityChip({ label }) {
  const style = PRIORITY_CHIP[label] || PRIORITY_CHIP.Low;
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        fontSize: 10,
        fontWeight: 600,
        bgcolor: style.bgcolor,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 1.5
      }}
    />
  );
}

function RecruiterAttentionPanel({
  items = [],
  selectedId,
  onSelect,
  expanded = false,
  onViewAll
}) {
  const visibleItems = expanded ? items : items.slice(0, 6);

  return (
    <Box sx={{ ...PANEL_SHELL, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%", width: "100%" }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StackTitle count={items.length} />
        {items.length > 6 && !expanded && (
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={onViewAll}
            sx={{ fontSize: 12, fontWeight: 600, color: DESIGN.blue, border: 0, bgcolor: "transparent", cursor: "pointer" }}
          >
            View all
          </Link>
        )}
      </Box>

      {visibleItems.length === 0 ? (
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary }}>
            No actionable items. Pipeline and requisitions are current.
          </Typography>
        </Box>
      ) : (
        visibleItems.map((item, index) => {
          const meta = getAttentionItemMeta(item.type);
          const Icon = meta.icon;
          const isSelected = selectedId === item.id;
          return (
            <Box
              key={item.id}
              component="button"
              type="button"
              onClick={() => onSelect?.(item)}
              sx={{
                ...ROW_INTERACTIVE,
                display: "flex",
                width: "100%",
                m: 0,
                px: 1.5,
                py: 0.5,
                gap: 0.75,
                border: 0,
                borderBottom: index < visibleItems.length - 1 ? 1 : 0,
                borderColor: DESIGN.border,
                bgcolor: isSelected ? "#EFF8FF" : "transparent",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
                alignItems: "center",
                minHeight: 40,
                boxShadow: isSelected ? "inset 3px 0 0 #175CD3" : "none",
                "&:hover": {
                  bgcolor: isSelected ? "#EFF8FF" : "#F9FAFB",
                  boxShadow: isSelected
                    ? "inset 3px 0 0 #175CD3, 0 1px 3px rgba(16, 24, 40, 0.06)"
                    : "0 1px 3px rgba(16, 24, 40, 0.06)"
                }
              }}
            >
              <EnterpriseModuleIcon
                icon={Icon}
                module={meta.module}
                density="sm"
                size={28}
                iconSize={15}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: DESIGN.textPrimary, lineHeight: 1.25 }} noWrap>
                  {item.displayType || meta.displayType}
                </Typography>
                <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary, lineHeight: 1.25 }} noWrap>
                  {item.subtitle || item.title}
                  {item.stageLabel ? ` · ${item.stageLabel}` : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25, flexShrink: 0 }}>
                <PriorityChip label={item.priorityLabel || "Medium"} />
                {item.timeLabel && (
                  <Typography sx={{ fontSize: 10, color: DESIGN.textMuted, lineHeight: 1 }}>{item.timeLabel}</Typography>
                )}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}

function StackTitle({ count }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: DESIGN.textPrimary }}>
        Requires Attention
      </Typography>
      {count > 0 && (
        <Box
          sx={{
            minWidth: 20,
            height: 20,
            px: 0.5,
            borderRadius: 10,
            bgcolor: DESIGN.redBg,
            color: DESIGN.red,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {count}
        </Box>
      )}
    </Box>
  );
}

export default RecruiterAttentionPanel;

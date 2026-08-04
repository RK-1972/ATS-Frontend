import { Box, Typography, Link, Chip } from "@mui/material";
import { MdWarningAmber } from "react-icons/md";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { DESIGN, PANEL_HEADER, PANEL_SHELL, ROW_INTERACTIVE } from "./recruiterHomeTokens";
import { getAttentionItemMeta } from "./recruiterHomeUiHelpers";

const SLA_STYLES = {
  error: { bg: DESIGN.redBg, color: DESIGN.red, border: "#FECDCA" },
  warning: { bg: "#F4F3FF", color: "#6941C6", border: "#D9D6FE" },
  orange: { bg: DESIGN.orangeBg, color: DESIGN.orange, border: "#FEC84B" },
  info: { bg: DESIGN.blueBg, color: DESIGN.blue, border: "#B2DDFF" }
};

function SlaBadge({ label, tone }) {
  const style = SLA_STYLES[tone] || SLA_STYLES.info;
  return (
    <Chip
      label={label}
      size="small"
      sx={{ height: 20, fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}`, borderRadius: 1 }}
    />
  );
}

function CockpitActionsNeededPanel({ items = [], selectedId, onSelect, criticalCount = 0, onViewAll, expanded = false }) {
  const visible = expanded ? items : items.slice(0, 4);

  return (
    <Box sx={{ ...PANEL_SHELL, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <EnterpriseModuleIcon
            icon={MdWarningAmber}
            module="reports"
            density="sm"
            size={24}
            iconSize={14}
          />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em" }}>
            ACTIONS NEEDED
          </Typography>
        </Box>
        {criticalCount > 0 && (
          <Chip label={`${criticalCount} Critical`} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: DESIGN.redBg, color: DESIGN.red }} />
        )}
      </Box>

      {visible.length === 0 ? (
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary }}>No actions required for this period.</Typography>
        </Box>
      ) : (
        visible.map((item, index) => {
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
                py: 1,
                gap: 1,
                border: 0,
                borderBottom: index < visible.length - 1 ? `1px solid ${DESIGN.border}` : 0,
                bgcolor: isSelected ? "#EFF8FF" : "transparent",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
                alignItems: "flex-start"
              }}
            >
              <EnterpriseModuleIcon
                icon={Icon}
                module={meta.module}
                density="sm"
                size={32}
                iconSize={16}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: DESIGN.textPrimary, lineHeight: 1.3 }}>
                  {item.displayType || meta.displayType}
                </Typography>
                <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary, mt: 0.25 }} noWrap>
                  {item.roleLine}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                  <SlaBadge label={item.slaBadge} tone={item.slaTone} />
                  <Typography sx={{ fontSize: 10, color: DESIGN.textMuted }}>{item.slaDetail}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })
      )}

      {items.length > 4 && (
        <Box sx={{ px: 1.5, py: 0.75, mt: "auto" }}>
          <Link component="button" type="button" underline="hover" onClick={onViewAll} sx={{ fontSize: 12, fontWeight: 600, color: DESIGN.blue, border: 0, bgcolor: "transparent", cursor: "pointer" }}>
            View all actions →
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default CockpitActionsNeededPanel;

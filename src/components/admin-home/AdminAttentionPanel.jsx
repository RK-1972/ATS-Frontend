import { Box, Typography, Chip } from "@mui/material";
import { MdNotificationImportant } from "react-icons/md";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { DESIGN, PANEL_HEADER, PANEL_SHELL, ROW_INTERACTIVE } from "./adminHomeTokens";

const TONE_STYLES = {
  error: { bg: DESIGN.redBg, color: DESIGN.red, border: "#FECDCA" },
  warning: { bg: DESIGN.orangeBg, color: DESIGN.orange, border: "#FEC84B" },
  orange: { bg: DESIGN.orangeBg, color: DESIGN.orange, border: "#FEC84B" },
  info: { bg: DESIGN.blueBg, color: DESIGN.blue, border: "#B2DDFF" }
};

function ToneChip({ tone }) {
  const style = TONE_STYLES[tone] || TONE_STYLES.info;
  const label = tone === "error" ? "Critical" : tone === "warning" ? "Attention" : "Review";

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        fontSize: 9,
        fontWeight: 700,
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 1
      }}
    />
  );
}

function AdminAttentionPanel({ items = [], onNavigate }) {
  return (
    <Box sx={{ ...PANEL_SHELL, mb: 2 }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", gap: 0.75 }}>
        <EnterpriseModuleIcon
          icon={MdNotificationImportant}
          module="reports"
          density="sm"
          size={24}
          iconSize={14}
        />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: DESIGN.textSecondary,
            letterSpacing: "0.04em"
          }}
        >
          ATTENTION REQUIRED
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary }}>
            No items require attention.
          </Typography>
        </Box>
      ) : (
        items.map((item, index) => (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => onNavigate?.(item.route)}
            sx={{
              ...ROW_INTERACTIVE,
              display: "flex",
              width: "100%",
              m: 0,
              px: 1.5,
              py: 1.1,
              gap: 1,
              border: 0,
              borderBottom: index < items.length - 1 ? `1px solid ${DESIGN.border}` : 0,
              bgcolor: "transparent",
              textAlign: "left",
              font: "inherit",
              color: "inherit",
              alignItems: "flex-start"
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: DESIGN.textPrimary, lineHeight: 1.3 }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary, mt: 0.25 }}>
                {item.detail}
              </Typography>
            </Box>
            <ToneChip tone={item.tone} />
          </Box>
        ))
      )}
    </Box>
  );
}

export default AdminAttentionPanel;

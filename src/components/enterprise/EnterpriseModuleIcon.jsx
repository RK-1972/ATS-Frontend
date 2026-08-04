import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Optalynx Enterprise Module Icon — single visual standard.
 *
 * Soft pastel tile + outlined Material / react-icons glyph.
 * Colour from theme.tokens.moduleColors[module].
 * Density from theme.tokens.moduleIcon.densities (sm | md | lg).
 *
 * Prefer `module` + `density` over page-local containers, colours, or sizes.
 */
function EnterpriseModuleIcon({
  icon: Icon = null,
  module = "recruitment",
  density = "md",
  size = null,
  iconSize = null,
  sx = {}
}) {
  const theme = useTheme();
  const { moduleIcon, moduleColors, shadows } = theme.tokens;
  const palette = moduleColors[module] || moduleColors.recruitment;
  const preset = moduleIcon.densities?.[density] || moduleIcon.densities?.md;
  const boxSize = size ?? preset?.size ?? moduleIcon.size;
  const glyphSize = iconSize ?? preset?.iconSize ?? moduleIcon.iconSize;

  return (
    <Box
      aria-hidden
      sx={{
        width: boxSize,
        height: boxSize,
        flexShrink: 0,
        borderRadius: `${moduleIcon.radius}px`,
        bgcolor: palette.bg,
        border: `1px solid ${palette.border}`,
        boxShadow: shadows.low,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: palette.icon,
        ...sx
      }}
    >
      {Icon ? (
        <Icon
          sx={{ fontSize: glyphSize, color: palette.icon }}
          size={glyphSize}
          color={palette.icon}
          style={{
            fontSize: glyphSize,
            width: glyphSize,
            height: glyphSize,
            display: "block"
          }}
        />
      ) : null}
    </Box>
  );
}

export default EnterpriseModuleIcon;

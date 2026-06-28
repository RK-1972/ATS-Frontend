import { createTheme, alpha } from "@mui/material/styles";
import tokens from "./tokens";

const { brand, typography, layout, radius, motion, elevation } = tokens;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.primary,
      dark: brand.primaryDark,
      light: brand.primaryLight,
      contrastText: "#ffffff"
    },
    secondary: {
      main: brand.secondary
    },
    background: {
      default: brand.background,
      paper: brand.surface
    },
    divider: alpha(brand.primary, 0.12),
    text: {
      primary: "#202124",
      secondary: "#5f6368"
    },
    success: { main: "#137333" },
    warning: { main: "#b06000" },
    error: { main: "#c5221f" },
    info: { main: "#1967d2" }
  },

  spacing: tokens.spacing.unit,

  shape: {
    borderRadius: radius.md
  },

  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.display,
    h2: typography.pageTitle,
    h3: typography.sectionTitle,
    h4: typography.sectionTitle,
    h5: { ...typography.sectionTitle, fontSize: 16 },
    h6: { ...typography.body, fontWeight: 600 },
    body1: typography.body,
    body2: typography.secondary,
    caption: typography.caption,
    button: {
      fontSize: typography.secondary.fontSize,
      fontWeight: 600,
      textTransform: "none"
    }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: typography.body.fontSize
        }
      }
    },
    MuiButton: {
      defaultProps: {
        size: "small"
      },
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          minHeight: 32,
          padding: "4px 12px",
          transition: `background-color ${motion.duration.fast}ms ${motion.easing.standard}`
        }
      }
    },
    MuiIconButton: {
      defaultProps: {
        size: "small"
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 22,
          fontSize: typography.label.fontSize,
          fontWeight: typography.label.fontWeight
        },
        label: {
          paddingLeft: 8,
          paddingRight: 8
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 12px",
          fontSize: typography.secondary.fontSize
        },
        head: {
          fontWeight: 600,
          fontSize: typography.caption.fontSize,
          color: "#5f6368"
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      }
    },
    MuiAppBar: {
      defaultProps: {
        elevation: elevation.header
      }
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          fontSize: typography.secondary.fontSize,
          "& .MuiDataGrid-columnHeaders": {
            minHeight: "36px !important",
            maxHeight: "36px !important"
          },
          "& .MuiDataGrid-row": {
            minHeight: "36px !important",
            maxHeight: "36px !important"
          },
          "& .MuiDataGrid-cell": {
            minHeight: "36px !important",
            maxHeight: "36px !important",
            lineHeight: "36px"
          }
        }
      }
    }
  }
});

theme.tokens = tokens;

export default theme;

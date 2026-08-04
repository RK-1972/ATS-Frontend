import { createTheme, alpha } from "@mui/material/styles";
import tokens from "./tokens";
import OptalynxMotion, {
  motionPresets,
  transitions,
  reduceMotionSx
} from "./motion";

const { brand, typography, radius, motion, elevation, shadows } = tokens;

const reduceMotionRoot =
  reduceMotionSx["@media (prefers-reduced-motion: reduce)"];

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

  transitions: {
    duration: {
      shortest: motion.duration.instant,
      shorter: motion.duration.fast,
      short: motion.duration.normal,
      standard: motion.duration.normal,
      complex: motion.duration.slow,
      enteringScreen: motion.duration.enter,
      leavingScreen: motion.duration.exit
    },
    easing: {
      easeInOut: motion.easing.standard,
      easeOut: motion.easing.decelerate,
      easeIn: motion.easing.accelerate,
      sharp: motion.easing.accelerate
    }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --optalynx-motion-duration-instant: ${motion.duration.instant}ms;
          --optalynx-motion-duration-fast: ${motion.duration.fast}ms;
          --optalynx-motion-duration-normal: ${motion.duration.normal}ms;
          --optalynx-motion-duration-slow: ${motion.duration.slow}ms;
          --optalynx-motion-duration-enter: ${motion.duration.enter}ms;
          --optalynx-motion-duration-exit: ${motion.duration.exit}ms;
          --optalynx-motion-easing-standard: ${motion.easing.standard};
          --optalynx-motion-easing-decelerate: ${motion.easing.decelerate};
          --optalynx-motion-easing-accelerate: ${motion.easing.accelerate};
          --optalynx-motion-easing-emphasized: ${motion.easing.emphasized};
        }

        @media (prefers-reduced-motion: reduce) {
          :root {
            --optalynx-motion-duration-instant: 0ms;
            --optalynx-motion-duration-fast: 0ms;
            --optalynx-motion-duration-normal: 0ms;
            --optalynx-motion-duration-slow: 0ms;
            --optalynx-motion-duration-enter: 0ms;
            --optalynx-motion-duration-exit: 0ms;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @keyframes optalynx-card-enter {
          from {
            opacity: ${motion.transform.fade.exit};
            transform: translateY(${motion.transform.translate.enterY});
          }
          to {
            opacity: ${motion.transform.fade.enter};
            transform: translateY(0);
          }
        }

        body {
          font-size: ${typography.body.fontSize}px;
        }
      `
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
          transition: transitions(
            [
              "background-color",
              "box-shadow",
              "border-color",
              "opacity",
              "color"
            ],
            "hover",
            "standard"
          ),
          "&:hover": {
            boxShadow: shadows.high
          },
          "&:active": {
            opacity: motion.interaction.press.opacity,
            boxShadow: "none"
          },
          "&:focus-visible": {
            outlineWidth: motionPresets.focus.outlineWidth,
            outlineStyle: motionPresets.focus.outlineStyle,
            outlineColor: motionPresets.focus.outlineColor,
            outlineOffset: motionPresets.focus.outlineOffset
          },
          "@media (prefers-reduced-motion: reduce)": reduceMotionRoot
        }
      }
    },

    MuiIconButton: {
      defaultProps: {
        size: "small"
      },
      styleOverrides: {
        root: {
          transition: transitions(
            ["background-color", "color", "opacity"],
            "hover",
            "standard"
          ),
          "&:active": {
            opacity: motion.interaction.press.opacity
          },
          "&:focus-visible": {
            outlineWidth: motionPresets.focus.outlineWidth,
            outlineStyle: motionPresets.focus.outlineStyle,
            outlineColor: motionPresets.focus.outlineColor,
            outlineOffset: motionPresets.focus.outlineOffset
          },
          "@media (prefers-reduced-motion: reduce)": reduceMotionRoot
        }
      }
    },

    MuiChip: {
      styleOverrides: {
        root: {
          height: 22,
          fontSize: typography.label.fontSize,
          fontWeight: typography.label.fontWeight,
          transition: transitions(
            ["background-color", "box-shadow", "border-color", "opacity"],
            "hover",
            "standard"
          ),
          "&:hover": {
            boxShadow: shadows.high
          },
          "&:active": {
            opacity: motion.interaction.press.opacity
          },
          "@media (prefers-reduced-motion: reduce)": reduceMotionRoot
        },
        label: {
          paddingLeft: 8,
          paddingRight: 8
        }
      }
    },

    MuiCard: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          boxShadow: motionPresets.card.rest.boxShadow,
          transform: motionPresets.card.rest.transform,
          transition: motionPresets.card.transition,
          animation: `optalynx-card-enter ${motion.duration.enter}ms ${motion.easing.decelerate}`,
          "&:hover": {
            boxShadow: motionPresets.card.hover.boxShadow,
            transform: motionPresets.card.hover.transform
          },
          "&:focus-visible": {
            outlineWidth: motionPresets.focus.outlineWidth,
            outlineStyle: motionPresets.focus.outlineStyle,
            outlineColor: motionPresets.focus.outlineColor,
            outlineOffset: motionPresets.focus.outlineOffset
          },
          "@media (prefers-reduced-motion: reduce)": {
            ...reduceMotionRoot,
            animation: "none"
          }
        }
      }
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          transition: transitions(
            ["box-shadow", "background-color"],
            "hover",
            "standard"
          ),
          "@media (prefers-reduced-motion: reduce)": reduceMotionRoot
        }
      }
    },

    MuiDialog: {
      defaultProps: {
        transitionDuration: {
          enter: motion.duration.enter,
          exit: motion.duration.exit
        }
      }
    },

    MuiDrawer: {
      defaultProps: {
        transitionDuration: {
          enter: motion.duration.enter,
          exit: motion.duration.exit
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
/** Optalynx Enterprise Motion Design System (foundation + shared adoption). */
theme.motion = OptalynxMotion;

export default theme;

import { createTheme, alpha } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
      light: "#818cf8",
      dark: "#3730a3",
    },
    secondary: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
    },
    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },
    success: { main: "#10b981", light: "#d1fae5" },
    warning: { main: "#f59e0b", light: "#fef3c7" },
    info: { main: "#3b82f6", light: "#dbeafe" },
    error: { main: "#ef4444", light: "#fee2e2" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: {
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontSize: "0.68rem",
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 4 },
        contained: {
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6 },
        sizeSmall: { fontSize: "0.7rem", height: 22 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: `0 4px 14px 0 ${alpha("#4f46e5", 0.4)}`,
        },
      },
    },
  },
});

export const STATUS_PALETTE = {
  OPEN: { main: "#3b82f6", light: "#eff6ff", dark: "#1d4ed8" },
  IN_TRANSIT: { main: "#f59e0b", light: "#fffbeb", dark: "#b45309" },
  DELIVERED: { main: "#10b981", light: "#ecfdf5", dark: "#047857" },
} as const;

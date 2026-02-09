// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

/**
 * 🧩 Tema global MUI
 * Todo el sistema hereda de aquí
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: tokens.primary,
    background: tokens.background,
    success: { main: tokens.success },
    warning: { main: tokens.warning },
    error: { main: tokens.error },
    info: { main: tokens.info },
    text: {
      primary: tokens.grey[800],
      secondary: tokens.grey[600],
    },
  },

  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    // 🔘 Botones
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 18px",
        },
      },
    },

    // 🧾 Cards
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: tokens.shadowSoft,
          borderRadius: 16,
        },
      },
    },

    // ✏️ Inputs
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "small",
      },
    },

    // 🧭 Stepper (flujo de reuniones)
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 500,
        },
      },
    },
  },
});

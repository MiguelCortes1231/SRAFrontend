// src/theme/tokens.ts

/**
 * 🎨 Design Tokens
 * Centralizamos colores, sombras y helpers
 * para mantener consistencia visual
 */

export const tokens = {
  // 🟥 Color principal (Gobierno actual)
  primary: {
    main: "#6C3841",
    light: "#8A5560",
    dark: "#4A242C",
    contrastText: "#FFFFFF",
  },

  // ⚪ Grises elegantes (fondos / texto)
  grey: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // 🟢 Estados
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#2563EB",

  // 🌫️ Fondos
  background: {
    default: "#F3F4F6",
    paper: "#FFFFFF",
  },

  // ✨ Extras
  shadowSoft: "0 10px 30px rgba(0,0,0,0.08)",
};

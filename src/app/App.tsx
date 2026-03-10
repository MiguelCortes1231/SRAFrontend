// src/app/App.tsx
/**
 * 🚦 App raíz
 * - Solo monta las rutas 🗺️
 * - main.tsx ya envuelve ThemeProvider + Router 🚀
 */

import React from "react";
import AppRoutes from "./routes";
import GlobalLoadingOverlay from "../components/ui/GlobalLoadingOverlay";

export default function App() {
  return (<>
    <AppRoutes />
    <GlobalLoadingOverlay />
  </>)
;
}

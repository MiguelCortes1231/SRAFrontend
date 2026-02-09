// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./app/App";
import { theme } from "./theme/theme";

// 🗓️ MUI X Date Pickers (REQUERIDO)
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// 🗺️ Leaflet CSS (SIN ESTO EL MAPA SE VE ROTO)
import "leaflet/dist/leaflet.css";

// 🎨 Estilos base
import "./index.css";
import "./App.css";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 🎨 Tema global */}
    <ThemeProvider theme={theme}>
      {/* 🧼 Normaliza estilos */}
      <CssBaseline />

      {/* 🗓️ Provider de fecha/hora (SIN ESTO truena DateCalendar) */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* 🧭 Router global */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);

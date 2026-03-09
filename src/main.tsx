// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./app/App";
import { theme } from "./theme/theme";

// 🗓️ MUI X Date Pickers
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// 🗺️ Leaflet CSS
import "leaflet/dist/leaflet.css";

// 🔔 Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🎨 Estilos base
import "./index.css";
import "./App.css";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <App />

          {/* 🔔 Toasts globales */}
          <ToastContainer
            position="top-right"
            autoClose={2600}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
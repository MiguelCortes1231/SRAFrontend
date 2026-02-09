// src/layouts/AuthLayout.tsx
/**
 * 🧱 Layout de autenticación
 * - Centrado, limpio, moderno ✨
 * - Ideal para Login sin registro 🔑
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function AuthLayout() {
  return (
    <Box
      className="app-container"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            boxShadow: "0 18px 60px rgba(0,0,0,0.10)",
          }}
        >
          {/* 🏛️ Branding simple */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Plataforma de Reuniones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registro, evidencias, asistencias, QR y auditoría 📸✅🔳
          </Typography>

          {/* 🔁 Aquí se renderiza LoginPage */}
          <Outlet />
        </Paper>

        {/* 🧾 Pie discreto */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          © {new Date().getFullYear()} · Control y trazabilidad institucional 🧭
        </Typography>
      </Container>
    </Box>
  );
}

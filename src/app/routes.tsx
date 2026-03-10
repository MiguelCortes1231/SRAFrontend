// src/app/routes.tsx
/**
 * 🗺️ Rutas del sistema
 * - Separadas por Layout (Auth vs App)
 * - Protegidas con RequireAuth 🔒
 * - Listas para crecer (mocks hoy / API mañana) 🚀
 */

import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// 🧱 Layouts
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

// 🔒 Guard
import RequireAuth from "./guards/RequireAuth";

// 📄 Pages (por ahora pueden estar vacías / placeholders)
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import MeetingsListPage from "../pages/meetings/MeetingsListPage";
import MeetingCreatePage from "../pages/meetings/MeetingCreatePage";
import MeetingDetailPage from "../pages/meetings/MeetingDetailPage";
import ScanCredencialPage from "../pages/scan/ScanCredencialPage";
import MeetingEditPage from "../pages/meetings/MeetingEditPage";
import MeetingPreviewPage from "../pages/meetings/MeetingPreviewPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔑 Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* 🧱 App protegida */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* 🏠 Home */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 📊 Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 🧾 Reuniones */}
        <Route path="/meetings" element={<MeetingsListPage />} />
        <Route path="/meetings/new" element={<MeetingCreatePage />} />
        <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
        <Route path="/meetings/:meetingId/edit" element={<MeetingEditPage />} />
        <Route path="/meetings/:meetingId/preview" element={<MeetingPreviewPage />} />


      </Route>

      {/* 🧯 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

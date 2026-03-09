// src/app/guards/RequireAuth.tsx
/**
 * 🔒 Guard de autenticación
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../store/auth.store";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const location = useLocation();

  if (isAuthenticated()) {
    return <>{children}</>;
  }

  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
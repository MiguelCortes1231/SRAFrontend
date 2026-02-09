// src/app/guards/RequireAuth.tsx
/**
 * 🔒 Guard de autenticación
 * - Hoy usa localStorage (mock) 🧪
 * - Mañana lo conectamos a auth.store / API sin tocar rutas 🔁
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// 🗝️ Clave temporal para sesión (luego la centralizamos en auth.store.ts)
const AUTH_TOKEN_KEY = "reuniones_auditoria_token_v1";

/** 🧠 Lee token (mock) */
function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const token = getToken();

  // ✅ Si hay token, pasa
  if (token) return <>{children}</>;

  // 🚪 Si no hay token, mandamos al login (guardamos de dónde venía)
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

// ✅ Exportamos la key para reutilizarla luego en Login (temporal)
export { AUTH_TOKEN_KEY };

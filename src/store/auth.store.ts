// src/store/auth.store.ts
/**
 * 🗝️ Auth Store (Simple y efectivo)
 * - Maneja sesión usando localStorage (mock hoy, API mañana) 🧪➡️🌐
 * - Fuente de verdad para el guard RequireAuth 🔒
 * - No usamos Redux/Zustand para mantenerlo ligero 🪶
 */

export const AUTH_TOKEN_KEY = "reuniones_auditoria_token_v1";
export const AUTH_USER_KEY = "reuniones_auditoria_user_v1";

/** 👤 Tipo de usuario básico (puede crecer luego) */
export type AuthUser = {
  username: string;
  displayName: string;
  roles: string[]; // Ej: ["ADMIN"], ["ORGANIZADOR"]
};

/** ✅ Guarda token + usuario */
export function setSession(token: string, user: AuthUser) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // 🧯 Si falla (modo privado, etc.), no tiramos la app
  }
}

/** 🧠 Obtiene token */
export function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** 👤 Obtiene usuario */
export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** 🚪 Limpia sesión */
export function clearSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {}
}

/** 🔒 ¿Está logueado? */
export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

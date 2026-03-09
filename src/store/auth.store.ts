// src/store/auth.store.ts
/**
 * 🗝️ Auth Store
 * -----------------------------------------
 * Maneja:
 * - token JWT
 * - tipo de token (Bearer)
 * - expiración
 * - usuario autenticado
 */

export const AUTH_TOKEN_KEY = "reuniones_auditoria_token_v1";
export const AUTH_TOKEN_TYPE_KEY = "reuniones_auditoria_token_type_v1";
export const AUTH_EXPIRES_AT_KEY = "reuniones_auditoria_expires_at_v1";
export const AUTH_USER_KEY = "reuniones_auditoria_user_v1";

/** 👤 Usuario real que regresa el backend */
export type AuthUser = {
  id: number;
  username: string;
  nombre: string;
};

/** ✅ Payload de sesión */
export type AuthSession = {
  token: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // segundos
  user: AuthUser;
};

/** 💾 Guardar sesión */
export function setSession(session: AuthSession) {
  try {
    const expiresAt = Date.now() + session.expiresIn * 1000;

    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(AUTH_TOKEN_TYPE_KEY, session.tokenType);
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  } catch {
    // 🧯 noop
  }
}

/** 🎟️ Obtener token */
export function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** 🏷️ Obtener tipo */
export function getTokenType(): string {
  try {
    return localStorage.getItem(AUTH_TOKEN_TYPE_KEY) || "Bearer";
  } catch {
    return "Bearer";
  }
}

/** 👤 Obtener usuario */
export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** ⏳ Obtener expiración */
export function getExpiresAt(): number | null {
  try {
    const raw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
    if (!raw) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

/** ✅ ¿Hay sesión válida? */
export function isAuthenticated(): boolean {
  const token = getToken();
  const expiresAt = getExpiresAt();

  if (!token || !expiresAt) return false;

  return Date.now() < expiresAt;
}

/** 🧹 Limpiar sesión */
export function clearSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // 🧯 noop
  }
}
// src/store/auth.store.ts
/**
 * 🗝️ Auth Store
 * -----------------------------------------
 * Maneja:
 * - token JWT
 * - tipo de token
 * - expiración
 * - usuario autenticado
 *
 * 🚪 Logout:
 * - limpia toda la sesión del frontend
 */

export const AUTH_TOKEN_KEY = "reuniones_auditoria_token_v1";
export const AUTH_TOKEN_TYPE_KEY = "reuniones_auditoria_token_type_v1";
export const AUTH_EXPIRES_AT_KEY = "reuniones_auditoria_expires_at_v1";
export const AUTH_USER_KEY = "reuniones_auditoria_user_v1";

export type AuthUser = {
  id: number;
  username: string;
  nombre: string;
};

export type AuthSession = {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export function setSession(session: AuthSession) {
  try {
    const expiresAt = Date.now() + session.expiresIn * 1000;

    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(AUTH_TOKEN_TYPE_KEY, session.tokenType);
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  } catch {
    // noop
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getTokenType(): string {
  try {
    return localStorage.getItem(AUTH_TOKEN_TYPE_KEY) || "Bearer";
  } catch {
    return "Bearer";
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

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

export function isAuthenticated(): boolean {
  const token = getToken();
  const expiresAt = getExpiresAt();

  if (!token || !expiresAt) return false;
  return Date.now() < expiresAt;
}

/**
 * 🧹 Limpia toda la sesión del frontend
 * -----------------------------------------
 * ⚠️ Esto limpia TODO el localStorage del sitio.
 * Lo hago así porque pediste eliminar todo el localStorage de la sesión.
 */
export function clearSession() {
  try {
    localStorage.clear();
  } catch {
    // noop
  }
}
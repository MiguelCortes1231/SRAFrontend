// src/services/auth.service.ts
/**
 * 🔁 Auth Service (Mock-first)
 * - Unifica acceso a login
 * - Cambia un switch y listo: mock → API real 🌐
 */

import { mockLogin, type LoginPayload, type LoginResponse } from "../mocks/auth.mock";
import { setSession, clearSession } from "../store/auth.store";

// ✅ Flag para cambiar mock → api
// Hoy dejamos mock = true porque NO hay API aún 🧪
const USE_MOCK = true;

/** ✅ Login (mock o api) */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  if (USE_MOCK) {
    const res = await mockLogin(payload);
    // 🗝️ Guardamos sesión aquí (single source)
    setSession(res.token, res.user);
    return res;
  }

  // 🌐 FUTURO: API real
  // const res = await http.post<LoginResponse>("/auth/login", payload);
  // setSession(res.data.token, res.data.user);
  // return res.data;

  throw new Error("API no configurada todavía 🚧");
}

/** 🚪 Logout */
export function logout() {
  clearSession();
}

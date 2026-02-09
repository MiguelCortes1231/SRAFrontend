// src/mocks/auth.mock.ts
/**
 * 🧪 Mock Auth
 * - Simula login sin backend
 * - Responde como si fuera un API real 🌐
 * - Mañana lo cambias por un fetch/axios real sin tocar la UI 🔁
 */

import type { AuthUser } from "../store/auth.store";

/** 🔐 Usuarios mock (luego puede venir de API) */
const USERS: Array<{ username: string; password: string; user: AuthUser }> = [
  {
    username: "admin",
    password: "admin123",
    user: {
      username: "admin",
      displayName: "Administrador General 👑",
      roles: ["ADMIN"],
    },
  },
  {
    username: "organizador",
    password: "org123",
    user: {
      username: "organizador",
      displayName: "Organizador de Reuniones 🧭",
      roles: ["ORGANIZADOR"],
    },
  },
];

/** ⏳ Simula latencia real */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 🎟️ Genera token fake (mock) */
function fakeToken(username: string) {
  // ⚠️ No es JWT real, solo un string
  const stamp = Date.now().toString(36);
  return `mock.${username}.${stamp}`;
}

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  expiresInMinutes: number; // ⏱️ Para futura UX (expiración real)
};

/** ✅ Login mock */
export async function mockLogin(payload: LoginPayload): Promise<LoginResponse> {
  await sleep(650); // ⏳ “se siente” como API real

  const found = USERS.find(
    (u) =>
      u.username.toLowerCase() === payload.username.toLowerCase() &&
      u.password === payload.password
  );

  if (!found) {
    // ❌ Error típico de API
    throw new Error("Usuario o contraseña incorrectos ❌");
  }

  return {
    token: fakeToken(found.username),
    user: found.user,
    expiresInMinutes: 100, // ⏱️ alineado a tu idea de sesión
  };
}

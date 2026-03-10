// src/services/auth.service.ts
/**
 * 🔁 Auth Service
 */

import { http } from "./http";
import { clearSession, setSession, type AuthUser } from "../store/auth.store";

export type LoginPayload = {
  username: string;
  password: string;
};

type LoginApiResponse = {
  token: string;
  type: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    nombre: string;
  };
};

export async function login(payload: LoginPayload) {
  const res = await http.post<LoginApiResponse>("/loginjwt", {
    username: payload.username,
    password: payload.password,
  });

  const data = res.data;

  const user: AuthUser = {
    id: data.user.id,
    username: data.user.username,
    nombre: data.user.nombre,
  };

  setSession({
    token: data.token,
    tokenType: data.type || "Bearer",
    expiresIn: data.expires_in,
    user,
  });

  return data;
}

export function logout() {
  clearSession();
}
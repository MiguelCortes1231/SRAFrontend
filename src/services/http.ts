// src/services/http.ts
/**
 * 🌐 Axios base
 * -----------------------------------------
 * - Usa JWT automáticamente
 * - Si expira la sesión, limpia storage
 */

import axios from "axios";
import {
  clearSession,
  getToken,
  getTokenType,
  isAuthenticated,
} from "../store/auth.store";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://servdes1.proyectoqroo.com.mx/gsv/ibeta/api";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/** 🛡️ Request interceptor */
http.interceptors.request.use((config) => {
  const token = getToken();

  if (token && isAuthenticated()) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `${getTokenType()} ${token}`;
  }

  return config;
});

/** 🚨 Response interceptor */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔒 Si backend responde no autorizado
    if (error?.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);
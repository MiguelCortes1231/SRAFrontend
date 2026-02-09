// src/services/http.ts
/**
 * 🌐 Axios base
 * - Hoy: puede no usarse si estamos full mock
 * - Mañana: lo usas para conectar con API real 🔁
 */

import axios from "axios";
import { getToken } from "../store/auth.store";

// 🔧 Aquí después pones tu API base (cuando te lo den)
// Ej: https://api.reuniones.qroo.gob.mx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // ⏳ 30s
});

/** 🛡️ Interceptor para token */
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

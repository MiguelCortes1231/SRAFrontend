// src/services/http.ts
/**
 * 🌐 HTTP Service
 * ---------------------------------------------------
 * Axios base para toda la app
 *
 * ✅ Incluye:
 * - Authorization Bearer
 * - Base URL
 * - Cola global para GET
 * - Retraso aleatorio entre 1 y 2 segundos
 *
 * 🎯 Objetivo:
 * evitar que muchas peticiones GET salgan de golpe
 */

import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { getToken, getTokenType, clearSession } from "../store/auth.store";
import { getRequestScheduler } from "../utils/requestScheduler";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://servdes1.proyectoqroo.com.mx/gsv/ibeta/api";

type ExtendedConfig = InternalAxiosRequestConfig & {
  __skipGetQueue?: boolean;
};

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * 🔐 Interceptor de request
 * ---------------------------------------------------
 * - mete token
 * - para GET, aplica cola secuencial
 */
instance.interceptors.request.use(
  async (config: ExtendedConfig) => {
    const token = getToken();
    const tokenType = getTokenType();

    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (token) {
      config.headers.set("Authorization", `${tokenType} ${token}`);
    }

    // ✅ Solo en GET y si no está marcado para saltarse la cola
    if (
      String(config.method || "get").toLowerCase() === "get" &&
      !config.__skipGetQueue
    ) {
      await getRequestScheduler.enqueue(async () => config);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 🚨 Interceptor de response
 */
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearSession();
    }

    return Promise.reject(error);
  }
);

/**
 * ✅ HTTP exportado
 */
export const http = instance;

/**
 * 🧩 Helper opcional
 * ---------------------------------------------------
 * Si alguna vez quieres hacer un GET sin cola
 * (por ejemplo login no aplica porque es POST, pero
 * otro endpoint muy urgente sí podría usarlo),
 * puedes llamar:
 *
 * httpGetImmediate("/ruta", { params: ... })
 */
export async function httpGetImmediate<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
) {
  return instance.get<T>(url, {
    ...(config || {}),
    __skipGetQueue: true,
  } as ExtendedConfig);
}
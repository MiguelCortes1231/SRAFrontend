// src/services/http.ts
/**
 * 🌐 HTTP Client robusto
 * ---------------------------------------------------
 * ✅ Authorization Bearer
 * ✅ Cola global para GET
 * ✅ Retry automático para 429
 * ✅ Respeta Retry-After
 * ✅ Loader global fullscreen
 */

import axios from "axios";
import type {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { clearSession, getToken, getTokenType } from "../store/auth.store";
import { getRequestScheduler } from "../utils/requestScheduler";
import { loadingService } from "./loading.service";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://servdes1.proyectoqroo.com.mx/gsv/ibeta/api";

type ExtendedConfig = InternalAxiosRequestConfig & {
  __skipGetQueue?: boolean;
  __retryCount?: number;
  __showGlobalLoader?: boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseRetryAfter(value?: string | null): number | null {
  if (!value) return null;

  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) {
    return asNumber * 1000;
  }

  const asDate = new Date(value).getTime();
  if (!Number.isNaN(asDate)) {
    const diff = asDate - Date.now();
    return diff > 0 ? diff : null;
  }

  return null;
}

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/* =========================================================
 * 🔐 Request interceptor
 * ========================================================= */
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

    const method = String(config.method || "get").toLowerCase();

    // ✅ Por defecto todas las requests muestran loader
    if (config.__showGlobalLoader !== false) {
      loadingService.show();
    }

    // ✅ Cola solo para GET
    if (method === "get" && !config.__skipGetQueue) {
      await getRequestScheduler.enqueue(async () => config);
    }

    return config;
  },
  (error) => {
    loadingService.hide();
    return Promise.reject(error);
  }
);

/* =========================================================
 * 🚨 Response interceptor
 * ========================================================= */
instance.interceptors.response.use(
  (response) => {
    const config = response.config as ExtendedConfig;

    if (config.__showGlobalLoader !== false) {
      loadingService.hide();
    }

    return response;
  },
  async (error: AxiosError) => {
    const response = error.response;
    const config = error.config as ExtendedConfig | undefined;

    if (config?.__showGlobalLoader !== false) {
      loadingService.hide();
    }

    if (response?.status === 401) {
      clearSession();
      return Promise.reject(error);
    }

    const isGet = String(config?.method || "get").toLowerCase() === "get";
    const canRetry = isGet && response?.status === 429 && config;

    if (canRetry) {
      config.__retryCount = config.__retryCount ?? 0;

      if (config.__retryCount < 2) {
        config.__retryCount += 1;

        const retryAfterHeader = response?.headers?.["retry-after"];
        const retryAfterMs = parseRetryAfter(
          Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader
        );

        const waitMs =
          retryAfterMs ??
          randomBetween(2500, 4500) * config.__retryCount;

        await sleep(waitMs);

        return instance.request(config);
      }
    }

    return Promise.reject(error);
  }
);

export const http = instance;

/**
 * ⚡ GET inmediato sin cola
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
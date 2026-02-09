// src/services/ine.service.ts
/**
 * 🔁 INE Service (Mock-first)
 * -----------------------------------------
 * - UI siempre llama aquí
 * - Hoy mock 🧪
 * - Mañana API real 🌐
 */

import { mockIneScan, type IneScanRequest, type IneScanResponse } from "../mocks/ine.mock";
// import { http } from "./http"; // 🌐 futuro

const USE_MOCK = true;

export type { IneScanRequest, IneScanResponse };

/** 🪪 Escaneo (mock → api) */
export async function scanIne(payload: IneScanRequest): Promise<IneScanResponse> {
  if (USE_MOCK) return mockIneScan(payload);

  // 🌐 Futuro:
  // const res = await http.post<IneScanResponse>("/ocr", payload);
  // return res.data;

  throw new Error("API de escaneo no configurada todavía 🚧");
}

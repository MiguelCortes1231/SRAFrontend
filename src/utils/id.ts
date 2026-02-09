// src/utils/id.ts
/**
 * 🆔 Utilidad: IDs
 * -----------------------------------------
 * - Wrapper de uuid
 * - Si mañana cambias a IDs del backend, cambias aquí y listo 🔁
 */

import { v4 as uuidv4 } from "uuid";

/** ✅ Genera ID único */
export function newId(): string {
  return uuidv4();
}

/** 🔳 Genera valor recomendado para QR */
export function buildQrValue(meetingId: string): string {
  // 📌 Hoy solo guardamos el ID
  // 🌐 Mañana puede ser una URL pública: https://.../meetings/{id}
  return `MEETING:${meetingId}`;
}

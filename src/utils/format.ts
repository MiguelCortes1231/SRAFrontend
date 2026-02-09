// src/utils/format.ts
/**
 * 🗓️ Utilidad: Formatos
 * -----------------------------------------
 * - Fechas legibles
 * - Textos cortos para UI
 */

import dayjs from "dayjs";

/** 📅 ISO → "09 Feb 2026" */
export function formatDateShort(iso: string): string {
  const d = dayjs(iso);
  if (!d.isValid()) return "Fecha inválida ❌";
  return d.format("DD MMM YYYY");
}

/** 🕒 ISO → "09 Feb 2026 14:30" */
export function formatDateTime(iso: string): string {
  const d = dayjs(iso);
  if (!d.isValid()) return "Fecha inválida ❌";
  return d.format("DD MMM YYYY HH:mm");
}

/** ✂️ Acorta un texto con ellipsis */
export function ellipsis(text: string, max = 45): string {
  const t = String(text ?? "");
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

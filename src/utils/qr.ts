// src/utils/qr.ts
/**
 * 🔳 Helpers para QR
 * -----------------------------------------
 * Genera URLs públicas del frontend para
 * pantallas como preview de reunión.
 */

export function buildMeetingPreviewUrl(meetingId: string | number): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : import.meta.env.VITE_APP_BASE_URL || "http://localhost:5173";

  return `${origin}/sra/meetings/${meetingId}/preview`;
}
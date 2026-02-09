// src/models/evidence.ts
/**
 * 📸 Modelo: Evidencia
 * -----------------------------------------
 * Fase 2: Evidencia Inicial Digital (YT/FB)
 * Fase 4: Foto grupal
 * Fase 5: Evidencia Final Digital (YT/FB)
 */

export type EvidenceType = "INICIAL_DIGITAL" | "FINAL_DIGITAL" | "FOTO_GRUPAL";
export type EvidencePlatform = "YT" | "FB" | "FISICA";

export type Evidence = {
  id: string;
  meetingId: string;

  type: EvidenceType;
  platform: EvidencePlatform;

  // 🖼️ Imagen (por ahora base64 o URL local mock)
  imageUrl: string;

  // 🧾 Metadata extra (puede crecer con API)
  createdAtISO: string;

  // 🏷️ Observaciones / notas (auditoría)
  notes?: string;
};

/** 🧠 Helpers: validación rápida */
export function isDigitalEvidence(e: Evidence) {
  return e.type === "INICIAL_DIGITAL" || e.type === "FINAL_DIGITAL";
}

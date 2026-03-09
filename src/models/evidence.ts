// src/models/evidence.ts
/**
 * 📸 Modelo: Evidencia
 * -----------------------------------------
 * Soporta:
 * - Fase 2 inicial (YT / FB / WA)
 * - Fase 4 foto grupal
 * - Fase 5 final (YT / FB / WA)
 */

export type EvidenceType = "INICIAL_DIGITAL" | "FINAL_DIGITAL" | "FOTO_GRUPAL";
export type EvidencePlatform = "YT" | "FB" | "WA" | "FISICA";

export type Evidence = {
  id: string;
  meetingId: string;

  type: EvidenceType;
  platform: EvidencePlatform;

  // 🖼️ path original backend
  imagePath?: string | null;

  // 🖼️ URL resuelta o blob URL
  imageUrl: string;

  // 🔢 valor capturado en esa red (suscriptores / seguidores / etc.)
  value?: number | null;

  createdAtISO: string;
  notes?: string;
};

export function isDigitalEvidence(e: Evidence) {
  return e.type === "INICIAL_DIGITAL" || e.type === "FINAL_DIGITAL";
}
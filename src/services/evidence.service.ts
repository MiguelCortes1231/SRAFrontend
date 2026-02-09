// src/services/evidence.service.ts
/**
 * 🔁 Evidence Service
 * -----------------------------------------
 * - UI llama aquí siempre
 * - Hoy usa mocks 🧪
 * - Mañana cambia a API 🔁
 */

import type { EvidencePlatform, EvidenceType } from "../models/evidence";
import type { Meeting } from "../models/meeting";
import { mockAddEvidence, mockRemoveEvidence } from "../mocks/evidence.mock";

// const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const USE_MOCK = true;

/** 📤 Agregar evidencia */
export async function addEvidence(params: {
  meetingId: string;
  type: EvidenceType;
  platform: EvidencePlatform;
  imageUrl: string;
  notes?: string;
}): Promise<Meeting> {
  if (USE_MOCK) return mockAddEvidence(params);
  throw new Error("API no configurada todavía 🚧");
}

/** 🗑️ Quitar evidencia */
export async function removeEvidence(meetingId: string, evidenceId: string): Promise<Meeting> {
  if (USE_MOCK) return mockRemoveEvidence(meetingId, evidenceId);
  throw new Error("API no configurada todavía 🚧");
}

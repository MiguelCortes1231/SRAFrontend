// src/services/evidence.service.ts
/**
 * 🔁 Evidence Service
 * -----------------------------------------
 * ✅ REAL API:
 * - getProtectedImageBlobUrl()
 * - uploadPhase2()
 * - uploadPhase4()
 *
 * 🧪 MOCK:
 * - addEvidence()
 * - removeEvidence()
 *
 * Nota:
 * Las imágenes protegidas NO deben ir directo en <img src="...">
 * porque necesitan Authorization header. Por eso usamos blob.
 */

import { http } from "./http";
import type { Meeting } from "../models/meeting";
import type { EvidencePlatform, EvidenceType } from "../models/evidence";

// 🧪 mocks temporales
import { mockAddEvidence, mockRemoveEvidence } from "../mocks/evidence.mock";

/** 🔐 Imagen protegida -> blob URL */
export async function getProtectedImageBlobUrl(filePath: string): Promise<string> {
  const res = await http.get("/getImage", {
    params: { url: filePath },
    responseType: "blob",
  });

  return URL.createObjectURL(res.data);
}

/** 📤 Fase 2 real */
export async function uploadPhase2(params: {
  agendaId: string | number;
  facebookFile?: File | null;
  youtubeFile?: File | null;
  whatsappFile?: File | null;
  facebookValue?: number | null;
  youtubeValue?: number | null;
  whatsappValue?: number | null;
}): Promise<Meeting> {
  const fd = new FormData();

  if (params.facebookFile) fd.append("Facebook1", params.facebookFile);
  if (params.youtubeFile) fd.append("Youtube1", params.youtubeFile);
  if (params.whatsappFile) fd.append("Whatsapp1", params.whatsappFile);

  if (params.facebookValue !== undefined && params.facebookValue !== null) {
    fd.append("FacebookValor1", String(params.facebookValue));
  }

  if (params.youtubeValue !== undefined && params.youtubeValue !== null) {
    fd.append("YoutubeValor1", String(params.youtubeValue));
  }

  if (params.whatsappValue !== undefined && params.whatsappValue !== null) {
    fd.append("WhatsappValor1", String(params.whatsappValue));
  }

  await http.post(`/fase2/${params.agendaId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const { getMeeting } = await import("./meetings.service");
  return getMeeting(String(params.agendaId));
}

/** 📸 Fase 4 real */
export async function uploadPhase4(params: {
  agendaId: string | number;
  photoFile: File;
}): Promise<Meeting> {
  const fd = new FormData();
  fd.append("FotoGrupal", params.photoFile);

  await http.post(`/fase4/${params.agendaId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const { getMeeting } = await import("./meetings.service");
  return getMeeting(String(params.agendaId));
}

/* =========================================================
 * 🧪 MOCK TEMPORAL PARA OTRAS FASES
 * ========================================================= */

export async function addEvidence(params: {
  meetingId: string;
  type: EvidenceType;
  platform: EvidencePlatform;
  imageUrl: string;
  notes?: string;
}): Promise<Meeting> {
  return mockAddEvidence(params);
}

export async function removeEvidence(meetingId: string, evidenceId: string): Promise<Meeting> {
  return mockRemoveEvidence(meetingId, evidenceId);
}
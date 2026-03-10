// src/mocks/evidence.mock.ts
/**
 * 📸 Mock Evidence
 * -----------------------------------------
 * - Sube evidencias (YT/FB inicial/final) y foto grupal
 * - Guarda como "imageUrl" base64 (o blob url) en mock DB
 */

import type { Evidence, EvidencePlatform, EvidenceType } from "../models/evidence";
import type { Meeting } from "../models/meeting";
import { loadDB, saveDB } from "./db";
import { newId } from "../utils/id";


function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireMeeting(meetingId: string): Meeting {
  const db = loadDB();
  const found = db.meetings.find((m) => m.id === meetingId);
  if (!found) throw new Error("Reunión no encontrada ❌");
  return found;
}

function persistMeeting(updated: Meeting) {
  const db = loadDB();
  const idx = db.meetings.findIndex((m) => m.id === updated.id);
  if (idx === -1) throw new Error("Reunión no encontrada ❌");
  db.meetings[idx] = updated;
  saveDB(db);
}

/** ✅ Agrega evidencia */
export async function mockAddEvidence(params: {
  meetingId: string;
  type: EvidenceType;
  platform: EvidencePlatform;
  imageUrl: string; // base64 o blob url
  notes?: string;
}): Promise<Meeting> {
  await sleep(400);

  const meeting = requireMeeting(params.meetingId);

  const ev: Evidence = {
    id: newId(),
    meetingId: params.meetingId,
    type: params.type,
    platform: params.platform,
    imageUrl: params.imageUrl,
    notes: params.notes,
    createdAtISO: new Date().toISOString(),
  };

  const updated: Meeting = {
    ...meeting,
    evidences: [ev, ...meeting.evidences],
    updatedAtISO: new Date().toISOString(),
  };

  // 🧠 Actualizamos fases según tipo
  // - INICIAL_DIGITAL => fase 2 en progreso/completada si ya hay YT+FB
  // - FOTO_GRUPAL => fase 4 completada
  // - FINAL_DIGITAL => fase 5 en progreso/completada si ya hay YT+FB
  updated.flow = { ...updated.flow };

  const hasInitialYT = updated.evidences.some(
    (e) => e.type === "INICIAL_DIGITAL" && e.platform === "YT"
  );
  const hasInitialFB = updated.evidences.some(
    (e) => e.type === "INICIAL_DIGITAL" && e.platform === "FB"
  );

  const hasFinalYT = updated.evidences.some(
    (e) => e.type === "FINAL_DIGITAL" && e.platform === "YT"
  );
  const hasFinalFB = updated.evidences.some(
    (e) => e.type === "FINAL_DIGITAL" && e.platform === "FB"
  );

  const hasGroupPhoto = updated.evidences.some((e) => e.type === "FOTO_GRUPAL");

  // ✅ Fase 2
  if (hasInitialYT || hasInitialFB) updated.flow[2] = "EN_PROGRESO";
  if (hasInitialYT && hasInitialFB) updated.flow[2] = "COMPLETADA";

  // ✅ Fase 4
  if (hasGroupPhoto) updated.flow[4] = "COMPLETADA";

  // ✅ Fase 5
  if (hasFinalYT || hasFinalFB) updated.flow[5] = "EN_PROGRESO";
  if (hasFinalYT && hasFinalFB) updated.flow[5] = "COMPLETADA";

  // ✅ Fase 6: requiere inicial + final + foto
  const phase6Ready = hasInitialYT && hasInitialFB && hasFinalYT && hasFinalFB && hasGroupPhoto;
  if (phase6Ready) updated.flow[6] = "EN_PROGRESO";

  updated.metrics = computeMeetingMetrics(updated);
  updated.status = computeMeetingStatus(updated.flow);

  persistMeeting(updated);
  return updated;
}

/** 🗑️ Borra evidencia */
export async function mockRemoveEvidence(meetingId: string, evidenceId: string): Promise<Meeting> {
  await sleep(250);

  const meeting = requireMeeting(meetingId);
  const updated: Meeting = {
    ...meeting,
    evidences: meeting.evidences.filter((e) => e.id !== evidenceId),
    updatedAtISO: new Date().toISOString(),
  };

  // 🔁 Recalcular fases desde cero (simple y seguro)
  updated.flow = { ...updated.flow, 2: "PENDIENTE", 4: "PENDIENTE", 5: "PENDIENTE", 6: "PENDIENTE" };

  const hasInitialYT = updated.evidences.some(
    (e) => e.type === "INICIAL_DIGITAL" && e.platform === "YT"
  );
  const hasInitialFB = updated.evidences.some(
    (e) => e.type === "INICIAL_DIGITAL" && e.platform === "FB"
  );
  const hasFinalYT = updated.evidences.some(
    (e) => e.type === "FINAL_DIGITAL" && e.platform === "YT"
  );
  const hasFinalFB = updated.evidences.some(
    (e) => e.type === "FINAL_DIGITAL" && e.platform === "FB"
  );
  const hasGroupPhoto = updated.evidences.some((e) => e.type === "FOTO_GRUPAL");

  if (hasInitialYT || hasInitialFB) updated.flow[2] = "EN_PROGRESO";
  if (hasInitialYT && hasInitialFB) updated.flow[2] = "COMPLETADA";

  if (hasGroupPhoto) updated.flow[4] = "COMPLETADA";

  if (hasFinalYT || hasFinalFB) updated.flow[5] = "EN_PROGRESO";
  if (hasFinalYT && hasFinalFB) updated.flow[5] = "COMPLETADA";

  const phase6Ready = hasInitialYT && hasInitialFB && hasFinalYT && hasFinalFB && hasGroupPhoto;
  if (phase6Ready) updated.flow[6] = "EN_PROGRESO";

  updated.metrics = computeMeetingMetrics(updated);
  updated.status = computeMeetingStatus(updated.flow);

  persistMeeting(updated);
  return updated;
}

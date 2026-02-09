// src/models/meeting.ts
/**
 * 🧾 Modelo: Reunión
 * -----------------------------------------
 * Objetivo:
 * - Tener una estructura única para toda la app 🧠
 * - Controlar el flujo por fases (1..6) 🧭
 * - Preparado para mocks hoy y API mañana 🔁
 */

import type { Evidence } from "./evidence";
import type { AttendanceAdult, AttendanceMinor } from "./attendance";

/** 🏷️ Tipos de reunión */
export type MeetingType = "ASAMBLEA" | "EVENTO";

/** 🧭 Fases del flujo */
export type MeetingPhase = 1 | 2 | 3 | 4 | 5 | 6;

/** 🏁 Estados por fase (para UI vistosa) */
export type PhaseStatus = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "OBSERVADA";

/** 🏷️ Estado general de la reunión */
export type MeetingStatus = "BORRADOR" | "EN_PROCESO" | "COMPLETADA" | "OBSERVADA";

/** 📍 Ubicación GPS */
export type GeoPoint = {
  lat: number;
  lng: number;
};

/** 👥 Personas clave */
export type MeetingPerson = {
  name: string;
};

/**
 * 🧾 Datos principales de la reunión (Fase 1)
 * Nota: mantenemos strings para distritos/municipio/sección para compatibilidad con catálogos futuros.
 */
export type MeetingCore = {
  type: MeetingType;
  dateISO: string; // 📅 ISO "2026-02-09"
  sede: string;
  location: GeoPoint; // 📍 lat/lng
  address: string; // 🏠 dirección libre (aparte de GPS)
  organizer: MeetingPerson; // 🧑 Organizador
  enlace: MeetingPerson; // 🧑 Enlace
  distritoFederal: string;
  distritoLocal: string;
  municipio: string;
  seccion: string;
};

/** 🧠 Progreso por fase */
export type MeetingFlow = Record<MeetingPhase, PhaseStatus>;

/** 🔳 QR data */
export type MeetingQr = {
  qrValue: string; // lo que codificamos en el QR (ej. URL o meetingId)
  generatedAtISO: string;
};

/** 📊 Métricas (para dashboard / auditoría) */
export type MeetingMetrics = {
  adultsCount: number;
  minorsCount: number;
  evidenceCount: number;
  lastUpdateISO: string;
};

/** ✅ Modelo principal: Meeting */
export type Meeting = {
  id: string;
  createdAtISO: string;
  updatedAtISO: string;

  status: MeetingStatus;

  core: MeetingCore;
  flow: MeetingFlow;
  qr: MeetingQr;

  // 📸 Evidencias (Fase 2 y 5) + Foto grupal (Fase 4)
  evidences: Evidence[];

  // 🧑‍🤝‍🧑 Asistencias (Fase 3)
  attendanceAdults: AttendanceAdult[];
  attendanceMinors: AttendanceMinor[];

  metrics: MeetingMetrics;
};

/** 🧰 Helpers */

/** 🧭 Flow inicial (todo pendiente excepto fase 1 en progreso) */
export function createInitialFlow(): MeetingFlow {
  return {
    1: "EN_PROGRESO",
    2: "PENDIENTE",
    3: "PENDIENTE",
    4: "PENDIENTE",
    5: "PENDIENTE",
    6: "PENDIENTE",
  };
}

/** 🧮 Recalcula métricas de la reunión */
export function computeMeetingMetrics(meeting: Meeting): MeetingMetrics {
  return {
    adultsCount: meeting.attendanceAdults.length,
    minorsCount: meeting.attendanceMinors.length,
    evidenceCount: meeting.evidences.length,
    lastUpdateISO: new Date().toISOString(),
  };
}

/** ✅ Determina estatus general basado en flow */
export function computeMeetingStatus(flow: MeetingFlow): MeetingStatus {
  const statuses = Object.values(flow);

  // 🟠 Si alguna fase está observada
  if (statuses.includes("OBSERVADA")) return "OBSERVADA";

  // ✅ Si todas completadas
  const allDone = statuses.every((s) => s === "COMPLETADA");
  if (allDone) return "COMPLETADA";

  // 🟡 Si apenas fase 1 o hay progreso
  const anyProgress = statuses.includes("EN_PROGRESO") || statuses.includes("COMPLETADA");
  if (anyProgress) return "EN_PROCESO";

  return "BORRADOR";
}

// src/mocks/meetings.mock.ts
/**
 * 🧾 Mock Meetings
 * -----------------------------------------
 * - CRUD reuniones
 * - Cambio de fases
 * - Asistencias (adultos + menores)
 * - Todo trabaja sobre db.ts 🧠
 */

import type {
  Meeting,
  MeetingCore,
  MeetingFlow,
  MeetingPhase,
  PhaseStatus,
} from "../models/meeting";
import {
  computeMeetingMetrics,
  computeMeetingStatus,
  createInitialFlow,
} from "../models/meeting";
import type { AttendanceAdult, AttendanceMinor } from "../models/attendance";

import { loadDB, saveDB } from "./db";
import { buildQrValue, newId } from "../utils/id";

/** ⏳ Simula latencia */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 🔍 Encuentra reunión o truena */
function requireMeeting(meetingId: string): Meeting {
  const db = loadDB();
  const found = db.meetings.find((m) => m.id === meetingId);
  if (!found) throw new Error("Reunión no encontrada ❌");
  return found;
}

/** 💾 Guarda reunión actualizada */
function persistMeeting(updated: Meeting) {
  const db = loadDB();
  const idx = db.meetings.findIndex((m) => m.id === updated.id);
  if (idx === -1) throw new Error("Reunión no encontrada ❌");
  db.meetings[idx] = updated;
  saveDB(db);
}

/** ✅ Listar reuniones */
export async function mockListMeetings(): Promise<Meeting[]> {
  await sleep(250);
  const db = loadDB();
  // 🧾 Orden: más recientes primero
  return [...db.meetings].sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
}

/** ✅ Obtener por id */
export async function mockGetMeeting(meetingId: string): Promise<Meeting> {
  await sleep(180);
  return requireMeeting(meetingId);
}

/** ✅ Crear reunión (Fase 1) */
export async function mockCreateMeeting(core: MeetingCore): Promise<Meeting> {
  await sleep(450);

  const now = new Date().toISOString();
  const id = newId();

  const flow: MeetingFlow = createInitialFlow();

  const meeting: Meeting = {
    id,
    createdAtISO: now,
    updatedAtISO: now,

    status: "EN_PROCESO",

    core,
    flow,

    qr: {
      qrValue: buildQrValue(id),
      generatedAtISO: now,
    },

    evidences: [],
    attendanceAdults: [],
    attendanceMinors: [],

    metrics: {
      adultsCount: 0,
      minorsCount: 0,
      evidenceCount: 0,
      lastUpdateISO: now,
    },
  };

  const db = loadDB();
  db.meetings.push(meeting);
  saveDB(db);

  return meeting;
}

/** ✅ Actualizar datos core (por si editan fase 1) */
export async function mockUpdateMeetingCore(
  meetingId: string,
  patch: Partial<MeetingCore>
): Promise<Meeting> {
  await sleep(350);

  const meeting = requireMeeting(meetingId);

  const updated: Meeting = {
    ...meeting,
    core: { ...meeting.core, ...patch },
    updatedAtISO: new Date().toISOString(),
  };

  // 📊 recalculamos status/métricas (por consistencia)
  updated.metrics = computeMeetingMetrics(updated);
  updated.status = computeMeetingStatus(updated.flow);

  persistMeeting(updated);
  return updated;
}

/** 🧭 Actualiza estado de una fase (para UI stepper) */
export async function mockSetPhaseStatus(
  meetingId: string,
  phase: MeetingPhase,
  status: PhaseStatus
): Promise<Meeting> {
  await sleep(220);

  const meeting = requireMeeting(meetingId);

  const updated: Meeting = {
    ...meeting,
    flow: { ...meeting.flow, [phase]: status },
    updatedAtISO: new Date().toISOString(),
  };

  updated.status = computeMeetingStatus(updated.flow);
  updated.metrics = computeMeetingMetrics(updated);

  persistMeeting(updated);
  return updated;
}

/** 🧑‍🤝‍🧑 Agregar asistencia adulto */
export async function mockAddAdultAttendance(
  meetingId: string,
  payload: Omit<AttendanceAdult, "id" | "meetingId" | "createdAtISO">
): Promise<Meeting> {
  await sleep(260);

  const meeting = requireMeeting(meetingId);

  const item: AttendanceAdult = {
    id: newId(),
    meetingId,
    fullName: payload.fullName,
    phone: payload.phone,
    createdAtISO: new Date().toISOString(),
  };

  const updated: Meeting = {
    ...meeting,
    attendanceAdults: [item, ...meeting.attendanceAdults],
    updatedAtISO: new Date().toISOString(),
  };

  // 🧠 Si ya hay asistencias, marcamos fase 3 en progreso/completada según regla
  const phase3: PhaseStatus =
    updated.attendanceAdults.length + updated.attendanceMinors.length > 0
      ? "EN_PROGRESO"
      : "PENDIENTE";

  updated.flow = { ...updated.flow, 3: phase3 };
  updated.status = computeMeetingStatus(updated.flow);
  updated.metrics = computeMeetingMetrics(updated);

  persistMeeting(updated);
  return updated;
}

/** 🧒 Agregar asistencia menor (>=17) */
export async function mockAddMinorAttendance(
  meetingId: string,
  payload: Omit<AttendanceMinor, "id" | "meetingId" | "createdAtISO">
): Promise<Meeting> {
  await sleep(280);

  const meeting = requireMeeting(meetingId);

  const item: AttendanceMinor = {
    id: newId(),
    meetingId,
    ...payload,
    createdAtISO: new Date().toISOString(),
  };

  const updated: Meeting = {
    ...meeting,
    attendanceMinors: [item, ...meeting.attendanceMinors],
    updatedAtISO: new Date().toISOString(),
  };

  const phase3: PhaseStatus =
    updated.attendanceAdults.length + updated.attendanceMinors.length > 0
      ? "EN_PROGRESO"
      : "PENDIENTE";

  updated.flow = { ...updated.flow, 3: phase3 };
  updated.status = computeMeetingStatus(updated.flow);
  updated.metrics = computeMeetingMetrics(updated);

  persistMeeting(updated);
  return updated;
}

/** 🗑️ Eliminar reunión */
export async function mockDeleteMeeting(meetingId: string): Promise<void> {
  await sleep(260);
  const db = loadDB();
  db.meetings = db.meetings.filter((m) => m.id !== meetingId);
  saveDB(db);
}

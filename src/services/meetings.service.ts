// src/services/meetings.service.ts
/**
 * 🔁 Meetings Service
 * -----------------------------------------
 * - UI llama aquí siempre
 * - Hoy usa mocks 🧪
 * - Mañana cambia a API sin tocar páginas 🔁
 */

import type { Meeting, MeetingCore, MeetingPhase, PhaseStatus } from "../models/meeting";
import type { AttendanceAdult, AttendanceMinor } from "../models/attendance";

// 🧪 Mocks
import {
  mockAddAdultAttendance,
  mockAddMinorAttendance,
  mockCreateMeeting,
  mockDeleteMeeting,
  mockGetMeeting,
  mockListMeetings,
  mockSetPhaseStatus,
  mockUpdateMeetingCore,
} from "../mocks/meetings.mock";

// const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const USE_MOCK = true;

/** 📋 Listar */
export async function listMeetings(): Promise<Meeting[]> {
  if (USE_MOCK) return mockListMeetings();
  throw new Error("API no configurada todavía 🚧");
}

/** 🔎 Obtener */
export async function getMeeting(meetingId: string): Promise<Meeting> {
  if (USE_MOCK) return mockGetMeeting(meetingId);
  throw new Error("API no configurada todavía 🚧");
}

/** ➕ Crear (Fase 1) */
export async function createMeeting(core: MeetingCore): Promise<Meeting> {
  if (USE_MOCK) return mockCreateMeeting(core);
  throw new Error("API no configurada todavía 🚧");
}

/** ✏️ Editar core */
export async function updateMeetingCore(
  meetingId: string,
  patch: Partial<MeetingCore>
): Promise<Meeting> {
  if (USE_MOCK) return mockUpdateMeetingCore(meetingId, patch);
  throw new Error("API no configurada todavía 🚧");
}

/** 🧭 Cambiar status fase */
export async function setPhaseStatus(
  meetingId: string,
  phase: MeetingPhase,
  status: PhaseStatus
): Promise<Meeting> {
  if (USE_MOCK) return mockSetPhaseStatus(meetingId, phase, status);
  throw new Error("API no configurada todavía 🚧");
}

/** 👨‍👩‍👧‍👦 Agregar adulto */
export async function addAdultAttendance(
  meetingId: string,
  payload: Omit<AttendanceAdult, "id" | "meetingId" | "createdAtISO">
): Promise<Meeting> {
  if (USE_MOCK) return mockAddAdultAttendance(meetingId, payload);
  throw new Error("API no configurada todavía 🚧");
}

/** 🧒 Agregar menor */
export async function addMinorAttendance(
  meetingId: string,
  payload: Omit<AttendanceMinor, "id" | "meetingId" | "createdAtISO">
): Promise<Meeting> {
  if (USE_MOCK) return mockAddMinorAttendance(meetingId, payload);
  throw new Error("API no configurada todavía 🚧");
}

/** 🗑️ Eliminar */
export async function deleteMeeting(meetingId: string): Promise<void> {
  if (USE_MOCK) return mockDeleteMeeting(meetingId);
  throw new Error("API no configurada todavía 🚧");
}

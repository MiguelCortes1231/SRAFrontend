// src/services/meetings.service.ts
/**
 * 🔁 Meetings Service (HÍBRIDO)
 * -----------------------------------------
 * ✅ REAL API:
 * - listMeetings()
 * - listMeetingsByDate()
 * - getMeeting()
 * - createMeeting()
 *
 * 🧪 MOCK temporal:
 * - setPhaseStatus()
 * - addAdultAttendance()
 * - addMinorAttendance()
 * - deleteMeeting()
 *
 * 🧠 Idea:
 * - Fase 1 ya persiste en backend real
 * - Fases 2..6 siguen mock hasta que backend libere endpoints
 */

import { http } from "./http";
import { findSectionById } from "./catalogs.service";

import type {
  Meeting,
  MeetingCore,
  MeetingFlow,
  MeetingPhase,
  PhaseStatus,
  MeetingType,
} from "../models/meeting";
import { computeMeetingMetrics, computeMeetingStatus } from "../models/meeting";
import type { AttendanceAdult, AttendanceMinor } from "../models/attendance";
import { buildQrValue } from "../utils/id";

// 🧪 mock temporal para fases no liberadas
import {
  mockAddAdultAttendance,
  mockAddMinorAttendance,
  mockDeleteMeeting,
  mockSetPhaseStatus,
} from "../mocks/meetings.mock";
import { loadDB, saveDB } from "../mocks/db";

/** 🌐 Respuesta create agenda */
type StoreAgendaResponse = {
  success: boolean;
  message: string;
  data: {
    IdReunion: number;
    FechaAgenda: string;
    Sede: string;
    Organizador: string;
    Enlace: string;
    IdSeccion: number;
    Direccion: string;
    Latitud: number;
    Longitud: number;
    IdUser: number;
    LLave: string;
    Fase: number;
    Estado: number;
    updated_at: string;
    created_at: string;
    IdAgenda: number;
  };
};

/** 🌐 Fila agenda backend */
type AgendaApiRow = {
  IdAgenda: number;
  IdReunion: number;
  FechaAgenda: string;
  Sede: string;
  Organizador: string;
  Enlace: string;
  IdSeccion: number;
  Direccion: string;
  Latitud: number;
  Longitud: number;
  Fase: number;
  Youtube1: string | null;
  Facebook1: string | null;
  Whatsapp1: string | null;
  YoutubeValor1: number | null;
  FacebookValor1: number | null;
  WhatsappValor1: number | null;
  FotoGrupal: string | null;
  Youtube2: string | null;
  Facebook2: string | null;
  Whatsapp2: string | null;
  YoutubeValor2: number | null;
  FacebookValor2: number | null;
  WhatsappValor2: number | null;
  QR: string | null;
  Llave: string | null;
  Estado: number;
  IdUser: number;
  created_at: string;
  updated_at: string;
};

type GetAgendasResponse = {
  success: boolean;
  data: AgendaApiRow[];
};

/** 🔗 Base pública de archivos */
const API_PUBLIC_ORIGIN = "https://servdes1.proyectoqroo.com.mx/gsv/ibeta";

/** 🖼️ Convierte ruta relativa a URL */
function toFileUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_PUBLIC_ORIGIN}/storage/${path.replace(/^\/+/, "")}`;
}

/** 🔢 Front -> Backend */
function meetingTypeToIdReunion(type: MeetingType): number {
  return type === "ASAMBLEA" ? 1 : 2;
}

/** 🔁 Backend -> Front */
function idReunionToMeetingType(idReunion: number): MeetingType {
  return Number(idReunion) === 1 ? "ASAMBLEA" : "EVENTO";
}

/** 🧭 Backend fase numérica -> flow frontend */
function phaseNumberToFlow(fase: number): MeetingFlow {
  return {
    1: fase >= 1 ? "COMPLETADA" : "PENDIENTE",
    2: fase >= 2 ? "COMPLETADA" : "PENDIENTE",
    3: fase >= 3 ? "COMPLETADA" : "PENDIENTE",
    4: fase >= 4 ? "COMPLETADA" : "PENDIENTE",
    5: fase >= 5 ? "COMPLETADA" : "PENDIENTE",
    6: fase >= 6 ? "COMPLETADA" : "PENDIENTE",
  };
}

/** 🧠 Sync real -> mock local */
function upsertMeetingToMock(meeting: Meeting) {
  const db = loadDB();
  const idx = db.meetings.findIndex((m) => m.id === meeting.id);

  if (idx >= 0) db.meetings[idx] = meeting;
  else db.meetings.push(meeting);

  saveDB(db);
}

/** 🧩 Mapea agenda backend -> modelo frontend */
async function mapAgendaRowToMeeting(row: AgendaApiRow): Promise<Meeting> {
  const section = await findSectionById(row.IdSeccion);
  const flow = phaseNumberToFlow(Number(row.Fase || 1));

  const evidences = [
    row.Youtube1
      ? {
          id: `yt1-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "INICIAL_DIGITAL" as const,
          platform: "YT" as const,
          imageUrl: toFileUrl(row.Youtube1)!,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Facebook1
      ? {
          id: `fb1-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "INICIAL_DIGITAL" as const,
          platform: "FB" as const,
          imageUrl: toFileUrl(row.Facebook1)!,
          createdAtISO: row.updated_at,
        }
      : null,
    row.FotoGrupal
      ? {
          id: `foto-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FOTO_GRUPAL" as const,
          platform: "FISICA" as const,
          imageUrl: toFileUrl(row.FotoGrupal)!,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Youtube2
      ? {
          id: `yt2-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FINAL_DIGITAL" as const,
          platform: "YT" as const,
          imageUrl: toFileUrl(row.Youtube2)!,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Facebook2
      ? {
          id: `fb2-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FINAL_DIGITAL" as const,
          platform: "FB" as const,
          imageUrl: toFileUrl(row.Facebook2)!,
          createdAtISO: row.updated_at,
        }
      : null,
  ].filter(Boolean) as Meeting["evidences"];

  const meeting: Meeting = {
    id: String(row.IdAgenda),
    createdAtISO: row.created_at,
    updatedAtISO: row.updated_at,

    status: computeMeetingStatus(flow),

    core: {
      // ✅ Ahora sí tomamos el tipo real desde backend
      type: idReunionToMeetingType(row.IdReunion),
      dateISO: String(row.FechaAgenda).slice(0, 10),
      sede: row.Sede || "",
      location: {
        lat: Number(row.Latitud || 0),
        lng: Number(row.Longitud || 0),
      },
      address: row.Direccion || "",
      organizer: { name: row.Organizador || "" },
      enlace: { name: row.Enlace || "" },
      distritoFederal: section ? String(section.IdDistritoFederal) : "",
      distritoLocal: section ? String(section.IdDistritoLocal) : "",
      municipio: section?.Municipio || "",
      seccion: String(row.IdSeccion || ""),
    },

    flow,

    qr: {
      qrValue: row.Llave || row.QR || buildQrValue(String(row.IdAgenda)),
      generatedAtISO: row.created_at,
    },

    evidences,
    attendanceAdults: [],
    attendanceMinors: [],

    metrics: {
      adultsCount: 0,
      minorsCount: 0,
      evidenceCount: evidences.length,
      lastUpdateISO: row.updated_at,
    },
  };

  meeting.metrics = computeMeetingMetrics(meeting);
  meeting.status = computeMeetingStatus(meeting.flow);

  return meeting;
}

/** 📋 Obtener todas las agendas */
export async function listMeetings(): Promise<Meeting[]> {
  const res = await http.get<GetAgendasResponse>("/getAgendas");
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];

  const meetings = await Promise.all(rows.map(mapAgendaRowToMeeting));
  meetings.forEach(upsertMeetingToMock);

  return meetings.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
}

/** 📅 Obtener agendas por fecha */
export async function listMeetingsByDate(dateISO: string): Promise<Meeting[]> {
  const res = await http.get<GetAgendasResponse>("/getAgendas", {
    params: { FechaAgenda: dateISO },
  });

  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  const meetings = await Promise.all(rows.map(mapAgendaRowToMeeting));
  meetings.forEach(upsertMeetingToMock);

  return meetings.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
}

/** 🔎 Obtener una agenda */
export async function getMeeting(meetingId: string): Promise<Meeting> {
  // ⚠️ Backend aún no pasó endpoint individual
  const all = await listMeetings();
  const found = all.find((m) => m.id === String(meetingId));

  if (!found) throw new Error("Reunión no encontrada ❌");
  return found;
}

/** ➕ Crear agenda real */
export async function createMeeting(core: MeetingCore): Promise<Meeting> {
  const payload = {
    // ✅ ESTO ERA LO QUE FALTABA
    IdReunion: meetingTypeToIdReunion(core.type),

    FechaAgenda: core.dateISO,
    Sede: core.sede,
    Organizador: core.organizer.name,
    Enlace: core.enlace.name,
    IdSeccion: Number(core.seccion),
    Direccion: core.address,
    Latitud: Number(core.location.lat),
    Longitud: Number(core.location.lng),
  };

  const res = await http.post<StoreAgendaResponse>("/storeagenda", payload);
  const row = res.data?.data;

  const mapped = await mapAgendaRowToMeeting({
    IdAgenda: row.IdAgenda,
    IdReunion: row.IdReunion,
    FechaAgenda: row.FechaAgenda,
    Sede: row.Sede,
    Organizador: row.Organizador,
    Enlace: row.Enlace,
    IdSeccion: row.IdSeccion,
    Direccion: row.Direccion,
    Latitud: row.Latitud,
    Longitud: row.Longitud,
    Fase: row.Fase,
    Youtube1: null,
    Facebook1: null,
    Whatsapp1: null,
    YoutubeValor1: null,
    FacebookValor1: null,
    WhatsappValor1: null,
    FotoGrupal: null,
    Youtube2: null,
    Facebook2: null,
    Whatsapp2: null,
    YoutubeValor2: null,
    FacebookValor2: null,
    WhatsappValor2: null,
    QR: null,
    Llave: row.LLave,
    Estado: row.Estado,
    IdUser: row.IdUser,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  upsertMeetingToMock(mapped);
  return mapped;
}

/* =========================================================
 * 🧪 MOCK TEMPORAL PARA FASES 2..6
 * ========================================================= */

export async function setPhaseStatus(
  meetingId: string,
  phase: MeetingPhase,
  status: PhaseStatus
): Promise<Meeting> {
  return mockSetPhaseStatus(meetingId, phase, status);
}

export async function addAdultAttendance(
  meetingId: string,
  payload: Omit<AttendanceAdult, "id" | "meetingId" | "createdAtISO">
): Promise<Meeting> {
  return mockAddAdultAttendance(meetingId, payload);
}

export async function addMinorAttendance(
  meetingId: string,
  payload: Omit<AttendanceMinor, "id" | "meetingId" | "createdAtISO">
): Promise<Meeting> {
  return mockAddMinorAttendance(meetingId, payload);
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  return mockDeleteMeeting(meetingId);
}
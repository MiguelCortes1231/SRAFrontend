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

// 🧪 mocks temporales
import {
  mockAddAdultAttendance,
  mockAddMinorAttendance,
  mockDeleteMeeting,
  mockSetPhaseStatus,
} from "../mocks/meetings.mock";
import { loadDB, saveDB } from "../mocks/db";

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

type GetAgendaResponse = {
  success: boolean;
  data: AgendaApiRow;
};

/** 🔢 Front -> Backend */
function meetingTypeToIdReunion(type: MeetingType): number {
  return type === "ASAMBLEA" ? 1 : 2;
}

/** 🔁 Backend -> Front */
function idReunionToMeetingType(idReunion: number): MeetingType {
  return Number(idReunion) === 1 ? "ASAMBLEA" : "EVENTO";
}

/** 🧭 Backend fase -> flow */
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

function upsertMeetingToMock(meeting: Meeting) {
  const db = loadDB();
  const idx = db.meetings.findIndex((m) => m.id === meeting.id);

  if (idx >= 0) db.meetings[idx] = meeting;
  else db.meetings.push(meeting);

  saveDB(db);
}

async function mapAgendaRowToMeeting(row: AgendaApiRow): Promise<Meeting> {
  const section = await findSectionById(row.IdSeccion);
  const flow = phaseNumberToFlow(Number(row.Fase || 1));

  const evidences: Meeting["evidences"] = [
    row.Youtube1
      ? {
          id: `yt1-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "INICIAL_DIGITAL",
          platform: "YT",
          imagePath: row.Youtube1,
          imageUrl: "",
          value: row.YoutubeValor1,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Facebook1
      ? {
          id: `fb1-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "INICIAL_DIGITAL",
          platform: "FB",
          imagePath: row.Facebook1,
          imageUrl: "",
          value: row.FacebookValor1,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Whatsapp1
      ? {
          id: `wa1-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "INICIAL_DIGITAL",
          platform: "WA",
          imagePath: row.Whatsapp1,
          imageUrl: "",
          value: row.WhatsappValor1,
          createdAtISO: row.updated_at,
        }
      : null,
    row.FotoGrupal
      ? {
          id: `foto-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FOTO_GRUPAL",
          platform: "FISICA",
          imagePath: row.FotoGrupal,
          imageUrl: "",
          createdAtISO: row.updated_at,
        }
      : null,
    row.Youtube2
      ? {
          id: `yt2-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FINAL_DIGITAL",
          platform: "YT",
          imagePath: row.Youtube2,
          imageUrl: "",
          value: row.YoutubeValor2,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Facebook2
      ? {
          id: `fb2-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FINAL_DIGITAL",
          platform: "FB",
          imagePath: row.Facebook2,
          imageUrl: "",
          value: row.FacebookValor2,
          createdAtISO: row.updated_at,
        }
      : null,
    row.Whatsapp2
      ? {
          id: `wa2-${row.IdAgenda}`,
          meetingId: String(row.IdAgenda),
          type: "FINAL_DIGITAL",
          platform: "WA",
          imagePath: row.Whatsapp2,
          imageUrl: "",
          value: row.WhatsappValor2,
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

export async function listMeetings(): Promise<Meeting[]> {
  const res = await http.get<GetAgendasResponse>("/getAgendas");
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];

  const meetings = await Promise.all(rows.map(mapAgendaRowToMeeting));
  meetings.forEach(upsertMeetingToMock);

  return meetings.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
}

export async function listMeetingsByDate(dateISO: string): Promise<Meeting[]> {
  const res = await http.get<GetAgendasResponse>("/getAgendas", {
    params: { FechaAgenda: dateISO },
  });

  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  const meetings = await Promise.all(rows.map(mapAgendaRowToMeeting));
  meetings.forEach(upsertMeetingToMock);

  return meetings.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
}

/** ✅ Ahora sí real por IdAgenda */
export async function getMeeting(meetingId: string): Promise<Meeting> {
  const res = await http.get<GetAgendaResponse>(`/getAgenda/${meetingId}`);
  const row = res.data?.data;

  if (!row) throw new Error("Reunión no encontrada ❌");

  const meeting = await mapAgendaRowToMeeting(row);
  upsertMeetingToMock(meeting);

  return meeting;
}

export async function createMeeting(core: MeetingCore): Promise<Meeting> {
  const payload = {
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
 * 🧪 MOCK TEMPORAL OTRAS FASES
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
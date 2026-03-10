// src/services/meetings.service.ts
/**
 * 🌐 Meetings Service
 * ---------------------------------------------------
 * Servicio para reuniones/agendas
 *
 * ✅ Incluye:
 * - listado
 * - detalle
 * - create
 * - update
 * - cancel
 * - mapper con raw original
 */

import { http } from "./http";
import { findSectionById } from "./catalogs.service";

import type {
  Meeting,
  MeetingEvidence,
  MeetingRawAgenda,
  MeetingStatus,
  MeetingType,
} from "../models/meeting";

type ApiListResponse = {
  success: boolean;
  data: MeetingRawAgenda[];
};

type ApiSingleResponse = {
  success: boolean;
  data: MeetingRawAgenda;
};

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function mapMeetingType(idReunion?: number | null): MeetingType {
  return Number(idReunion) === 2 ? "EVENTO" : "ASAMBLEA";
}

function mapAgendaStatus(idEstado?: number | null): MeetingStatus {
  switch (Number(idEstado)) {
    case 3:
      return "COMPLETADA";
    case 4:
      return "OBSERVADA";
    case 1:
      return "BORRADOR";
    case 2:
    default:
      return "EN_PROCESO";
  }
}

function buildEvidenceList(raw: MeetingRawAgenda): MeetingEvidence[] {
  const list: MeetingEvidence[] = [];

  if (hasValue(raw.Facebook1)) {
    list.push({
      id: `fb-1-${raw.IdAgenda}`,
      type: "INICIAL_DIGITAL",
      platform: "FB",
      imagePath: raw.Facebook1 ?? null,
      value: raw.FacebookValor1 ?? null,
    });
  }

  if (hasValue(raw.Youtube1)) {
    list.push({
      id: `yt-1-${raw.IdAgenda}`,
      type: "INICIAL_DIGITAL",
      platform: "YT",
      imagePath: raw.Youtube1 ?? null,
      value: raw.YoutubeValor1 ?? null,
    });
  }

  if (hasValue(raw.Whatsapp1)) {
    list.push({
      id: `wa-1-${raw.IdAgenda}`,
      type: "INICIAL_DIGITAL",
      platform: "WA",
      imagePath: raw.Whatsapp1 ?? null,
      value: raw.WhatsappValor1 ?? null,
    });
  }

  if (hasValue(raw.FotoGrupal)) {
    list.push({
      id: `group-${raw.IdAgenda}`,
      type: "FOTO_GRUPAL",
      platform: "FISICA",
      imagePath: raw.FotoGrupal ?? null,
      value: null,
    });
  }

  if (hasValue(raw.Facebook2)) {
    list.push({
      id: `fb-2-${raw.IdAgenda}`,
      type: "FINAL_DIGITAL",
      platform: "FB",
      imagePath: raw.Facebook2 ?? null,
      value: raw.FacebookValor2 ?? null,
    });
  }

  if (hasValue(raw.Youtube2)) {
    list.push({
      id: `yt-2-${raw.IdAgenda}`,
      type: "FINAL_DIGITAL",
      platform: "YT",
      imagePath: raw.Youtube2 ?? null,
      value: raw.YoutubeValor2 ?? null,
    });
  }

  if (hasValue(raw.Whatsapp2)) {
    list.push({
      id: `wa-2-${raw.IdAgenda}`,
      type: "FINAL_DIGITAL",
      platform: "WA",
      imagePath: raw.Whatsapp2 ?? null,
      value: raw.WhatsappValor2 ?? null,
    });
  }

  return list;
}

async function mapAgendaToMeeting(raw: MeetingRawAgenda): Promise<Meeting> {
  const sectionInfo = await findSectionById(raw.IdSeccion);

  const municipio = sectionInfo?.Municipio ?? "SIN MUNICIPIO";
  const distritoLocal = sectionInfo?.IdDistritoLocal ?? "-";
  const distritoFederal = sectionInfo?.IdDistritoFederal ?? "-";

  const evidences = buildEvidenceList(raw);

  return {
    id: String(raw.IdAgenda),
    currentPhase: Number(raw.Fase || 1),
    status: mapAgendaStatus(raw.IdEstado),

    core: {
      type: mapMeetingType(raw.IdReunion),
      dateISO: String(raw.FechaAgenda || "").slice(0, 10),
      sede: raw.Sede || "",
      organizer: {
        name: raw.Organizador || "",
      },
      enlace: {
        name: raw.Enlace || "",
      },
      municipio,
      seccion: raw.IdSeccion ?? "",
      distritoLocal,
      distritoFederal,
      address: raw.Direccion || "",
      location: {
        lat: Number(raw.Latitud ?? 0),
        lng: Number(raw.Longitud ?? 0),
      },
    },

    metrics: {
      adultsCount: 0,
      minorsCount: 0,
      evidenceCount: evidences.length,
    },

    qr: {
      qrValue: raw.Llave || "",
    },

    evidences,

    createdAtISO: raw.created_at || undefined,
    updatedAtISO: raw.updated_at || undefined,

    // 🔥 guardamos el raw completo
    raw,
  };
}

/** 📋 Listar reuniones */
export async function listMeetings(): Promise<Meeting[]> {
  const res = await http.get<ApiListResponse>("/getAgendas");
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];

  return Promise.all(rows.map(mapAgendaToMeeting));
}

/** 📅 Listar reuniones por fecha */
export async function listMeetingsByDate(dateISO: string): Promise<Meeting[]> {
  const res = await http.get<ApiListResponse>("/getAgendas", {
    params: {
      FechaAgenda: dateISO,
    },
  });

  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  return Promise.all(rows.map(mapAgendaToMeeting));
}

/** 🔎 Obtener detalle de agenda */
export async function getMeeting(idAgenda: string | number): Promise<Meeting> {
  const res = await http.get<ApiSingleResponse>(`/getAgenda/${idAgenda}`);
  const raw = res.data?.data;

  if (!raw) {
    throw new Error("No se encontró la agenda solicitada");
  }

  return mapAgendaToMeeting(raw);
}

/** ➕ Crear agenda */
export async function createMeeting(payload: Record<string, any>) {
  const res = await http.post("/storeagenda", payload);
  return res.data;
}

/** ✏️ Actualizar agenda */
export async function updateMeeting(idAgenda: string | number, payload: Record<string, any>) {
  const res = await http.put(`/updateAgenda/${idAgenda}`, payload);
  return res.data;
}

/** 🚫 Cancelar agenda */
export async function cancelMeeting(idAgenda: string | number) {
  const res = await http.post(`/cancelarAgenda/${idAgenda}`);
  return res.data;
}
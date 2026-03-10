// src/models/meeting.ts
/**
 * 🧱 Meeting Model
 * ---------------------------------------------------
 * Modelo interno del frontend para reuniones/agendas.
 *
 * ✅ Incluye:
 * - datos procesados para UI
 * - métricas
 * - flujo
 * - raw original del backend
 */

export type MeetingStatus =
  | "BORRADOR"
  | "EN_PROCESO"
  | "COMPLETADA"
  | "OBSERVADA";

export type MeetingType = "ASAMBLEA" | "EVENTO";

export type MeetingEvidenceType =
  | "INICIAL_DIGITAL"
  | "FINAL_DIGITAL"
  | "FOTO_GRUPAL";

export type MeetingEvidencePlatform = "FB" | "YT" | "WA" | "FISICA";

export type MeetingFlowItem = {
  phase: number;
  label: string;
  statusLabel: string;
  statusColor?: string;
  completed: boolean;
};

export type MeetingEvidence = {
  id: string;
  type: MeetingEvidenceType;
  platform: MeetingEvidencePlatform;
  imagePath?: string | null;
  value?: number | null;
};

export type MeetingRawAgenda = {
  IdAgenda: number;
  IdReunion: number;
  FechaAgenda: string;
  Sede: string;
  Organizador: string;
  Enlace: string;
  IdSeccion: number;
  Direccion: string;
  Latitud: number | null;
  Longitud: number | null;
  Fase: number | null;

  Youtube1?: string | null;
  Facebook1?: string | null;
  Whatsapp1?: string | null;
  YoutubeValor1?: number | null;
  FacebookValor1?: number | null;
  WhatsappValor1?: number | null;

  FotoGrupal?: string | null;

  Youtube2?: string | null;
  Facebook2?: string | null;
  Whatsapp2?: string | null;
  YoutubeValor2?: number | null;
  FacebookValor2?: number | null;
  WhatsappValor2?: number | null;

  QR?: string | null;
  Llave?: string | null;

  IdEstado?: number | null;
  IdUser?: number | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type Meeting = {
  id: string;
  currentPhase: number;
  status: MeetingStatus;

  core: {
    type: MeetingType;
    dateISO: string;
    sede: string;
    organizer: {
      name: string;
    };
    enlace: {
      name: string;
    };
    municipio: string;
    seccion: number | string;
    distritoLocal: number | string;
    distritoFederal: number | string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
  };

  metrics: {
    adultsCount: number;
    minorsCount: number;
    evidenceCount: number;
  };

  qr: {
    qrValue: string;
  };

  evidences: MeetingEvidence[];

  flow?: MeetingFlowItem[];

  createdAtISO?: string;
  updatedAtISO?: string;

  // 🔥 respuesta original del backend
  raw: MeetingRawAgenda;
};
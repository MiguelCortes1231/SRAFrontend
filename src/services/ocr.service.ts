// src/services/ocr.service.ts
/**
 * 🧠 OCR Service
 * -----------------------------------------
 * Flujo:
 * 1) POST /ocr con imagen
 * 2) POST /separar-nombre con respuesta OCR
 *
 * ✅ Si separar-nombre falla:
 * - NO tronamos
 * - regresamos datos parciales
 * - intentamos separar nombre manualmente
 *
 * 🎯 Objetivo:
 * - rellenar lo más posible siempre
 * - nunca dejar al usuario “atorado”
 */

import axios from "axios";
import { ddmmyyyyToIso } from "../utils/validators";

const OCR_BASE_URL = import.meta.env.VITE_OCR_BASE_URL || "https://brmstudio.com.mx/ocr";

export type OcrRawResponse = {
  anio_registro?: string;
  calle?: string;
  clave_elector?: string;
  codigo_postal?: string;
  colonia?: string;
  curp?: string;
  es_ine?: boolean;
  estado?: string;
  fecha_nacimiento?: string;
  nombre?: string;
  numero?: string;
  pais?: string;
  seccion?: string;
  sexo?: "H" | "M";
  tipo_credencial?: string;
  vigencia?: string;
};

export type OcrSplitResponse = OcrRawResponse & {
  apellido_materno?: string;
  apellido_paterno?: string;
  nombres?: string;
};

export type OcrMappedPerson = {
  ClaveElector: string;
  CURP: string;
  PrimerApellido: string;
  SegundoApellido: string;
  Nombre: string;
  IdSeccion: number | "";
  Sexo: "H" | "M";
  FechaNacimiento: string;
  Domicilio: string;
  Colonia: string;
  CodigoPostal: string;
  Telefono: string;
};

export type OcrScanResult = {
  mapped: OcrMappedPerson;
  raw: OcrRawResponse;
  splitUsed: boolean;
  warningMessage: string | null;
};

function buildAddress(raw: OcrRawResponse) {
  return [raw.calle, raw.numero].filter(Boolean).join(" ").trim();
}

/**
 * 🧩 Heurística simple para separar nombre completo
 * Caso típico OCR:
 * "CASTILLO OLIVERA RICARDO ORLANDO"
 * -> paterno CASTILLO
 * -> materno OLIVERA
 * -> nombres RICARDO ORLANDO
 *
 * Si solo hay 1 palabra -> nombres
 * Si hay 2 -> paterno + nombres
 * Si hay 3+ -> paterno + materno + resto nombres
 */
function splitFullNameHeuristic(fullName: string) {
  const clean = String(fullName || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!clean) {
    return {
      apellido_paterno: "",
      apellido_materno: "",
      nombres: "",
    };
  }

  const parts = clean.split(" ");

  if (parts.length === 1) {
    return {
      apellido_paterno: "",
      apellido_materno: "",
      nombres: parts[0],
    };
  }

  if (parts.length === 2) {
    return {
      apellido_paterno: parts[0],
      apellido_materno: "",
      nombres: parts[1],
    };
  }

  return {
    apellido_paterno: parts[0] || "",
    apellido_materno: parts[1] || "",
    nombres: parts.slice(2).join(" "),
  };
}

function mapToPerson(data: Partial<OcrSplitResponse>): OcrMappedPerson {
  return {
    ClaveElector: data.clave_elector || "",
    CURP: data.curp || "",
    PrimerApellido: data.apellido_paterno || "",
    SegundoApellido: data.apellido_materno || "",
    Nombre: data.nombres || data.nombre || "",
    IdSeccion: data.seccion ? Number(data.seccion) : "",
    Sexo: data.sexo || "H",
    FechaNacimiento: data.fecha_nacimiento ? ddmmyyyyToIso(data.fecha_nacimiento) : "",
    Domicilio: buildAddress(data),
    Colonia: data.colonia || "",
    CodigoPostal: data.codigo_postal || "",
    Telefono: "",
  };
}

/** 📸 OCR + separar nombre con fallback robusto */
export async function scanIneAndSplit(file: File): Promise<OcrScanResult> {
  const fd = new FormData();
  fd.append("imagen", file);

  // 1) OCR base
  const ocrRes = await axios.post<OcrRawResponse>(`${OCR_BASE_URL}/ocr`, fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      accept: "application/json",
    },
    timeout: 60000,
  });

  const raw = ocrRes.data || {};

  // 2) Intentamos separar nombre
  try {
    const splitRes = await axios.post<OcrSplitResponse>(
      `${OCR_BASE_URL}/separar-nombre`,
      raw,
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 60000,
      }
    );

    const splitData = splitRes.data || {};
    const mapped = mapToPerson(splitData);

    return {
      mapped,
      raw,
      splitUsed: true,
      warningMessage:
        "⚠️ Verifica todos los datos del OCR antes de guardar. El reconocimiento puede tener errores.",
    };
  } catch {
    // ✅ Fallback si separar-nombre falla
    const manualSplit = splitFullNameHeuristic(raw.nombre || "");

    const fallbackData: OcrSplitResponse = {
      ...raw,
      apellido_paterno: manualSplit.apellido_paterno,
      apellido_materno: manualSplit.apellido_materno,
      nombres: manualSplit.nombres,
    };

    const mapped = mapToPerson(fallbackData);

    return {
      mapped,
      raw,
      splitUsed: false,
      warningMessage:
        "⚠️ El OCR solo pudo rellenar parcialmente algunos campos. Verifica y corrige manualmente antes de guardar.",
    };
  }
}
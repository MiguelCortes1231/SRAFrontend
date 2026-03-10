// src/models/attendance.ts
/**
 * 🧾 Modelos de asistencia (FASE 3)
 * -----------------------------------------
 * Soporta:
 * - menores de 17 años 👦
 * - ciudadanos / ciudadanas 👨‍🦱👩‍🦱
 * - OCR INE
 * - edición / eliminación
 */

export type AttendancePersonType = "MENOR_17" | "CIUDADANO";
export type AttendanceCaptureMode = "MANUAL" | "OCR";

export type AttendancePersonPayload = {
  ClaveElector: string;
  CURP: string;
  PrimerApellido: string;
  SegundoApellido: string;
  Nombre: string;
  IdSeccion: number;
  Sexo: "H" | "M";
  FechaNacimiento: string; // YYYY-MM-DD
  Domicilio: string;
  Colonia: string;
  CodigoPostal: string;
  Telefono: string;
};

export type AttendancePersonRow = {
  IdListado: number;
  IdAgenda: number;
  ClaveElector: string;
  CURP: string;
  PrimerApellido: string;
  SegundoApellido: string;
  Nombre: string;
  IdSeccion: number;
  Sexo: "H" | "M";
  FechaNacimiento: string;
  Domicilio: string;
  Colonia: string;
  CodigoPostal: string | number;
  Telefono: string;
  EsMenor: number; // 0 o 1
  Llave: string;
};
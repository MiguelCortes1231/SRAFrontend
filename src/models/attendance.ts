// src/models/attendance.ts
/**
 * 🧑‍🤝‍🧑 Modelos: Asistencias
 * -----------------------------------------
 * Fase 3:
 * - Adultos (form/herramienta)
 * - Menores (>=17) con validación CURP + edad
 */

export type AttendanceAdult = {
  id: string;
  meetingId: string;

  // 👤 En adultos suele ser mínimo (puede crecer)
  fullName: string;
  phone?: string;

  createdAtISO: string;
};

export type AttendanceMinor = {
  id: string;
  meetingId: string;

  // ✅ Campos requeridos por tu especificación
  curp: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  domicilio: string;
  telefono: string;
  edad: number;

  createdAtISO: string;
};

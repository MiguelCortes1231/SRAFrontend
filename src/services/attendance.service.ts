// src/services/attendance.service.ts
/**
 * 🔁 Attendance Service (FASE 3 REAL)
 * -----------------------------------------
 * - alta persona
 * - listar personas
 * - editar persona
 * - eliminar persona
 */

import { http } from "./http";
import type { AttendancePersonPayload, AttendancePersonRow } from "../models/attendance";

type SaveAttendanceResponse = {
  success: boolean;
  message: string;
  total_insertados: number;
};

type ListAttendanceResponse = {
  success: boolean;
  total: number;
  data: AttendancePersonRow[];
};

type EditAttendanceResponse = {
  success: boolean;
  message: string;
  data: AttendancePersonRow;
};

type DeleteAttendanceResponse = {
  success: boolean;
  message: string;
};

/** ➕ Alta 1 persona */
export async function createAttendancePerson(
  agendaId: string | number,
  person: AttendancePersonPayload
): Promise<SaveAttendanceResponse> {
  const res = await http.post<SaveAttendanceResponse>(`/fase3/${agendaId}`, {
    personas: [person],
  });

  return res.data;
}

/** 📋 Listado actual */
export async function listAttendancePersons(
  agendaId: string | number
): Promise<AttendancePersonRow[]> {
  const res = await http.get<ListAttendanceResponse>(`/getListado/${agendaId}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
}

/** ✏️ Editar */
export async function updateAttendancePerson(
  idListado: string | number,
  person: AttendancePersonPayload
): Promise<EditAttendanceResponse> {
  const res = await http.put<EditAttendanceResponse>(`/editPersona/${idListado}`, person);
  return res.data;
}

/** 🗑️ Eliminar */
export async function deleteAttendancePerson(idListado: string | number): Promise<DeleteAttendanceResponse> {
  const res = await http.delete<DeleteAttendanceResponse>(`/deletePersona/${idListado}`);
  return res.data;
}
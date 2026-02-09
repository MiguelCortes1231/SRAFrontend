// src/components/forms/AdultsAttendanceForm.tsx
/**
 * 👨‍👩‍👧‍👦 AdultsAttendanceForm (Fase 3 - Mayores)
 * -----------------------------------------
 * - Form simple para agregar asistencias adultas
 * - Para MVP basta nombre + teléfono opcional ✅
 */

import React, { useState } from "react";
import { Box, Button, Card, CardContent, Divider, Stack, TextField, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";

import type { Meeting } from "../../models/meeting";
import { addAdultAttendance } from "../../services/meetings.service";

type Props = {
  meeting: Meeting;
  onUpdated: (meeting: Meeting) => void;
};

export default function AdultsAttendanceForm({ meeting, onUpdated }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const canAdd = fullName.trim().length >= 3 && !loading;

  const handleAdd = async () => {
    if (!canAdd) return;
    try {
      setLoading(true);

      const updated = await addAdultAttendance(meeting.id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      onUpdated(updated);
      setFullName("");
      setPhone("");
    } catch (err: any) {
      alert(err?.message || "No se pudo registrar asistencia ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Asistencias · Mayores de edad 👨‍👩‍👧‍👦
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Registra asistentes mayores. (MVP: nombre + teléfono opcional)
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
            <TextField
              label="Nombre completo"
              placeholder="Ej: Juan Pérez López"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
              label="Teléfono (opcional)"
              placeholder="10 dígitos"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!canAdd}
              sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
            >
              {loading ? "Agregando... ⏳" : "Agregar ✅"}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Total adultos registrados: <strong>{meeting.attendanceAdults.length}</strong>
          </Typography>

          {/* 📋 Lista simple */}
          {meeting.attendanceAdults.length > 0 ? (
            <Box sx={{ mt: 1 }}>
              {meeting.attendanceAdults.slice(0, 8).map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)",
                    mb: 0.8,
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>{a.fullName}</Typography>
                  {a.phone ? (
                    <Typography variant="caption" color="text.secondary">
                      📞 {a.phone}
                    </Typography>
                  ) : null}
                </Box>
              ))}
              {meeting.attendanceAdults.length > 8 ? (
                <Typography variant="caption" color="text.secondary">
                  Mostrando 8 de {meeting.attendanceAdults.length}…
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

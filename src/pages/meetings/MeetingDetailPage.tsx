// src/pages/meetings/MeetingDetailPage.tsx
/**
 * 🧠 MeetingDetailPage
 * -----------------------------------------
 * Pantalla central del flujo:
 * - Muestra resumen de la reunión
 * - Stepper de fases 🧭
 * - Secciones: F2, F3, F4, F5, F6
 *
 * Nota: Fase 1 ya se hizo en Create, aquí mostramos el resumen.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import PageHeader from "../../components/ui/PageHeader";
import MeetingStepper from "../../components/meetings/MeetingStepper";
import EvidenceUploadCard from "../../components/evidence/EvidenceUploadCard";
import PhotoGroupCapture from "../../components/evidence/PhotoGroupCapture";
import EvidenceComparePanel from "../../components/evidence/EvidenceComparePanel";

import type { Meeting } from "../../models/meeting";
import { getMeeting, setPhaseStatus } from "../../services/meetings.service";
import { formatDateShort } from "../../utils/format";
import AttendancePhaseSection from "../../components/attendance/AttendancePhaseSection";

export default function MeetingDetailPage() {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    if (!meetingId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo cargar la reunión ❌");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const actions = (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate("/meetings")}
      sx={{ borderRadius: 2 }}
    >
      Volver a reuniones
    </Button>
  );

  const summary = useMemo(() => {
    if (!meeting) return null;
    return (
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {meeting.core.type} · {meeting.core.sede}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 {formatDateShort(meeting.core.dateISO)} · 📍 {meeting.core.municipio} · Sección{" "}
                  <strong>{meeting.core.seccion}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  👤 Organizador: <strong>{meeting.core.organizer.name}</strong> · Enlace:{" "}
                  <strong>{meeting.core.enlace.name}</strong>
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: "rgba(108,56,65,0.06)",
                  border: "1px solid rgba(108,56,65,0.15)",
                  minWidth: 260,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <QrCode2Icon color="primary" />
                  <Typography sx={{ fontWeight: 900 }}>QR (valor)</Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: "block",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {meeting.qr.qrValue}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1 }} />
            <MeetingStepper flow={meeting.flow} />
          </Stack>
        </CardContent>
      </Card>
    );
  }, [meeting]);

  const markPhaseCompleted = async (phase: any) => {
    if (!meeting) return;
    try {
      const updated = await setPhaseStatus(meeting.id, phase, "COMPLETADA");
      setMeeting(updated);
    } catch (err: any) {
      alert(err?.message || "No se pudo actualizar fase ❌");
    }
  };

  if (loading) return <Typography color="text.secondary">Cargando... ⏳</Typography>;

  if (errorMsg) {
    return (
      <Box>
        <PageHeader title="Detalle de reunión" subtitle="Flujo por fases (1..6) 🧭" actions={actions} />
        <Alert severity="error">{errorMsg}</Alert>
      </Box>
    );
  }

  if (!meeting) return null;

  return (
    <Box>
      <PageHeader
        title="Detalle de reunión"
        subtitle="Gestiona evidencias, asistencias, foto grupal y comparación final 🧭"
        actions={actions}
      />

      {summary}

      <Stack spacing={2} sx={{ mt: 2 }}>
        {/* 📸 Fase 2 */}
        <EvidenceUploadCard
          meeting={meeting}
          type="INICIAL_DIGITAL"
          title="Fase 2 · Evidencia Inicial Digital"
          description="Sube 1 captura de YouTube + 1 captura de Facebook (estado inicial)."
          onUpdated={(m) => setMeeting(m)}
        />

        {/* 👥 Fase 3 */}
        <AttendancePhaseSection agendaId={meeting.id} />

        {/* 📸 Fase 4 */}
        <PhotoGroupCapture meeting={meeting} onUpdated={(m) => setMeeting(m)} />

        {/* 📸 Fase 5 */}
        <EvidenceUploadCard
          meeting={meeting}
          type="FINAL_DIGITAL"
          title="Fase 5 · Evidencia Final Digital"
          description="Sube 1 captura de YouTube + 1 captura de Facebook (estado final)."
          onUpdated={(m) => setMeeting(m)}
        />

        {/* 🧪 Fase 6 */}
        <EvidenceComparePanel meeting={meeting} />

        {/* ✅ Botón opcional para “cerrar” fase 6 cuando API exista */}
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 900 }}>Cierre / Auditoría ✅</Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando exista API, aquí se podrá “cerrar” la reunión y generar métricas finales.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => markPhaseCompleted(6)}
                sx={{ borderRadius: 2 }}
              >
                Marcar Fase 6 como completada ✅
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

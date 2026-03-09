// src/pages/meetings/MeetingDetailPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import PageHeader from "../../components/ui/PageHeader";
import MeetingStepper from "../../components/meetings/MeetingStepper";
import EvidenceUploadCard from "../../components/evidence/EvidenceUploadCard";
import AdultsAttendanceForm from "../../components/forms/AdultsAttendanceForm";
import MinorsAttendanceForm from "../../components/forms/MinorsAttendanceForm";
import PhotoGroupCapture from "../../components/evidence/PhotoGroupCapture";
import EvidenceComparePanel from "../../components/evidence/EvidenceComparePanel";

import type { Meeting } from "../../models/meeting";
import { getMeeting, setPhaseStatus } from "../../services/meetings.service";
import { formatDateShort } from "../../utils/format";

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
    void load();
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
                  📅 {formatDateShort(meeting.core.dateISO)} · 📍 {meeting.core.municipio} ·
                  Sección <strong>{meeting.core.seccion}</strong>
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
                  <Typography sx={{ fontWeight: 900 }}>LLave / QR</Typography>
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

  const markPhaseCompleted = async (phase: 1 | 2 | 3 | 4 | 5 | 6) => {
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
        {/* 📸 Fase 2 real */}
        <EvidenceUploadCard
          meeting={meeting}
          title="Fase 2 · Evidencia Inicial Digital"
          description="Sube o reemplaza Facebook, YouTube y WhatsApp con sus valores actuales."
          onUpdated={(m) => setMeeting(m)}
        />

        {/* 👥 Fase 3 (todavía mock hasta tener APIs) */}
        <AdultsAttendanceForm meeting={meeting} onUpdated={(m) => setMeeting(m)} />
        <MinorsAttendanceForm meeting={meeting} onUpdated={(m) => setMeeting(m)} />

        {/* 📸 Fase 4 */}
        <PhotoGroupCapture meeting={meeting} onUpdated={(m) => setMeeting(m)} />

        {/* 📸 Fase 5 */}
        <Typography variant="body2" color="text.secondary">
          Fase 5 se conectará con API real cuando backend libere su endpoint 🔌
        </Typography>

        {/* 🧪 Fase 6 */}
        <EvidenceComparePanel meeting={meeting} />

        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 900 }}>Cierre / Auditoría ✅</Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando exista API para cierre formal, aquí se cerrará la reunión.
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
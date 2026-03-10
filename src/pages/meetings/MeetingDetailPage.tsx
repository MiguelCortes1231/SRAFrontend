// src/pages/meetings/MeetingDetailPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import MeetingStepper from "../../components/meetings/MeetingStepper";
import EvidenceUploadCard from "../../components/evidence/EvidenceUploadCard";
import AttendancePhaseSection from "../../components/attendance/AttendancePhaseSection";
import PhotoGroupCapture from "../../components/evidence/PhotoGroupCapture";
import EvidenceComparePanel from "../../components/evidence/EvidenceComparePanel";

import type { Meeting } from "../../models/meeting";
import { getMeeting } from "../../services/meetings.service";
import { finalizePhase6 } from "../../services/evidence.service";
import { formatDateShort } from "../../utils/format";

export default function MeetingDetailPage() {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [confirmFinalOpen, setConfirmFinalOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

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
  }, [meetingId]);

  const isCompleted = meeting?.status === "COMPLETADA";
  const isCancelled = meeting?.status === "OBSERVADA";
  const disableFinalize = isCompleted || isCancelled;

  const actions = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/meetings")}
        sx={{ borderRadius: 2 }}
      >
        Volver a reuniones
      </Button>

      {(isCompleted || isCancelled) && meeting ? (
        <Button
          variant="contained"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/meetings/${meeting.id}/preview`)}
          sx={{ borderRadius: 2 }}
        >
          Previsualizar 👁️
        </Button>
      ) : null}
    </Stack>
  );

  const summary = useMemo(() => {
    if (!meeting) return null;

    return (
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
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

            {isCompleted ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Esta agenda ya está completada ✅
              </Alert>
            ) : null}

            {isCancelled ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                Esta agenda fue cancelada 🚫
              </Alert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }, [meeting, isCompleted, isCancelled]);

  const handleFinalizePhase6 = async () => {
    if (!meeting) return;

    try {
      setFinalizing(true);

      const updated = await finalizePhase6(meeting.id);
      setMeeting(updated);
      setConfirmFinalOpen(false);

      toast.success("✅ Agenda finalizada correctamente");
    } catch (err: any) {
      toast.error(err?.message || "❌ No se pudo finalizar la agenda");
    } finally {
      setFinalizing(false);
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
        <EvidenceUploadCard
          meeting={meeting}
          phase={2}
          title="Fase 2 · Evidencia Inicial Digital"
          description="Sube o reemplaza Facebook, YouTube y WhatsApp con sus valores actuales."
          onUpdated={(m) => setMeeting(m)}
        />

        <AttendancePhaseSection agendaId={meeting.id} />

        <PhotoGroupCapture meeting={meeting} onUpdated={(m) => setMeeting(m)} />

        <EvidenceUploadCard
          meeting={meeting}
          phase={5}
          title="Fase 5 · Evidencia Final Digital"
          description="Sube o reemplaza Facebook, YouTube y WhatsApp finales con sus valores actuales."
          onUpdated={(m) => setMeeting(m)}
        />

        <EvidenceComparePanel meeting={meeting} />

        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 900 }}>Cierre / Auditoría ✅</Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando estés seguro de la comparación y evidencias, puedes finalizar la agenda.
            </Typography>

            {isCompleted ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Esta agenda ya se encuentra completada ✅
              </Alert>
            ) : null}

            {isCancelled ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                Esta agenda fue cancelada y ya no puede finalizarse 🚫
              </Alert>
            ) : null}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 2 }}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                onClick={() => setConfirmFinalOpen(true)}
                disabled={disableFinalize}
                sx={{ borderRadius: 2 }}
              >
                {isCompleted
                  ? "Agenda ya completada ✅"
                  : isCancelled
                  ? "Agenda cancelada 🚫"
                  : "Marcar Fase 6 como completada ✅"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <ConfirmDialog
        open={confirmFinalOpen}
        title="Finalizar agenda"
        description="¿Deseas marcar la Fase 6 como completada y finalizar esta agenda? ✅"
        confirmText={finalizing ? "Finalizando... ⏳" : "Sí, finalizar ✅"}
        cancelText="Cancelar"
        onConfirm={handleFinalizePhase6}
        onClose={() => (finalizing ? null : setConfirmFinalOpen(false))}
      />
    </Box>
  );
}
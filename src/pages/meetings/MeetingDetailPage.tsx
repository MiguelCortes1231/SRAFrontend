// src/pages/meetings/MeetingDetailPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
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

function PhasePanel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Fade in={active} timeout={260} unmountOnExit>
      <Box
        sx={{
          mt: 2,
          borderRadius: 4,
        }}
      >
        {children}
      </Box>
    </Fade>
  );
}

export default function MeetingDetailPage() {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [confirmFinalOpen, setConfirmFinalOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [activePhase, setActivePhase] = useState(1);

  const previewButtonRef = useRef<HTMLButtonElement | null>(null);

  async function load() {
    if (!meetingId) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const data = await getMeeting(meetingId);
      setMeeting(data);
      setActivePhase(Math.max(1, Math.min(6, data.currentPhase || 1)));
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

  // 🔒 Solo lectura tanto para completadas como canceladas
  const isReadOnly = Boolean(isCompleted || isCancelled);

  const disableFinalize = isCompleted || isCancelled;

  const flow = useMemo(() => {
    if (!meeting) return [];

    const hasValue = (value: unknown) =>
      value !== null && value !== undefined && String(value).trim() !== "";

    const hasNumber = (value: unknown) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "" &&
      !Number.isNaN(Number(value));

    const phase1Complete = true;

    const phase2Complete =
      hasValue(meeting.raw?.Facebook1) &&
      hasValue(meeting.raw?.Youtube1) &&
      hasValue(meeting.raw?.Whatsapp1) &&
      hasNumber(meeting.raw?.FacebookValor1) &&
      hasNumber(meeting.raw?.YoutubeValor1) &&
      hasNumber(meeting.raw?.WhatsappValor1);

    const phase3Complete =
      (meeting.metrics?.adultsCount ?? 0) + (meeting.metrics?.minorsCount ?? 0) > 0;

    const phase4Complete = hasValue(meeting.raw?.FotoGrupal);

    const phase5Complete =
      hasValue(meeting.raw?.Facebook2) &&
      hasValue(meeting.raw?.Youtube2) &&
      hasValue(meeting.raw?.Whatsapp2) &&
      hasNumber(meeting.raw?.FacebookValor2) &&
      hasNumber(meeting.raw?.YoutubeValor2) &&
      hasNumber(meeting.raw?.WhatsappValor2);

    const phase6Complete = meeting.status === "COMPLETADA";

    return [
      {
        phase: 1,
        label: "Fase 1 · Alta 🧾",
        statusLabel: phase1Complete ? "Completa ✅" : "Pendiente",
        statusColor: "success",
        completed: phase1Complete,
      },
      {
        phase: 2,
        label: "Fase 2 · Inicial 📸",
        statusLabel: phase2Complete ? "Completa ✅" : "Pendiente",
        statusColor: phase2Complete ? "success" : "warning",
        completed: phase2Complete,
      },
      {
        phase: 3,
        label: "Fase 3 · Asistencias 👥",
        statusLabel: phase3Complete ? "Completa ✅" : "Pendiente",
        statusColor: phase3Complete ? "success" : "warning",
        completed: phase3Complete,
      },
      {
        phase: 4,
        label: "Fase 4 · Foto grupal 📷",
        statusLabel: phase4Complete ? "Completa ✅" : "Pendiente",
        statusColor: phase4Complete ? "success" : "warning",
        completed: phase4Complete,
      },
      {
        phase: 5,
        label: "Fase 5 · Final 📸",
        statusLabel: phase5Complete ? "Completa ✅" : "Pendiente",
        statusColor: phase5Complete ? "success" : "warning",
        completed: phase5Complete,
      },
      {
        phase: 6,
        label: "Fase 6 · Comparación ✅",
        statusLabel: phase6Complete ? "Completa ✅" : "Pendiente",
        statusColor: phase6Complete ? "success" : "warning",
        completed: phase6Complete,
      },
    ];
  }, [meeting]);

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
          ref={previewButtonRef}
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
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    wordBreak: "break-word",
                  }}
                >
                  {meeting.core.type} · {meeting.core.sede}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, wordBreak: "break-word" }}
                >
                  📅 {formatDateShort(meeting.core.dateISO)} · 📍 {meeting.core.municipio} ·
                  Sección <strong>{meeting.core.seccion}</strong>
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "break-word" }}
                >
                  👤 Organizador: <strong>{meeting.core.organizer.name}</strong> · Enlace:{" "}
                  <strong>{meeting.core.enlace.name}</strong>
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "rgba(108,56,65,0.06)",
                  border: "1px solid rgba(108,56,65,0.15)",
                  width: { xs: "100%", lg: 320 },
                  minWidth: 0,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <QrCode2Icon color="primary" />
                  <Typography sx={{ fontWeight: 900 }}>Llave / QR</Typography>
                </Stack>

                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.8,
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

            <MeetingStepper
              flow={flow}
              activePhase={activePhase}
              onPhaseClick={(phase) => setActivePhase(phase)}
            />

            {isCompleted ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Esta agenda ya está completada ✅. El contenido se muestra en modo solo lectura.
              </Alert>
            ) : null}

            {isCancelled ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                Esta agenda fue cancelada 🚫. El contenido se muestra en modo solo lectura.
              </Alert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }, [meeting, isCompleted, isCancelled, activePhase, flow]);

  const handleFinalizePhase6 = async () => {
    if (!meeting) return;

    try {
      setFinalizing(true);

      const updated = await finalizePhase6(meeting.id);
      setMeeting(updated);
      setConfirmFinalOpen(false);

      toast.success("✅ Agenda finalizada correctamente");

      window.setTimeout(() => {
        previewButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 250);
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
        <PageHeader
          title="Detalle de reunión"
          subtitle="Flujo por fases (1..6) 🧭"
          actions={actions}
        />
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

      <Box sx={{ mt: 2 }}>
        <PhasePanel active={activePhase === 1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Fase 1 · Alta de reunión 🧾
              </Typography>

              <Stack spacing={0.9}>
                <Typography><strong>Tipo:</strong> {meeting.core.type}</Typography>
                <Typography><strong>Fecha:</strong> {formatDateShort(meeting.core.dateISO)}</Typography>
                <Typography><strong>Sede:</strong> {meeting.core.sede}</Typography>
                <Typography><strong>Organizador:</strong> {meeting.core.organizer.name}</Typography>
                <Typography><strong>Enlace:</strong> {meeting.core.enlace.name}</Typography>
                <Typography><strong>Municipio:</strong> {meeting.core.municipio}</Typography>
                <Typography><strong>Sección:</strong> {meeting.core.seccion}</Typography>
                <Typography><strong>Distrito Local:</strong> {meeting.core.distritoLocal}</Typography>
                <Typography><strong>Distrito Federal:</strong> {meeting.core.distritoFederal}</Typography>
                <Typography><strong>Dirección:</strong> {meeting.core.address}</Typography>
                <Typography>
                  <strong>Coordenadas:</strong> {meeting.core.location.lat}, {meeting.core.location.lng}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </PhasePanel>

        <PhasePanel active={activePhase === 2}>
          <EvidenceUploadCard
            meeting={meeting}
            phase={2}
            title="Fase 2 · Evidencia Inicial Digital"
            description="Sube o reemplaza Facebook, YouTube y WhatsApp con sus valores actuales."
            onUpdated={(m) => setMeeting(m)}
            readOnly={isReadOnly}
          />
        </PhasePanel>

        <PhasePanel active={activePhase === 3}>
          <AttendancePhaseSection
            agendaId={meeting.id}
            readOnly={isReadOnly}
          />
        </PhasePanel>

        <PhasePanel active={activePhase === 4}>
          <PhotoGroupCapture
            meeting={meeting}
            onUpdated={(m) => setMeeting(m)}
            readOnly={isReadOnly}
          />
        </PhasePanel>

        <PhasePanel active={activePhase === 5}>
          <EvidenceUploadCard
            meeting={meeting}
            phase={5}
            title="Fase 5 · Evidencia Final Digital"
            description="Sube o reemplaza Facebook, YouTube y WhatsApp finales con sus valores actuales."
            onUpdated={(m) => setMeeting(m)}
            readOnly={isReadOnly}
          />
        </PhasePanel>

        <PhasePanel active={activePhase === 6}>
          <Stack spacing={2}>
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
        </PhasePanel>
      </Box>

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
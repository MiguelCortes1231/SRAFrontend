// src/pages/meetings/MeetingPreviewPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import GroupsIcon from "@mui/icons-material/Groups";
import PlaceIcon from "@mui/icons-material/Place";

import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

import PageHeader from "../../components/ui/PageHeader";
import ProtectedImage from "../../components/evidence/ProtectedImage";
import ReadOnlyMeetingMap from "../../components/maps/ReadOnlyMeetingMap";

import type { Meeting } from "../../models/meeting";
import type { AttendancePersonRow } from "../../models/attendance";
import { getMeeting } from "../../services/meetings.service";
import { listAttendancePersons } from "../../services/attendance.service";
import { formatDateShort } from "../../utils/format";

function PhaseBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}

function EvidenceCard({
  title,
  filePath,
  value,
}: {
  title: string;
  filePath?: string | null;
  value?: number | null;
}) {
  return (
    <Box
      sx={{
        p: 1.2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
        height: "100%",
      }}
    >
      <Typography sx={{ fontWeight: 900, mb: 1 }}>{title}</Typography>
      <ProtectedImage filePath={filePath} alt={title} height={220} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        {value !== undefined && value !== null
          ? `Valor registrado: ${value}`
          : "Aún no hay valor registrado"}
      </Typography>
    </Box>
  );
}

export default function MeetingPreviewPage() {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [attendance, setAttendance] = useState<AttendancePersonRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const reportRef = useRef<HTMLDivElement | null>(null);

  const isCompleted = meeting?.status === "COMPLETADA";
  const isCancelled = meeting?.status === "OBSERVADA";

  const load = async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const [meetingResp, attendanceResp] = await Promise.all([
        getMeeting(meetingId),
        listAttendancePersons(meetingId),
      ]);

      setMeeting(meetingResp);
      setAttendance(attendanceResp);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo cargar la previsualización ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [meetingId]);

  const ev = useMemo(() => {
    if (!meeting) return null;

    const find = (
      type: "INICIAL_DIGITAL" | "FINAL_DIGITAL" | "FOTO_GRUPAL",
      platform?: "FB" | "YT" | "WA" | "FISICA"
    ) => meeting.evidences.find((e) => e.type === type && (!platform || e.platform === platform));

    return {
      initialFB: find("INICIAL_DIGITAL", "FB"),
      initialYT: find("INICIAL_DIGITAL", "YT"),
      initialWA: find("INICIAL_DIGITAL", "WA"),
      finalFB: find("FINAL_DIGITAL", "FB"),
      finalYT: find("FINAL_DIGITAL", "YT"),
      finalWA: find("FINAL_DIGITAL", "WA"),
      group: find("FOTO_GRUPAL", "FISICA"),
    };
  }, [meeting]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !meeting) return;

    try {
      setGeneratingPdf(true);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        ignoreElements: (element) =>
          element.hasAttribute?.("data-pdf-exclude"),
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`reporte-agenda-${meeting.id}.pdf`);
      toast.success("✅ PDF generado correctamente");
    } catch (err: any) {
      toast.error(err?.message || "❌ No se pudo generar el PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

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

      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleDownloadPdf}
        disabled={generatingPdf || loading || !meeting}
        sx={{ borderRadius: 2 }}
        data-pdf-exclude
      >
        {generatingPdf ? "Generando PDF... ⏳" : "Descargar reporte PDF 📄"}
      </Button>
    </Stack>
  );

  if (loading) {
    return <Typography color="text.secondary">Cargando previsualización... ⏳</Typography>;
  }

  if (errorMsg || !meeting || !ev) {
    return (
      <Box>
        <PageHeader
          title="Previsualización de agenda"
          subtitle="Vista ejecutiva y descargable 🧾"
          actions={actions}
        />
        <Alert severity="error">{errorMsg || "No se pudo cargar la agenda"}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Previsualización de agenda"
        subtitle="Vista ejecutiva ordenada por fases, lista para descarga PDF ✨"
        actions={actions}
      />

      <div ref={reportRef}>
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <VisibilityIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {meeting.core.type} · {meeting.core.sede}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Agenda #${meeting.id}`} />
                  <Chip label={`Fecha: ${formatDateShort(meeting.core.dateISO)}`} />
                  <Chip label={`Municipio: ${meeting.core.municipio}`} />
                  <Chip label={`Sección: ${meeting.core.seccion}`} />
                  {isCompleted ? <Chip color="success" label="Completada ✅" /> : null}
                  {isCancelled ? <Chip color="error" label="Cancelada 🚫" /> : null}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  👤 Organizador: <strong>{meeting.core.organizer.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🔗 Enlace: <strong>{meeting.core.enlace.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🏛️ Distrito Local: <strong>{meeting.core.distritoLocal}</strong> · Distrito Federal:{" "}
                  <strong>{meeting.core.distritoFederal}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 Dirección: <strong>{meeting.core.address}</strong>
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: { xs: "100%", md: 230 },
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(108,56,65,0.06)",
                  border: "1px solid rgba(108,56,65,0.15)",
                  textAlign: "center",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <QrCode2Icon color="primary" />
                  <Typography sx={{ fontWeight: 900 }}>QR / Llave</Typography>
                </Stack>

                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <QRCodeCanvas value={meeting.qr.qrValue} size={130} includeMargin />
                </Box>

                <Typography
                  variant="caption"
                  sx={{ display: "block", wordBreak: "break-all", fontFamily: "monospace" }}
                >
                  {meeting.qr.qrValue}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Fase 1 */}
        <PhaseBlock
          title="Fase 1 · Alta de reunión 🧾"
          subtitle="Datos principales, ubicación y coordenadas."
        >
          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <Stack spacing={1}>
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
            </Grid>

            <Grid item xs={12} lg={5}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaceIcon color="primary" />
                  <Typography sx={{ fontWeight: 900 }}>Mapa de ubicación</Typography>
                </Stack>
                <ReadOnlyMeetingMap
                  lat={meeting.core.location.lat}
                  lng={meeting.core.location.lng}
                  address={meeting.core.address}
                  height={320}
                />
              </Stack>
            </Grid>
          </Grid>
        </PhaseBlock>

        {/* Fase 2 */}
        <PhaseBlock
          title="Fase 2 · Evidencia Inicial Digital 📸"
          subtitle="Estado inicial de redes sociales."
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <EvidenceCard title="Facebook inicial 📘" filePath={ev.initialFB?.imagePath} value={ev.initialFB?.value} />
            </Grid>
            <Grid item xs={12} md={4}>
              <EvidenceCard title="YouTube inicial ▶️" filePath={ev.initialYT?.imagePath} value={ev.initialYT?.value} />
            </Grid>
            <Grid item xs={12} md={4}>
              <EvidenceCard title="WhatsApp inicial 💬" filePath={ev.initialWA?.imagePath} value={ev.initialWA?.value} />
            </Grid>
          </Grid>
        </PhaseBlock>

        {/* Fase 3 */}
        <PhaseBlock
          title="Fase 3 · Lista de asistencia 👥"
          subtitle="Personas registradas para la agenda."
        >
          {attendance.length === 0 ? (
            <Alert severity="info">Aún no hay personas registradas en esta agenda 🫙</Alert>
          ) : (
            <Stack spacing={1.2}>
              {attendance.map((person) => (
                <Card key={person.IdListado} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <GroupsIcon color="primary" fontSize="small" />
                          <Typography sx={{ fontWeight: 900 }}>
                            {person.Nombre} {person.PrimerApellido} {person.SegundoApellido}
                          </Typography>
                          <Chip
                            size="small"
                            label={Number(person.EsMenor) === 1 ? "17 años 👦" : "Ciudadano 👤"}
                            color={Number(person.EsMenor) === 1 ? "warning" : "primary"}
                            variant="outlined"
                          />
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          CURP: <strong>{person.CURP}</strong>
                        </Typography>

                        {person.ClaveElector ? (
                          <Typography variant="body2" color="text.secondary">
                            Clave de Elector: <strong>{person.ClaveElector}</strong>
                          </Typography>
                        ) : null}

                        <Typography variant="body2" color="text.secondary">
                          Sección: <strong>{person.IdSeccion}</strong> · Sexo: <strong>{person.Sexo}</strong> ·
                          Fecha Nacimiento: <strong>{person.FechaNacimiento}</strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {person.Domicilio}, {person.Colonia}, CP {person.CodigoPostal}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Teléfono: <strong>{person.Telefono}</strong>
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </PhaseBlock>

        {/* Fase 4 */}
        <PhaseBlock
          title="Fase 4 · Fotografía Grupal 📷"
          subtitle="Evidencia fotográfica del evento."
        >
          <EvidenceCard title="Foto grupal 📸" filePath={ev.group?.imagePath} />
        </PhaseBlock>

        {/* Fase 5 */}
        <PhaseBlock
          title="Fase 5 · Evidencia Final Digital 📸"
          subtitle="Estado final de redes sociales."
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <EvidenceCard title="Facebook final 📘" filePath={ev.finalFB?.imagePath} value={ev.finalFB?.value} />
            </Grid>
            <Grid item xs={12} md={4}>
              <EvidenceCard title="YouTube final ▶️" filePath={ev.finalYT?.imagePath} value={ev.finalYT?.value} />
            </Grid>
            <Grid item xs={12} md={4}>
              <EvidenceCard title="WhatsApp final 💬" filePath={ev.finalWA?.imagePath} value={ev.finalWA?.value} />
            </Grid>
          </Grid>
        </PhaseBlock>

        {/* Fase 6 */}
        <PhaseBlock
          title="Fase 6 · Comparación y cierre ✅"
          subtitle="Comparativa visual de evidencias y estado final de la agenda."
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 1.2, borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)" }}>
                <Typography sx={{ fontWeight: 900, mb: 1 }}>Resumen del cierre</Typography>
                <Typography><strong>Estatus:</strong> {isCompleted ? "Completada ✅" : isCancelled ? "Cancelada 🚫" : "En proceso 🧭"}</Typography>
                <Typography><strong>Llave / QR:</strong> {meeting.qr.qrValue}</Typography>
                <Typography><strong>Evidencias totales:</strong> {meeting.metrics.evidenceCount}</Typography>
                <Typography><strong>Última actualización:</strong> {meeting.updatedAtISO}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 1.2, borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)" }}>
                <Typography sx={{ fontWeight: 900, mb: 1 }}>Conteo de asistentes</Typography>
                <Typography><strong>Total registrados:</strong> {attendance.length}</Typography>
                <Typography>
                  <strong>Ciudadanos:</strong> {attendance.filter((x) => Number(x.EsMenor) === 0).length}
                </Typography>
                <Typography>
                  <strong>17 años:</strong> {attendance.filter((x) => Number(x.EsMenor) === 1).length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </PhaseBlock>
      </div>
    </Box>
  );
}
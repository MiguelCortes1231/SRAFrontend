// src/pages/meetings/MeetingCreatePage.tsx
/**
 * ➕ MeetingCreatePage
 * -----------------------------------------
 * - Renderiza MeetingForm (Fase 1)
 * - Al guardar: crea reunión en mocks ✅
 * - Muestra QR generado 🔳
 * - Botones: ir a detalle / volver a lista
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import PageHeader from "../../components/ui/PageHeader";
import MeetingForm from "../../components/forms/MeetingForm";

import type { Meeting, MeetingCore } from "../../models/meeting";
import { createMeeting } from "../../services/meetings.service";
import { QRCodeCanvas } from "qrcode.react";

export default function MeetingCreatePage() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Meeting | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (core: MeetingCore) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const meeting = await createMeeting(core);
      setCreated(meeting);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo guardar la reunión ❌");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <Box>
      <PageHeader
        title="Alta de reunión"
        subtitle="Fase 1 · Captura datos principales y genera el QR único 🔳"
        actions={actions}
      />

      {errorMsg ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      ) : null}

      {!created ? (
        <Card>
          <CardContent>
            <MeetingForm submitting={submitting} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="success">
                ¡Reunión creada correctamente! ✅ Se generó un QR único.
              </Alert>

              <Divider />

              {/* 🔳 QR */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "rgba(108,56,65,0.04)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <QRCodeCanvas value={created.qr.qrValue} size={190} includeMargin />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <QrCode2Icon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      QR generado 🔳
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Este QR identifica la reunión para auditoría y trazabilidad.
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: "block",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: "rgba(0,0,0,0.04)",
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    {created.qr.qrValue}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* 🎛️ Acciones */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/meetings")}
                  sx={{ borderRadius: 2 }}
                >
                  Ir a lista
                </Button>

                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/meetings/${created.id}`)}
                  sx={{ borderRadius: 2 }}
                >
                  Ir al detalle (Fases 2..6) 🧭
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

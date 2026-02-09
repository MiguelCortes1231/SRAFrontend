// src/pages/scan/ScanCredencialPage.tsx
/**
 * 🪪 ScanCredencialPage (Placeholder futuro)
 * -----------------------------------------
 * ✅ Objetivo:
 * - Pantalla de escaneo de INE/IFE (mocks por ahora)
 * - Subir frente / reverso 📸
 * - Previsualizar imágenes 👀
 * - Botón procesar (mock) ✨
 * - Mostrar resultado en tarjeta + JSON debug 🧪
 *
 * 🔁 Preparado para API:
 * - Luego conectas al endpoint real sin tocar la UI
 */

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BadgeIcon from "@mui/icons-material/Badge";

import PageHeader from "../../components/ui/PageHeader";
import type { IneScanResponse } from "../../services/ine.service";
import { scanIne } from "../../services/ine.service";
import IneResultCard from "../../components/ine/IneResultCard";

/** 🔁 Convierte archivo a Base64 para guardar en mock o enviar al API */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ScanCredencialPage() {
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IneScanResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canProcess = Boolean(front || back) && !loading;

  const handlePick = async (file: File, side: "front" | "back") => {
    const b64 = await toBase64(file);
    if (side === "front") setFront(b64);
    else setBack(b64);
  };

  const handleReset = () => {
    setFront(null);
    setBack(null);
    setResult(null);
    setErrorMsg(null);
  };

  const handleProcess = async () => {
    if (!canProcess) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setResult(null);

      // 🧪 Hoy: mock | 🌐 Mañana: API real (scanIne ya lo abstrae)
      const res = await scanIne({
        frontImageBase64: front || undefined,
        backImageBase64: back || undefined,
      });

      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al procesar credencial ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Escaneo de credencial (INE/IFE)"
        subtitle="Módulo futuro: hoy mock 🧪 · mañana API real 🌐"
        actions={null}
      />

      {errorMsg ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        {/* 📸 Panel de carga */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BadgeIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Captura / carga de imágenes 📸
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Puedes subir solo el frente o también el reverso. En móvil, puede abrir cámara.
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* Frente */}
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Frente 🪪</Typography>

                  {front ? (
                    <Box className="evidence-preview" sx={{ mt: 1 }}>
                      <img src={front} alt="Frente credencial" />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Sin imagen 🫙
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadFileIcon />}
                      sx={{ borderRadius: 2 }}
                      disabled={loading}
                    >
                      Subir frente
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePick(f, "front");
                        }}
                      />
                    </Button>

                    {front ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        sx={{ borderRadius: 2 }}
                        disabled={loading}
                        onClick={() => setFront(null)}
                      >
                        Quitar
                      </Button>
                    ) : null}
                  </Stack>
                </Box>

                {/* Reverso */}
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 900 }}>Reverso 🪪</Typography>

                  {back ? (
                    <Box className="evidence-preview" sx={{ mt: 1 }}>
                      <img src={back} alt="Reverso credencial" />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Sin imagen 🫙
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadFileIcon />}
                      sx={{ borderRadius: 2 }}
                      disabled={loading}
                    >
                      Subir reverso
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePick(f, "back");
                        }}
                      />
                    </Button>

                    {back ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        sx={{ borderRadius: 2 }}
                        disabled={loading}
                        onClick={() => setBack(null)}
                      >
                        Quitar
                      </Button>
                    ) : null}
                  </Stack>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* 🎛️ Acciones */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<AutoFixHighIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={handleProcess}
                    disabled={!canProcess}
                  >
                    {loading ? "Procesando... ⏳" : "Procesar (mock) ✨"}
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  💡 Este módulo es placeholder. Cuando llegue el API real, solo cambiamos el service.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ Resultado */}
        <Grid item xs={12} lg={6}>
          {result ? (
            <IneResultCard result={result as IneScanResponse} />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Resultado 🧾
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Aquí aparecerá el JSON del OCR una vez proceses una imagen.
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" color="text.secondary">
                  🧪 En modo mock, al presionar “Procesar” se simula la respuesta del OCR.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

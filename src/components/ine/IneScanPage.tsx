// src/pages/ine/IneScanPage.tsx
/**
 * 🪪 IneScanPage (Placeholder futuro)
 * -----------------------------------------
 * - Subir frente y reverso
 * - Previsualización
 * - Botón "Procesar" (mock)
 * - Muestra resultado OCR
 */

import React, { useState } from "react";
import { Box, Button, Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PageHeader from "../../components/ui/PageHeader";
import IneResultCard from "../../components/ine/IneResultCard";
import { scanIne, type IneScanResponse } from "../../services/ine.service";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function IneScanPage() {
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IneScanResponse | null>(null);

  const canProcess = Boolean(front || back) && !loading;

  const handlePick = async (file: File, side: "front" | "back") => {
    const b64 = await toBase64(file);
    if (side === "front") setFront(b64);
    else setBack(b64);
  };

  const handleProcess = async () => {
    if (!canProcess) return;
    try {
      setLoading(true);
      setResult(null);

      const res = await scanIne({
        frontImageBase64: front || undefined,
        backImageBase64: back || undefined,
      });

      setResult(res);
    } catch (err: any) {
      alert(err?.message || "Error al procesar (mock) ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFront(null);
    setBack(null);
    setResult(null);
  };

  return (
    <Box>
      <PageHeader
        title="Escaneo INE/IFE (Placeholder)"
        subtitle="Módulo futuro: captura imágenes y procesa OCR (hoy mock, mañana API) 🧪➡️🌐"
      />

      <Grid container spacing={2}>
        {/* 📸 Inputs */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Captura de imágenes 📸
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Sube el frente y/o reverso de la credencial. En móvil puede abrir cámara.
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={2}>
                {/* Frente */}
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Frente 🪪</Typography>
                  {front ? (
                    <Box className="evidence-preview" sx={{ mt: 1 }}>
                      <img src={front} alt="Frente" />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Sin imagen 🫙
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
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
                        onClick={() => setFront(null)}
                      >
                        Quitar
                      </Button>
                    ) : null}
                  </Stack>
                </Box>

                {/* Reverso */}
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Reverso 🪪</Typography>
                  {back ? (
                    <Box className="evidence-preview" sx={{ mt: 1 }}>
                      <img src={back} alt="Reverso" />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Sin imagen 🫙
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
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
                        onClick={() => setBack(null)}
                      >
                        Quitar
                      </Button>
                    ) : null}
                  </Stack>
                </Box>

                <Divider />

                {/* Acciones */}
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
                  💡 Este módulo es un placeholder. Cuando llegue el API real, conectamos aquí sin tocar la UI.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ Resultado */}
        <Grid item xs={12} lg={6}>
          {result ? (
            <IneResultCard result={result} />
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

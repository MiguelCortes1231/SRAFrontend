// src/components/evidence/EvidenceComparePanel.tsx
/**
 * 🧪 EvidenceComparePanel (FASE 6)
 * -----------------------------------------
 * Compara:
 * - Inicial: FB / YT / WA
 * - Final:   FB / YT / WA
 * - Foto grupal
 *
 * Si no hay imagen:
 * - muestra placeholder amigable
 */

import React, { useMemo } from "react";
import { Box, Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import CompareIcon from "@mui/icons-material/Compare";

import type { Meeting } from "../../models/meeting";
import ProtectedImage from "./ProtectedImage";

type Props = {
  meeting: Meeting;
};

function findEvidence(meeting: Meeting, type: "INICIAL_DIGITAL" | "FINAL_DIGITAL", platform: "FB" | "YT" | "WA") {
  return meeting.evidences.find((e) => e.type === type && e.platform === platform);
}

export default function EvidenceComparePanel({ meeting }: Props) {
  const initialFB = useMemo(() => findEvidence(meeting, "INICIAL_DIGITAL", "FB"), [meeting]);
  const initialYT = useMemo(() => findEvidence(meeting, "INICIAL_DIGITAL", "YT"), [meeting]);
  const initialWA = useMemo(() => findEvidence(meeting, "INICIAL_DIGITAL", "WA"), [meeting]);

  const finalFB = useMemo(() => findEvidence(meeting, "FINAL_DIGITAL", "FB"), [meeting]);
  const finalYT = useMemo(() => findEvidence(meeting, "FINAL_DIGITAL", "YT"), [meeting]);
  const finalWA = useMemo(() => findEvidence(meeting, "FINAL_DIGITAL", "WA"), [meeting]);

  const groupPhoto = useMemo(
    () => meeting.evidences.find((e) => e.type === "FOTO_GRUPAL"),
    [meeting]
  );

  const ready = Boolean(
    initialFB || initialYT || initialWA || finalFB || finalYT || finalWA || groupPhoto
  );

  const renderCard = (
    label: string,
    filePath?: string | null,
    value?: number | null
  ) => (
    <Box
      sx={{
        p: 1,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
      }}
    >
      <Typography sx={{ fontWeight: 900, mb: 0.8 }}>{label}</Typography>

      <ProtectedImage filePath={filePath} alt={label} height={180} />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: "block" }}>
        {value !== undefined && value !== null
          ? `Valor capturado: ${value}`
          : "Aún no hay valor registrado"}
      </Typography>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CompareIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Fase 6 · Comparación 🧪
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Compara evidencias iniciales y finales, además de la fotografía grupal.
          </Typography>

          <Divider sx={{ my: 1 }} />

          {!ready ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.30)",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>Aún no hay suficientes evidencias ⚠️</Typography>
              <Typography variant="body2" color="text.secondary">
                Se mostrarán aquí conforme se vayan capturando.
              </Typography>
            </Box>
          ) : null}

          <Grid container spacing={2}>
            {/* Inicial */}
            <Grid item xs={12} lg={6}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Inicial 📸</Typography>
              <Stack spacing={1}>
                {renderCard("Facebook inicial 📘", initialFB?.imagePath, initialFB?.value)}
                {renderCard("YouTube inicial ▶️", initialYT?.imagePath, initialYT?.value)}
                {renderCard("WhatsApp inicial 💬", initialWA?.imagePath, initialWA?.value)}
              </Stack>
            </Grid>

            {/* Final */}
            <Grid item xs={12} lg={6}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Final 📸</Typography>
              <Stack spacing={1}>
                {renderCard("Facebook final 📘", finalFB?.imagePath, finalFB?.value)}
                {renderCard("YouTube final ▶️", finalYT?.imagePath, finalYT?.value)}
                {renderCard("WhatsApp final 💬", finalWA?.imagePath, finalWA?.value)}
              </Stack>
            </Grid>

            {/* Foto grupal */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Fotografía grupal 📸</Typography>

              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.08)",
                  bgcolor: "#fff",
                }}
              >
                <ProtectedImage
                  filePath={groupPhoto?.imagePath}
                  alt="Fotografía grupal"
                  height={280}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
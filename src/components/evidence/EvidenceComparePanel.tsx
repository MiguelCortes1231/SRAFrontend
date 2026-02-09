// src/components/evidence/EvidenceComparePanel.tsx
/**
 * 🧪 EvidenceComparePanel (Fase 6)
 * -----------------------------------------
 * - Comparación Inicial vs Final (YT/FB)
 * - Incluye Foto Grupal
 * - Se ve claro y “audit-friendly” ✅
 */

import React, { useMemo } from "react";
import { Box, Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import CompareIcon from "@mui/icons-material/Compare";

import type { Meeting } from "../../models/meeting";

type Props = {
  meeting: Meeting;
};

function getEvidence(meeting: Meeting, type: any, platform: any) {
  return meeting.evidences.find((e) => e.type === type && e.platform === platform);
}

export default function EvidenceComparePanel({ meeting }: Props) {
  const initialYT = useMemo(() => getEvidence(meeting, "INICIAL_DIGITAL", "YT"), [meeting]);
  const initialFB = useMemo(() => getEvidence(meeting, "INICIAL_DIGITAL", "FB"), [meeting]);
  const finalYT = useMemo(() => getEvidence(meeting, "FINAL_DIGITAL", "YT"), [meeting]);
  const finalFB = useMemo(() => getEvidence(meeting, "FINAL_DIGITAL", "FB"), [meeting]);
  const groupPhoto = useMemo(() => meeting.evidences.find((e) => e.type === "FOTO_GRUPAL"), [meeting]);

  const ready =
    Boolean(initialYT && initialFB && finalYT && finalFB && groupPhoto);

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
            Compara evidencia inicial vs final (YouTube/Facebook) y confirma foto grupal.
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
              <Typography sx={{ fontWeight: 900 }}>Aún no está listo ⚠️</Typography>
              <Typography variant="body2" color="text.secondary">
                Requisito: Inicial (YT+FB) + Final (YT+FB) + Foto grupal.
              </Typography>
            </Box>
          ) : null}

          {/* 🧾 Comparación Digital */}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Inicial 📸</Typography>

              <Typography variant="caption" color="text.secondary">YouTube</Typography>
              <Box className="evidence-preview" sx={{ mb: 1 }}>
                {initialYT ? <img src={initialYT.imageUrl} alt="Inicial YT" /> : <Box sx={{ p: 2 }}>Falta YT 🫙</Box>}
              </Box>

              <Typography variant="caption" color="text.secondary">Facebook</Typography>
              <Box className="evidence-preview">
                {initialFB ? <img src={initialFB.imageUrl} alt="Inicial FB" /> : <Box sx={{ p: 2 }}>Falta FB 🫙</Box>}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Final 📸</Typography>

              <Typography variant="caption" color="text.secondary">YouTube</Typography>
              <Box className="evidence-preview" sx={{ mb: 1 }}>
                {finalYT ? <img src={finalYT.imageUrl} alt="Final YT" /> : <Box sx={{ p: 2 }}>Falta YT 🫙</Box>}
              </Box>

              <Typography variant="caption" color="text.secondary">Facebook</Typography>
              <Box className="evidence-preview">
                {finalFB ? <img src={finalFB.imageUrl} alt="Final FB" /> : <Box sx={{ p: 2 }}>Falta FB 🫙</Box>}
              </Box>
            </Grid>
          </Grid>

          {/* 📷 Foto grupal */}
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Foto grupal 📷</Typography>
          <Box className="evidence-preview">
            {groupPhoto ? (
              <img src={groupPhoto.imageUrl} alt="Foto grupal" />
            ) : (
              <Box sx={{ p: 2 }}>Falta foto grupal 🫙</Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

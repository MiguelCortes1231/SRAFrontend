// src/components/evidence/EvidenceUploadCard.tsx
/**
 * 📤 EvidenceUploadCard
 * -----------------------------------------
 * Sirve para Fase 2 y Fase 5:
 * - Subir 1 screenshot YT + 1 screenshot FB
 * - Previsualización
 * - Guardar como evidencia en mock db 🧠
 */

import React, { useMemo, useRef, useState } from "react";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import type { EvidenceType } from "../../models/evidence";
import type { Meeting } from "../../models/meeting";
import { addEvidence, removeEvidence } from "../../services/evidence.service";

type Props = {
  meeting: Meeting;
  type: EvidenceType; // INICIAL_DIGITAL o FINAL_DIGITAL
  title: string;
  description: string;
  onUpdated: (meeting: Meeting) => void;
};

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EvidenceUploadCard({ meeting, type, title, description, onUpdated }: Props) {
  const ytRef = useRef<HTMLInputElement>(null);
  const fbRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const ytEvidence = useMemo(
    () => meeting.evidences.find((e) => e.type === type && e.platform === "YT"),
    [meeting.evidences, type]
  );
  const fbEvidence = useMemo(
    () => meeting.evidences.find((e) => e.type === type && e.platform === "FB"),
    [meeting.evidences, type]
  );

  const handlePick = (ref: React.RefObject<HTMLInputElement>) => ref.current?.click();

  const handleUpload = async (platform: "YT" | "FB", file: File) => {
    try {
      setLoading(true);
      const base64 = await toBase64(file);

      const updated = await addEvidence({
        meetingId: meeting.id,
        type,
        platform,
        imageUrl: base64,
      });

      onUpdated(updated);
    } catch (err: any) {
      alert(err?.message || "No se pudo guardar la evidencia ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (evidenceId: string) => {
    try {
      setLoading(true);
      const updated = await removeEvidence(meeting.id, evidenceId);
      onUpdated(updated);
    } catch (err: any) {
      alert(err?.message || "No se pudo eliminar la evidencia ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ImageIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {title}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {/* 🎬 YouTube */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 900 }}>YouTube (1 imagen) 🎬</Typography>
              {ytEvidence ? (
                <Box className="evidence-preview" sx={{ mt: 1 }}>
                  <img src={ytEvidence.imageUrl} alt="YT Evidence" />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Sin evidencia cargada 🫙
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <input
                  ref={ytRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload("YT", f);
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  disabled={loading}
                  onClick={() => handlePick(ytRef)}
                  sx={{ borderRadius: 2 }}
                >
                  {ytEvidence ? "Reemplazar" : "Subir"} 📤
                </Button>

                {ytEvidence ? (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={loading}
                    onClick={() => handleRemove(ytEvidence.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Quitar 🗑️
                  </Button>
                ) : null}
              </Stack>
            </Box>

            {/* 📘 Facebook */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 900 }}>Facebook (1 imagen) 📘</Typography>
              {fbEvidence ? (
                <Box className="evidence-preview" sx={{ mt: 1 }}>
                  <img src={fbEvidence.imageUrl} alt="FB Evidence" />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Sin evidencia cargada 🫙
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <input
                  ref={fbRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload("FB", f);
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  disabled={loading}
                  onClick={() => handlePick(fbRef)}
                  sx={{ borderRadius: 2 }}
                >
                  {fbEvidence ? "Reemplazar" : "Subir"} 📤
                </Button>

                {fbEvidence ? (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={loading}
                    onClick={() => handleRemove(fbEvidence.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Quitar 🗑️
                  </Button>
                ) : null}
              </Stack>
            </Box>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            ✅ Requisito: 1 captura YT + 1 captura FB
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

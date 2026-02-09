// src/components/evidence/PhotoGroupCapture.tsx
/**
 * 📸 PhotoGroupCapture (Fase 4)
 * -----------------------------------------
 * - Cargar foto grupal (imagen)
 * - Guardar como evidencia tipo FOTO_GRUPAL
 *
 * Nota:
 * - En móviles puede abrir cámara automáticamente 📱
 */

import React, { useMemo, useRef, useState } from "react";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import type { Meeting } from "../../models/meeting";
import { addEvidence, removeEvidence } from "../../services/evidence.service";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Props = {
  meeting: Meeting;
  onUpdated: (meeting: Meeting) => void;
};

export default function PhotoGroupCapture({ meeting, onUpdated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const existing = useMemo(
    () => meeting.evidences.find((e) => e.type === "FOTO_GRUPAL"),
    [meeting.evidences]
  );

  const handlePick = () => inputRef.current?.click();

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const base64 = await toBase64(file);
      const updated = await addEvidence({
        meetingId: meeting.id,
        type: "FOTO_GRUPAL",
        platform: "FISICA",
        imageUrl: base64,
      });
      onUpdated(updated);
    } catch (err: any) {
      alert(err?.message || "No se pudo guardar foto grupal ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!existing) return;
    try {
      setLoading(true);
      const updated = await removeEvidence(meeting.id, existing.id);
      onUpdated(updated);
    } catch (err: any) {
      alert(err?.message || "No se pudo eliminar foto ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CameraAltIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Fase 4 · Fotografía grupal 📸
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Captura o carga una foto grupal como evidencia final física.
          </Typography>

          <Divider sx={{ my: 1 }} />

          {existing ? (
            <Box className="evidence-preview">
              <img src={existing.imageUrl} alt="Foto grupal" />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sin foto cargada 🫙
            </Typography>
          )}

          <input
            ref={inputRef}
            hidden
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              startIcon={existing ? <UploadFileIcon /> : <CameraAltIcon />}
              disabled={loading}
              onClick={handlePick}
              sx={{ borderRadius: 2 }}
            >
              {existing ? "Reemplazar" : "Cargar"} 📤
            </Button>

            {existing ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                disabled={loading}
                onClick={handleRemove}
                sx={{ borderRadius: 2 }}
              >
                Quitar 🗑️
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

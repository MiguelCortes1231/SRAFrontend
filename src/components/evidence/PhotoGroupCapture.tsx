// src/components/evidence/PhotoGroupCapture.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Alert,
} from "@mui/material";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import GroupsIcon from "@mui/icons-material/Groups";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { toast } from "react-toastify";

import type { Meeting } from "../../models/meeting";
import ProtectedImage from "./ProtectedImage";
import { uploadPhase4 } from "../../services/evidence.service";

type Props = {
  meeting: Meeting;
  onUpdated: (meeting: Meeting) => void;
  readOnly?: boolean;
};

export default function PhotoGroupCapture({
  meeting,
  onUpdated,
  readOnly = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const existing = useMemo(
    () => meeting.evidences.find((e) => e.type === "FOTO_GRUPAL"),
    [meeting.evidences]
  );

  const handleSelectFile = (file: File | null) => {
    setPhotoFile(file);

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
      toast.info("📸 Foto grupal lista para guardarse");
    }
  };

  const handleSave = async () => {
    if (!photoFile) {
      toast.warning("⚠️ Selecciona una foto grupal antes de guardar");
      return;
    }

    try {
      setLoading(true);

      const updated = await uploadPhase4({
        agendaId: meeting.id,
        photoFile,
      });

      onUpdated(updated);

      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }

      setPhotoFile(null);
      setPhotoPreviewUrl(null);

      toast.success("✅ Fase 4 actualizada correctamente");
    } catch (err: any) {
      toast.error(err?.message || "❌ No se pudo guardar la foto grupal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Fase 4 · Fotografía grupal 📸
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Sube o reemplaza la fotografía grupal. La imagen se guarda en backend y se muestra protegida con JWT.
          </Typography>

          {readOnly ? (
            <Alert severity="info" icon={<VisibilityIcon />}>
              Esta fase se muestra en modo solo lectura porque la agenda está completada ✅
            </Alert>
          ) : null}

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Foto actual guardada
            </Typography>

            <ProtectedImage
              filePath={existing?.imagePath}
              alt="Foto grupal actual"
              height={320}
            />
          </Box>

          {!readOnly && photoPreviewUrl ? (
            <Box>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Nueva foto seleccionada (preview) 👀
              </Typography>

              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                  bgcolor: "#fff",
                }}
              >
                <img
                  src={photoPreviewUrl}
                  alt="Preview nueva foto grupal"
                  style={{
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                    display: "block",
                    background: "#fff",
                  }}
                />
              </Box>
            </Box>
          ) : null}

          {!readOnly ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="flex-end"
            >
              <Button
                component="label"
                variant="outlined"
                startIcon={existing?.imagePath ? <UploadFileIcon /> : <CameraAltIcon />}
                sx={{ borderRadius: 2 }}
              >
                {existing?.imagePath ? "Reemplazar foto" : "Subir foto"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    handleSelectFile(file);
                  }}
                />
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!photoFile || loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? "Guardando... ⏳" : "Guardar Fase 4 📤"}
              </Button>
            </Stack>
          ) : null}

          <Typography variant="caption" color="text.secondary">
            💡 Puedes reemplazar la fotografía grupal las veces que sea necesario.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
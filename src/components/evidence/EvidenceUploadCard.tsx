// src/components/evidence/EvidenceUploadCard.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { toast } from "react-toastify";

import type { Meeting } from "../../models/meeting";
import ProtectedImage from "./ProtectedImage";
import { uploadPhase2, uploadPhase5 } from "../../services/evidence.service";

type Props = {
  meeting: Meeting;
  phase: 2 | 5;
  title: string;
  description: string;
  onUpdated: (meeting: Meeting) => void;
  readOnly?: boolean;
};

export default function EvidenceUploadCard({
  meeting,
  phase,
  title,
  description,
  onUpdated,
  readOnly = false,
}: Props) {
  const [loading, setLoading] = useState(false);

  const evidenceType = phase === 2 ? "INICIAL_DIGITAL" : "FINAL_DIGITAL";

  const existingFacebook = useMemo(
    () =>
      meeting.evidences.find(
        (e) => e.type === evidenceType && e.platform === "FB"
      ),
    [meeting.evidences, evidenceType]
  );

  const existingYoutube = useMemo(
    () =>
      meeting.evidences.find(
        (e) => e.type === evidenceType && e.platform === "YT"
      ),
    [meeting.evidences, evidenceType]
  );

  const existingWhatsapp = useMemo(
    () =>
      meeting.evidences.find(
        (e) => e.type === evidenceType && e.platform === "WA"
      ),
    [meeting.evidences, evidenceType]
  );

  const [facebookFile, setFacebookFile] = useState<File | null>(null);
  const [youtubeFile, setYoutubeFile] = useState<File | null>(null);
  const [whatsappFile, setWhatsappFile] = useState<File | null>(null);

  const [facebookValue, setFacebookValue] = useState<number | "">(
    existingFacebook?.value ?? ""
  );
  const [youtubeValue, setYoutubeValue] = useState<number | "">(
    existingYoutube?.value ?? ""
  );
  const [whatsappValue, setWhatsappValue] = useState<number | "">(
    existingWhatsapp?.value ?? ""
  );

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        agendaId: meeting.id,
        facebookFile,
        youtubeFile,
        whatsappFile,
        facebookValue: facebookValue === "" ? null : Number(facebookValue),
        youtubeValue: youtubeValue === "" ? null : Number(youtubeValue),
        whatsappValue: whatsappValue === "" ? null : Number(whatsappValue),
      };

      const updated =
        phase === 2 ? await uploadPhase2(payload) : await uploadPhase5(payload);

      onUpdated(updated);

      setFacebookFile(null);
      setYoutubeFile(null);
      setWhatsappFile(null);

      toast.success(
        phase === 2
          ? "✅ Fase 2 guardada correctamente"
          : "✅ Fase 5 guardada correctamente"
      );
    } catch (err: any) {
      toast.error(
        err?.message ||
          (phase === 2
            ? "❌ No se pudo guardar Fase 2"
            : "❌ No se pudo guardar Fase 5")
      );
    } finally {
      setLoading(false);
    }
  };

  const socialCards = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon color="primary" />,
      existing: existingFacebook,
      file: facebookFile,
      setFile: setFacebookFile,
      value: facebookValue,
      setValue: setFacebookValue,
    },
    {
      key: "youtube",
      label: "YouTube",
      icon: <YouTubeIcon color="error" />,
      existing: existingYoutube,
      file: youtubeFile,
      setFile: setYoutubeFile,
      value: youtubeValue,
      setValue: setYoutubeValue,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon sx={{ color: "#16a34a" }} />,
      existing: existingWhatsapp,
      file: whatsappFile,
      setFile: setWhatsappFile,
      value: whatsappValue,
      setValue: setWhatsappValue,
    },
  ];

  return (
    <Card>
      <CardContent  sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
      }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>

          {readOnly ? (
            <Alert severity="info" icon={<VisibilityIcon />}>
              Esta fase se muestra en modo solo lectura porque la agenda está completada ✅
            </Alert>
          ) : null}

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={2}>
            {socialCards.map((item) => (
              <Grid item xs={12} md={4} key={item.key}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "#fff",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {item.icon}
                    <Typography sx={{ fontWeight: 900 }}>{item.label}</Typography>
                  </Stack>

                  <ProtectedImage
                    filePath={item.existing?.imagePath}
                    alt={`${item.label} evidencia fase ${phase}`}
                    height={220}
                  />

                  <Stack spacing={1.2} sx={{ mt: 1.2 }}>
                    {!readOnly ? (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        {item.existing?.imagePath ? "Reemplazar imagen" : "Subir imagen"}
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            item.setFile(file);
                            if (file) {
                              toast.info(`📤 Imagen lista para ${item.label}`);
                            }
                          }}
                        />
                      </Button>
                    ) : null}

                    {item.file ? (
                      <Typography variant="caption" color="text.secondary">
                        Archivo nuevo: <strong>{item.file.name}</strong>
                      </Typography>
                    ) : null}

                    <TextField
                      label={`Valor actual en ${item.label}`}
                      type="number"
                      value={item.value}
                      disabled={readOnly}
                      onChange={(e) =>
                        item.setValue(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Ej: 100"
                    />
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          {!readOnly ? (
            <>
              <Divider sx={{ my: 2 }} />

              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  onClick={handleSave}
                  sx={{ borderRadius: 2 }}
                >
                  {loading
                    ? `Guardando Fase ${phase}... ⏳`
                    : `Guardar Fase ${phase} 📤`}
                </Button>
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
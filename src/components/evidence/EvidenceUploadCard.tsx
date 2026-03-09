// src/components/evidence/EvidenceUploadCard.tsx
/**
 * 📤 EvidenceUploadCard
 * -----------------------------------------
 * ✅ Fase 2 real:
 * - Facebook1 + FacebookValor1
 * - Youtube1 + YoutubeValor1
 * - Whatsapp1 + WhatsappValor1
 *
 * 🔥 Puede reemplazar imágenes siempre
 * 🔔 Usa toasts
 */

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
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { toast } from "react-toastify";

import type { Meeting } from "../../models/meeting";
import ProtectedImage from "./ProtectedImage";
import { uploadPhase2 } from "../../services/evidence.service";

type Props = {
  meeting: Meeting;
  title: string;
  description: string;
  onUpdated: (meeting: Meeting) => void;
};

export default function EvidenceUploadCard({
  meeting,
  title,
  description,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  // 📸 Files nuevos (opcionales)
  const [facebookFile, setFacebookFile] = useState<File | null>(null);
  const [youtubeFile, setYoutubeFile] = useState<File | null>(null);
  const [whatsappFile, setWhatsappFile] = useState<File | null>(null);

  // 🔢 Valores
  const initialFacebook = useMemo(
    () =>
      meeting.evidences.find(
        (e) => e.type === "INICIAL_DIGITAL" && e.platform === "FB"
      ),
    [meeting.evidences]
  );

  const initialYoutube = useMemo(
    () =>
      meeting.evidences.find(
        (e) => e.type === "INICIAL_DIGITAL" && e.platform === "YT"
      ),
    [meeting.evidences]
  );

  const initialWhatsapp = useMemo(
    () =>
      meeting.evidences.find(
        (e) => e.type === "INICIAL_DIGITAL" && e.platform === "WA"
      ),
    [meeting.evidences]
  );

  const [facebookValue, setFacebookValue] = useState<number | "">(
    initialFacebook?.value ?? ""
  );
  const [youtubeValue, setYoutubeValue] = useState<number | "">(
    initialYoutube?.value ?? ""
  );
  const [whatsappValue, setWhatsappValue] = useState<number | "">(
    initialWhatsapp?.value ?? ""
  );

  const canSave = !loading;

  const handleSave = async () => {
    try {
      setLoading(true);

      const updated = await uploadPhase2({
        agendaId: meeting.id,
        facebookFile,
        youtubeFile,
        whatsappFile,
        facebookValue: facebookValue === "" ? null : Number(facebookValue),
        youtubeValue: youtubeValue === "" ? null : Number(youtubeValue),
        whatsappValue: whatsappValue === "" ? null : Number(whatsappValue),
      });

      onUpdated(updated);

      setFacebookFile(null);
      setYoutubeFile(null);
      setWhatsappFile(null);

      toast.success("✅ Fase 2 guardada correctamente");
    } catch (err: any) {
      toast.error(err?.message || "❌ No se pudo guardar Fase 2");
    } finally {
      setLoading(false);
    }
  };

  const socialCards = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon color="primary" />,
      existing: initialFacebook,
      file: facebookFile,
      setFile: setFacebookFile,
      value: facebookValue,
      setValue: setFacebookValue,
    },
    {
      key: "youtube",
      label: "YouTube",
      icon: <YouTubeIcon color="error" />,
      existing: initialYoutube,
      file: youtubeFile,
      setFile: setYoutubeFile,
      value: youtubeValue,
      setValue: setYoutubeValue,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon sx={{ color: "#16a34a" }} />,
      existing: initialWhatsapp,
      file: whatsappFile,
      setFile: setWhatsappFile,
      value: whatsappValue,
      setValue: setWhatsappValue,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>

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

                  {/* 🖼️ Imagen actual protegida */}
                  <ProtectedImage
                    filePath={item.existing?.imagePath}
                    alt={`${item.label} evidencia`}
                    height={220}
                  />

                  <Stack spacing={1.2} sx={{ mt: 1.2 }}>
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

                    {item.file ? (
                      <Typography variant="caption" color="text.secondary">
                        Archivo nuevo: <strong>{item.file.name}</strong>
                      </Typography>
                    ) : null}

                    <TextField
                      label={`Valor actual en ${item.label}`}
                      type="number"
                      value={item.value}
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

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!canSave}
              onClick={handleSave}
              sx={{ borderRadius: 2 }}
            >
              {loading ? "Guardando Fase 2... ⏳" : "Guardar Fase 2 📤"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
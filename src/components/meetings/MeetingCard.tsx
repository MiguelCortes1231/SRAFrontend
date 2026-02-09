// src/components/meetings/MeetingCard.tsx
/**
 * 🧾 MeetingCard
 * -----------------------------------------
 * Card elegante para mostrar una reunión:
 * - Tipo / Sede / Fecha
 * - Municipio / Sección
 * - Estado (Chip)
 * - Métricas (adultos/menores/evidencias)
 * - Acciones (ver / eliminar)
 */

import React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";

import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupsIcon from "@mui/icons-material/Groups";
import ImageIcon from "@mui/icons-material/Image";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import type { Meeting } from "../../models/meeting";
import { formatDateShort } from "../../utils/format";
import MeetingStatusChip from "./MeetingStatusChip";

type Props = {
  meeting: Meeting;
  onOpen: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function MeetingCard({ meeting, onOpen, onDelete }: Props) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        "&:hover": { boxShadow: "0 18px 55px rgba(0,0,0,0.10)" },
        transition: "box-shadow 150ms ease",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EventNoteIcon color="primary" />
              <Typography sx={{ fontWeight: 900 }}>
                {meeting.core.type} · {meeting.core.sede}
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              📅 {formatDateShort(meeting.core.dateISO)} · 📍 {meeting.core.municipio} · Sección{" "}
              <strong>{meeting.core.seccion}</strong>
            </Typography>
          </Box>

          <MeetingStatusChip status={meeting.status} />
        </Stack>

        <Divider sx={{ my: 1.4 }} />

        {/* 📊 Métricas */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="flex-start">
          <Tooltip title="Asistencias (adultos + menores)">
            <Stack direction="row" spacing={0.8} alignItems="center">
              <GroupsIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {meeting.metrics.adultsCount + meeting.metrics.minorsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                asistentes
              </Typography>
            </Stack>
          </Tooltip>

          <Tooltip title="Evidencias (YT/FB inicial/final + foto grupal)">
            <Stack direction="row" spacing={0.8} alignItems="center">
              <ImageIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {meeting.metrics.evidenceCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                evidencias
              </Typography>
            </Stack>
          </Tooltip>

          <Box sx={{ flex: 1 }} />
        </Stack>

        {/* 🎛️ Acciones */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 2 }}
          justifyContent="flex-end"
        >
          {onDelete ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onDelete(meeting.id)}
              sx={{ borderRadius: 2 }}
            >
              Eliminar
            </Button>
          ) : null}

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onOpen(meeting.id)}
            sx={{ borderRadius: 2 }}
          >
            Ver detalle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

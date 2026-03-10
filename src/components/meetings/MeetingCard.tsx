// src/components/meetings/MeetingCard.tsx
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
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import type { Meeting } from "../../models/meeting";
import { formatDateShort } from "../../utils/format";
import MeetingStatusChip from "./MeetingStatusChip";

type Props = {
  meeting: Meeting;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel?: (id: string) => void;
  onPreview?: (id: string) => void;
};

export default function MeetingCard({
  meeting,
  onOpen,
  onEdit,
  onCancel,
  onPreview,
}: Props) {
  const isCancelled = meeting.status === "OBSERVADA";
  const isCompleted = meeting.status === "COMPLETADA";
  const canPreview = isCancelled || isCompleted;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        "&:hover": { boxShadow: "0 18px 55px rgba(0,0,0,0.10)" },
        transition: "box-shadow 150ms ease",
        height: "100%",
      }}
    >
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems="flex-start">
          <Tooltip title="Asistencias">
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

          <Tooltip title="Evidencias">
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

        <Box sx={{ flex: 1 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 2 }}
          justifyContent="flex-end"
        >
          {/* 🚫 Cancelada: solo preview */}
          {isCancelled ? (
            <>
              {canPreview && onPreview ? (
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onPreview(meeting.id)}
                  sx={{ borderRadius: 2 }}
                >
                  Previsualizar 👁️
                </Button>
              ) : null}
            </>
          ) : (
            <>
              {/* ✅ Completada: sin cancelar y sin editar, pero sí detalle + preview */}
              {!isCompleted && onCancel ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => onCancel(meeting.id)}
                  sx={{ borderRadius: 2 }}
                >
                  Cancelar
                </Button>
              ) : null}

              {!isCompleted ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(meeting.id)}
                  sx={{ borderRadius: 2 }}
                >
                  Editar
                </Button>
              ) : null}

              {canPreview && onPreview ? (
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onPreview(meeting.id)}
                  sx={{ borderRadius: 2 }}
                >
                  Previsualizar
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
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
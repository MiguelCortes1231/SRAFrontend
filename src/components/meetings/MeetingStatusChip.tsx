// src/components/meetings/MeetingStatusChip.tsx
/**
 * 🏷️ MeetingStatusChip
 * -----------------------------------------
 * Mapea el estatus interno del frontend a una etiqueta bonita.
 *
 * ✅ Cambio importante:
 * - OBSERVADA ahora se muestra como "Cancelada 🚫"
 */

import React from "react";
import { Chip } from "@mui/material";
import type { MeetingStatus } from "../../models/meeting";

type Props = {
  status: MeetingStatus;
};

export default function MeetingStatusChip({ status }: Props) {
  if (status === "COMPLETADA") {
    return (
      <Chip
        size="small"
        label="Completada ✅"
        color="success"
        variant="outlined"
      />
    );
  }

  if (status === "EN_PROCESO") {
    return (
      <Chip
        size="small"
        label="En proceso 🧭"
        color="primary"
        variant="outlined"
      />
    );
  }

  if (status === "OBSERVADA") {
    return (
      <Chip
        size="small"
        label="Cancelada 🚫"
        color="error"
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      size="small"
      label="Borrador ✍️"
      color="default"
      variant="outlined"
    />
  );
}
// src/components/meetings/MeetingStatusChip.tsx
/**
 * 🏷️ MeetingStatusChip
 * -----------------------------------------
 * Chip visual para estado general de la reunión:
 * - BORRADOR 🟦
 * - EN_PROCESO 🟡
 * - COMPLETADA 🟢
 * - OBSERVADA 🟠
 */

import React, { useMemo } from "react";
import { Chip } from "@mui/material";
import type { MeetingStatus } from "../../models/meeting";

type Props = {
  status: MeetingStatus;
  size?: "small" | "medium";
};

export default function MeetingStatusChip({ status, size = "small" }: Props) {
  const cfg = useMemo(() => {
    switch (status) {
      case "COMPLETADA":
        return { label: "Completada ✅", color: "success" as const, variant: "filled" as const };
      case "OBSERVADA":
        return { label: "Observada ⚠️", color: "warning" as const, variant: "filled" as const };
      case "EN_PROCESO":
        return { label: "En proceso 🧭", color: "primary" as const, variant: "outlined" as const };
      case "BORRADOR":
      default:
        return { label: "Borrador ✍️", color: "default" as const, variant: "outlined" as const };
    }
  }, [status]);

  return (
    <Chip
      size={size}
      label={cfg.label}
      color={cfg.color}
      variant={cfg.variant}
      sx={{ fontWeight: 800 }}
    />
  );
}

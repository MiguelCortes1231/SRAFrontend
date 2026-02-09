// src/components/ui/PageHeader.tsx
/**
 * 📌 PageHeader
 * -----------------------------------------
 * Encabezado reusable para páginas:
 * - Título + subtítulo
 * - Acciones a la derecha (botones, etc.) 🧩
 * - 100% responsivo 📱💻
 */

import React from "react";
import { Box, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode; // 🔘 botones / chips / etc.
};

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <Box className="page-header">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            {title}
          </Typography>

          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {/* 🎛️ Acciones (botones, filtros, etc.) */}
        {actions ? <Box>{actions}</Box> : null}
      </Stack>
    </Box>
  );
}

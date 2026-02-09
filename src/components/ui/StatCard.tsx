// src/components/ui/StatCard.tsx
/**
 * 📈 StatCard
 * -----------------------------------------
 * Tarjeta KPI para dashboard:
 * - Icono
 * - Valor grande
 * - Etiqueta
 * - Variación/extra opcional
 */

import React from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";

type Props = {
  label: string; // 🏷️ "Reuniones del mes"
  value: string | number; // 🔢 12
  icon?: React.ReactNode; // 🎯 Icon
  helperText?: string; // 🧠 "Actualizado hace 2 min"
};

export default function StatCard({ label, value, icon, helperText }: Props) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
              {value}
            </Typography>

            {helperText ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {helperText}
              </Typography>
            ) : null}
          </Box>

          {icon ? (
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                borderRadius: 2.5,
                bgcolor: "rgba(108,56,65,0.10)", // 🎨 primary suave
                color: "primary.main",
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

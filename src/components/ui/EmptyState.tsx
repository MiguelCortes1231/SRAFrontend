// src/components/ui/EmptyState.tsx
/**
 * 🫙 EmptyState
 * -----------------------------------------
 * Para cuando no hay datos:
 * - Mensaje claro
 * - Botón opcional (CTA)
 */

import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        border: "1px dashed rgba(0,0,0,0.18)",
        bgcolor: "rgba(255,255,255,0.60)",
      }}
    >
      <Stack spacing={1.2} alignItems="flex-start">
        {icon ? (
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              bgcolor: "rgba(108,56,65,0.10)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        ) : null}

        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
          {title}
        </Typography>

        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}

        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1, borderRadius: 2 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}

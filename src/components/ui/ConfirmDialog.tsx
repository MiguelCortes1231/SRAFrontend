// src/components/ui/ConfirmDialog.tsx
/**
 * ✅ ConfirmDialog
 * -----------------------------------------
 * Diálogo reutilizable para confirmaciones:
 * - Eliminar reunión 🗑️
 * - Confirmar acción importante ⚠️
 */

import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean; // 🟥 estilo rojo para acciones destructivas
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar ✅",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
  danger = false,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>

      <DialogContent>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          color={danger ? "error" : "primary"}
          sx={{ borderRadius: 2 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

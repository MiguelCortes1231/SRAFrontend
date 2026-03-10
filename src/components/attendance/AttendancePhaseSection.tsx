// src/components/attendance/AttendancePhaseSection.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import GroupAddIcon from "@mui/icons-material/GroupAdd";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { toast } from "react-toastify";

import type { AttendancePersonPayload, AttendancePersonRow } from "../../models/attendance";
import {
  createAttendancePerson,
  deleteAttendancePerson,
  listAttendancePersons,
  updateAttendancePerson,
} from "../../services/attendance.service";

import AttendancePersonForm from "../forms/AttendancePersonForm";
import AttendanceList from "./AttendanceList";
import ConfirmDialog from "../ui/ConfirmDialog";

type Props = {
  agendaId: string;
  readOnly?: boolean;
};

export default function AttendancePhaseSection({
  agendaId,
  readOnly = false,
}: Props) {
  const [rows, setRows] = useState<AttendancePersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<AttendancePersonRow | null>(null);
  const [toDelete, setToDelete] = useState<AttendancePersonRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const data = await listAttendancePersons(agendaId);
      setRows(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo cargar el listado ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [agendaId]);

  const handleCreate = async (payload: AttendancePersonPayload) => {
    await createAttendancePerson(agendaId, payload);
    await load();
  };

  const handleUpdate = async (idListado: number, payload: AttendancePersonPayload) => {
    await updateAttendancePerson(idListado, payload);
    setEditing(null);
    await load();
  };

  const handleCloseEditModal = () => {
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      setDeleting(true);

      const res = await deleteAttendancePerson(toDelete.IdListado);
      toast.success(res.message || "✅ Persona eliminada correctamente");

      setToDelete(null);
      await load();
    } catch (err: any) {
      toast.error(err?.message || "❌ No se pudo eliminar la persona");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupAddIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Fase 3 · Lista de asistencia 👥
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Captura una persona por vez. El listado se actualiza en tiempo real.
          </Typography>
        </Box>

        {!readOnly ? (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void load()}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          >
            Recargar listado
          </Button>
        ) : null}
      </Stack>

      {readOnly ? (
        <Alert severity="info" icon={<VisibilityIcon />} sx={{ mb: 2 }}>
          La agenda está completada ✅. Esta fase se muestra en modo solo lectura.
        </Alert>
      ) : null}

      {errorMsg ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      ) : null}

      <AttendancePersonForm
        agendaId={agendaId}
        currentList={rows}
        editingPerson={null}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancelEdit={() => undefined}
        readOnly={readOnly}
      />

      <Divider sx={{ my: 2.5 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
        Personas registradas: {rows.length} 📋
      </Typography>

      {loading ? (
        <Typography color="text.secondary">Cargando listado... ⏳</Typography>
      ) : (
        <AttendanceList
          rows={rows}
          onEdit={(row) => {
            setEditing(row);
            toast.info("✏️ Editando persona");
          }}
          onDelete={(row) => setToDelete(row)}
          readOnly={readOnly}
        />
      )}

      {!readOnly ? (
        <>
          <ConfirmDialog
            open={Boolean(toDelete)}
            title="Eliminar persona"
            description={`¿Deseas eliminar a ${toDelete?.Nombre || ""} ${toDelete?.PrimerApellido || ""}?`}
            confirmText={deleting ? "Eliminando... ⏳" : "Sí, eliminar 🗑️"}
            cancelText="Cancelar"
            onConfirm={handleDelete}
            onClose={() => (deleting ? null : setToDelete(null))}
            danger
          />

          <Dialog
            open={Boolean(editing)}
            onClose={handleCloseEditModal}
            fullWidth
            maxWidth="lg"
          >
            <DialogTitle
              sx={{
                fontWeight: 900,
                pr: 6,
                position: "relative",
              }}
            >
              Editar persona ✏️

              <IconButton
                aria-label="cerrar"
                onClick={handleCloseEditModal}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              {editing ? (
                <AttendancePersonForm
                  agendaId={agendaId}
                  currentList={rows}
                  editingPerson={editing}
                  onCreate={handleCreate}
                  onUpdate={handleUpdate}
                  onCancelEdit={handleCloseEditModal}
                  readOnly={false}
                />
              ) : null}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCloseEditModal}
              >
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Box>
  );
}
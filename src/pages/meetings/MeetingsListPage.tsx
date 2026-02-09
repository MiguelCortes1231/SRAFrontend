// src/pages/meetings/MeetingsListPage.tsx
/**
 * 📋 MeetingsListPage
 * -----------------------------------------
 * - Lista de reuniones con filtros pro 🔎
 * - Cards elegantes 🧾
 * - Eliminar con confirmación 🗑️✅
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import ListAltIcon from "@mui/icons-material/ListAlt";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import MeetingCard from "../../components/meetings/MeetingCard";

import type { Meeting, MeetingStatus, MeetingType } from "../../models/meeting";
import { deleteMeeting, listMeetings } from "../../services/meetings.service";

type StatusFilter = "ALL" | MeetingStatus;
type TypeFilter = "ALL" | MeetingType;

export default function MeetingsListPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 🔎 Filtros
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  // 🗑️ Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await listMeetings();
      setMeetings(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudieron cargar las reuniones ❌");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return meetings.filter((m) => {
      const byStatus = statusFilter === "ALL" ? true : m.status === statusFilter;
      const byType = typeFilter === "ALL" ? true : m.core.type === typeFilter;

      const haystack = [
        m.core.type,
        m.core.sede,
        m.core.municipio,
        m.core.seccion,
        m.core.distritoFederal,
        m.core.distritoLocal,
        m.core.organizer.name,
        m.core.enlace.name,
      ]
        .join(" ")
        .toLowerCase();

      const byQuery = q.length === 0 ? true : haystack.includes(q);

      return byStatus && byType && byQuery;
    });
  }, [meetings, query, statusFilter, typeFilter]);

  const actions = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={{ xs: "100%", sm: "auto" }}>
      <Button
        variant="contained"
        startIcon={<AddCircleIcon />}
        onClick={() => navigate("/meetings/new")}
        sx={{ borderRadius: 2 }}
      >
        Alta de reunión ➕
      </Button>
    </Stack>
  );

  const handleOpen = (id: string) => navigate(`/meetings/${id}`);

  const handleAskDelete = (id: string) => setDeleteId(id);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteMeeting(deleteId);
      setDeleteId(null);
      await load();
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo eliminar la reunión ❌");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Reuniones"
        subtitle="Administra reuniones, evidencias, asistencias y su flujo por fases 🧭"
        actions={actions}
      />

      {/* 🧯 Error */}
      {errorMsg ? (
        <Typography color="error" sx={{ mb: 2, fontWeight: 800 }}>
          {errorMsg}
        </Typography>
      ) : null}

      {/* 🔎 Filtros */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Buscar"
            placeholder="Sede, municipio, sección, organizador..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Estatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="BORRADOR">Borrador ✍️</MenuItem>
            <MenuItem value="EN_PROCESO">En proceso 🧭</MenuItem>
            <MenuItem value="COMPLETADA">Completada ✅</MenuItem>
            <MenuItem value="OBSERVADA">Observada ⚠️</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Tipo"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="ASAMBLEA">Asamblea</MenuItem>
            <MenuItem value="EVENTO">Evento</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* ⏳ Loading */}
      {loading ? <Typography color="text.secondary">Cargando... ⏳</Typography> : null}

      {/* 🫙 Empty */}
      {!loading && meetings.length === 0 ? (
        <EmptyState
          title="Aún no hay reuniones registradas"
          description="Crea tu primera reunión para iniciar el flujo por fases (1..6) 🧭"
          icon={<ListAltIcon />}
          actionLabel="Crear reunión ➕"
          onAction={() => navigate("/meetings/new")}
        />
      ) : null}

      {/* 🧾 Lista */}
      {!loading && meetings.length > 0 ? (
        <>
          {filtered.length === 0 ? (
            <EmptyState
              title="No hay resultados con esos filtros"
              description="Prueba otro texto o cambia estatus/tipo 🔎"
              icon={<SearchIcon />}
            />
          ) : (
            <Grid container spacing={2}>
              {filtered.map((m) => (
                <Grid item xs={12} md={6} xl={4} key={m.id}>
                  <MeetingCard
                    meeting={m}
                    onOpen={handleOpen}
                    onDelete={handleAskDelete}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : null}

      {/* ✅ Confirmación delete */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Eliminar reunión"
        description="Esta acción eliminará la reunión del mock DB (local). ¿Deseas continuar? 🗑️"
        confirmText={deleting ? "Eliminando... ⏳" : "Sí, eliminar 🗑️"}
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => (deleting ? null : setDeleteId(null))}
        danger
      />
    </Box>
  );
}

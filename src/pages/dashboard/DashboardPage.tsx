// src/pages/dashboard/DashboardPage.tsx
/**
 * 🏠 DashboardPage
 * -----------------------------------------
 * - KPIs (totales + estado)
 * - Próximas reuniones
 * - Calendario mensual con badges 📅
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";

// 🧩 UI reusable
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";

// 📅 Calendar component
import MeetingsCalendar from "../../components/calendar/MeetingsCalendar";

// 🔁 Services
import { listMeetings } from "../../services/meetings.service";

// 🎯 Icons
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import type { Meeting } from "../../models/meeting";
import { formatDateShort } from "../../utils/format";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** 📥 Cargar reuniones */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const data = await listMeetings();
        if (!alive) return;
        setMeetings(data);
      } catch (err: any) {
        if (!alive) return;
        setErrorMsg(err?.message || "No se pudieron cargar las reuniones ❌");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /** 📊 KPIs */
  const kpis = useMemo(() => {
    const total = meetings.length;
    const enProceso = meetings.filter((m) => m.status === "EN_PROCESO").length;
    const completadas = meetings.filter((m) => m.status === "COMPLETADA").length;
    const observadas = meetings.filter((m) => m.status === "OBSERVADA").length;

    return { total, enProceso, completadas, observadas };
  }, [meetings]);

  /** 📌 Próximas reuniones (top 5) */
  const upcoming = useMemo(() => {
    // Orden por fechaISO ascendente
    const sorted = [...meetings].sort((a, b) =>
      a.core.dateISO > b.core.dateISO ? 1 : -1
    );
    return sorted.slice(0, 5);
  }, [meetings]);

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

      <Button
        variant="outlined"
        startIcon={<EventNoteIcon />}
        onClick={() => navigate("/meetings")}
        sx={{ borderRadius: 2 }}
      >
        Ver reuniones 📋
      </Button>
    </Stack>
  );

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Control, evidencias, asistencias y trazabilidad en un solo lugar 🧭"
        actions={actions}
      />

      {/* 🧯 Error */}
      {errorMsg ? (
        <Typography color="error" sx={{ mb: 2, fontWeight: 700 }}>
          {errorMsg}
        </Typography>
      ) : null}

      {/* ⏳ Loading simple */}
      {loading ? (
        <Typography color="text.secondary">Cargando datos... ⏳</Typography>
      ) : null}

      {/* 📊 KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total de reuniones" value={kpis.total} icon={<EventNoteIcon />} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="En proceso"
            value={kpis.enProceso}
            icon={<PendingActionsIcon />}
            helperText="Flujo por fases activo 🧭"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Completadas"
            value={kpis.completadas}
            icon={<CheckCircleIcon />}
            helperText="Listas para auditoría ✅"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Observadas"
            value={kpis.observadas}
            icon={<WarningAmberIcon />}
            helperText="Revisar evidencias ⚠️"
          />
        </Grid>
      </Grid>

      {/* 📅 Calendario + Próximas */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <MeetingsCalendar
            meetings={meetings}
            onOpenMeeting={(id) => navigate(`/meetings/${id}`)}
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          {meetings.length === 0 ? (
            <EmptyState
              title="Aún no hay reuniones registradas"
              description="Crea tu primera reunión para comenzar el flujo por fases (1..6) 🧭"
              icon={<CalendarMonthIcon />}
              actionLabel="Crear reunión ➕"
              onAction={() => navigate("/meetings/new")}
            />
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                Próximas reuniones 📌
              </Typography>

              {upcoming.map((m) => (
                <Box
                  key={m.id}
                  onClick={() => navigate(`/meetings/${m.id}`)}
                  sx={{
                    p: 1.3,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)",
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(108,56,65,0.06)" },
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {m.core.type} · {m.core.sede}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateShort(m.core.dateISO)} · {m.core.municipio} · Sección {m.core.seccion}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

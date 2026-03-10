// src/pages/dashboard/DashboardPage.tsx
/**
 * 🏠 DashboardPage
 * -----------------------------------------
 * ✅ KPIs:
 * - Total de reuniones
 * - En proceso
 * - Completadas
 * - Canceladas
 *
 * ✅ Todas las cards del mismo tamaño
 * ✅ Próximas reuniones paginadas
 * ✅ Calendario con reuniones del día paginadas
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import MeetingsCalendar from "../../components/calendar/MeetingsCalendar";

import { listMeetings } from "../../services/meetings.service";

import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import type { Meeting } from "../../models/meeting";
import { formatDateShort } from "../../utils/format";

const UPCOMING_PAGE_SIZE = 5;
const UPCOMING_MAX = 20;

function toStartOfDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`);
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [upcomingPage, setUpcomingPage] = useState(1);

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
    const canceladas = meetings.filter((m) => m.status === "OBSERVADA").length;

    return { total, enProceso, completadas, canceladas };
  }, [meetings]);

  /** 📅 Próximas reuniones */
  const upcoming = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const futureOrToday = meetings
      .filter((m) => {
        const d = toStartOfDay(m.core.dateISO);
        return d.getTime() >= todayStart.getTime();
      })
      .sort((a, b) => {
        const da = toStartOfDay(a.core.dateISO).getTime();
        const db = toStartOfDay(b.core.dateISO).getTime();
        return da - db;
      });

    const fallbackPastClosest = meetings
      .filter((m) => {
        const d = toStartOfDay(m.core.dateISO);
        return d.getTime() < todayStart.getTime();
      })
      .sort((a, b) => {
        const da = Math.abs(toStartOfDay(a.core.dateISO).getTime() - todayStart.getTime());
        const db = Math.abs(toStartOfDay(b.core.dateISO).getTime() - todayStart.getTime());
        return da - db;
      });

    const base = futureOrToday.length > 0 ? futureOrToday : fallbackPastClosest;
    return base.slice(0, UPCOMING_MAX);
  }, [meetings]);

  const upcomingTotalPages = Math.max(
    1,
    Math.ceil(upcoming.length / UPCOMING_PAGE_SIZE)
  );

  const paginatedUpcoming = useMemo(() => {
    const start = (upcomingPage - 1) * UPCOMING_PAGE_SIZE;
    return upcoming.slice(start, start + UPCOMING_PAGE_SIZE);
  }, [upcoming, upcomingPage]);

  useEffect(() => {
    setUpcomingPage(1);
  }, [meetings]);

  const actions = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      width={{ xs: "100%", sm: "auto" }}
    >
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
        subtitle="Resumen general de reuniones, seguimiento y calendario 🧭"
        actions={actions}
      />

      {errorMsg ? (
        <Typography color="error" sx={{ mb: 2, fontWeight: 700 }}>
          {errorMsg}
        </Typography>
      ) : null}

      {loading ? (
        <Typography color="text.secondary">Cargando datos... ⏳</Typography>
      ) : null}

      {/* 📊 KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <Box sx={{ height: "100%" }}>
            <StatCard
              label="Total de reuniones"
              value={kpis.total}
              icon={<EventNoteIcon />}
              helperText="Todas las agendas registradas 📋"
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} xl={3}>
          <Box sx={{ height: "100%" }}>
            <StatCard
              label="En proceso"
              value={kpis.enProceso}
              icon={<PendingActionsIcon />}
              helperText="Reuniones con flujo activo 🧭"
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} xl={3}>
          <Box sx={{ height: "100%" }}>
            <StatCard
              label="Completadas"
              value={kpis.completadas}
              icon={<CheckCircleIcon />}
              helperText="Reuniones finalizadas ✅"
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} xl={3}>
          <Box sx={{ height: "100%" }}>
            <StatCard
              label="Canceladas"
              value={kpis.canceladas}
              icon={<CancelIcon />}
              helperText="Agendas canceladas 🚫"
            />
          </Box>
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
              description="Crea tu primera reunión para comenzar el flujo por fases 🧭"
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
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                Próximas reuniones 📌
              </Typography>

              {paginatedUpcoming.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay reuniones cercanas registradas 🫙
                </Typography>
              ) : (
                <>
                  {paginatedUpcoming.map((m) => (
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
                        {formatDateShort(m.core.dateISO)} · {m.core.municipio} · Sección{" "}
                        {m.core.seccion}
                      </Typography>
                    </Box>
                  ))}

                  {upcoming.length > UPCOMING_PAGE_SIZE ? (
                    <Stack alignItems="center" sx={{ mt: 1.5 }}>
                      <Pagination
                        count={upcomingTotalPages}
                        page={upcomingPage}
                        onChange={(_, value) => setUpcomingPage(value)}
                        size="small"
                        color="primary"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Mostrando {paginatedUpcoming.length} de {upcoming.length} reuniones cercanas
                      </Typography>
                    </Stack>
                  ) : null}
                </>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
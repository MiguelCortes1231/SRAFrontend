// src/components/calendar/MeetingsCalendar.tsx
/**
 * 📅 MeetingsCalendar (MUI X Date Pickers)
 * -----------------------------------------
 * - Calendario mensual bonito ✨
 * - Marca días con reuniones 🧾
 * - Al seleccionar un día, muestra reuniones de ese día 📌
 *
 * Nota:
 * - Para "agenda tipo Google Calendar" usaríamos FullCalendar
 * - Pero este enfoque es estable, rápido y suficiente para MVP ✅
 */

import React, { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Badge,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";

import type { Meeting } from "../../models/meeting";
import { formatDateShort } from "../../utils/format";

type Props = {
  meetings: Meeting[];
  onOpenMeeting?: (meetingId: string) => void; // 🔗 click a detalle
};

/** 📌 Helper: Normaliza a "YYYY-MM-DD" */
function toDayKey(iso: string) {
  return dayjs(iso).format("YYYY-MM-DD");
}

/** 🧩 Día custom con badge */
function MeetingBadgedDay(
  props: PickersDayProps<Dayjs> & { meetingCount?: number }
) {
  const { meetingCount = 0, day, outsideCurrentMonth, ...other } = props;

  return (
    <Badge
      overlap="circular"
      badgeContent={meetingCount > 0 ? meetingCount : undefined}
      color="primary"
      sx={{
        "& .MuiBadge-badge": {
          fontSize: 10,
          minWidth: 16,
          height: 16,
        },
      }}
    >
      <PickersDay day={day} outsideCurrentMonth={outsideCurrentMonth} {...other} />
    </Badge>
  );
}

export default function MeetingsCalendar({ meetings, onOpenMeeting }: Props) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  /** 🧠 Mapa: díaKey -> reuniones */
  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const key = dayjs(m.core.dateISO).format("YYYY-MM-DD");
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return map;
  }, [meetings]);

  /** 📌 Reuniones del día seleccionado */
  const dayMeetings = useMemo(() => {
    const key = selectedDate.format("YYYY-MM-DD");
    const list = meetingsByDay.get(key) ?? [];
    // Orden por hora (si luego agregas hora) o por createdAt
    return [...list].sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
  }, [meetingsByDay, selectedDate]);

  /** 📅 Conteo por día para badges */
  const dayCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of meetings) {
      const key = toDayKey(m.core.dateISO);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [meetings]);

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ xs: "stretch", md: "flex-start" }}
        >
          {/* 📅 Calendario */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
              Calendario de Reuniones 📅
            </Typography>

            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
              slots={{
                day: MeetingBadgedDay,
              }}
              slotProps={{
                day: (ownerState) => {
                  const key = ownerState.day.format("YYYY-MM-DD");
                  return {
                    meetingCount: dayCounts.get(key) ?? 0,
                  } as any;
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              💡 Tip: los números sobre un día indican cuántas reuniones hay.
            </Typography>
          </Box>

          {/* 📌 Panel del día */}
          <Box sx={{ flex: 1.2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
              Reuniones del día 📌
            </Typography>

            <Box
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: "rgba(108,56,65,0.06)",
                border: "1px solid rgba(108,56,65,0.15)",
                mb: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatDateShort(selectedDate.toISOString())}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayMeetings.length === 0
                  ? "Sin reuniones registradas 🫙"
                  : `${dayMeetings.length} reunión(es) encontradas ✅`}
              </Typography>
            </Box>

            <Divider sx={{ mb: 1.2 }} />

            {dayMeetings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay reuniones para esta fecha. Puedes crear una nueva desde “Reuniones” ➕
              </Typography>
            ) : (
              <List dense disablePadding>
                {dayMeetings.map((m) => (
                  <ListItemButton
                    key={m.id}
                    onClick={() => onOpenMeeting?.(m.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.8,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 800 }}>
                          {m.core.type} · {m.core.sede}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {m.core.municipio} · Sección {m.core.seccion}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

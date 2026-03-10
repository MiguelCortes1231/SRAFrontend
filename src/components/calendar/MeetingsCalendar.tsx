// src/components/calendar/MeetingsCalendar.tsx
/**
 * 📅 MeetingsCalendar
 * -----------------------------------------
 * ✅ Calendario mensual
 * ✅ Días con badge de reuniones
 * ✅ Reuniones del día con paginación (5 por página)
 * ✅ Responsivo 📱💻
 */

import React, { useEffect, useMemo, useState } from "react";
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
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";

import type { Meeting } from "../../models/meeting";
import { formatDateShort } from "../../utils/format";

type Props = {
  meetings: Meeting[];
  onOpenMeeting?: (meetingId: string) => void;
};

const DAY_PAGE_SIZE = 5;

function toDayKey(iso: string) {
  return dayjs(iso).format("YYYY-MM-DD");
}

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
  const [dayPage, setDayPage] = useState(1);

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

  const dayMeetings = useMemo(() => {
    const key = selectedDate.format("YYYY-MM-DD");
    const list = meetingsByDay.get(key) ?? [];

    return [...list].sort((a, b) =>
      a.core.dateISO > b.core.dateISO ? 1 : -1
    );
  }, [meetingsByDay, selectedDate]);

  const dayCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const m of meetings) {
      const key = toDayKey(m.core.dateISO);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }, [meetings]);

  const dayTotalPages = Math.max(1, Math.ceil(dayMeetings.length / DAY_PAGE_SIZE));

  const paginatedDayMeetings = useMemo(() => {
    const start = (dayPage - 1) * DAY_PAGE_SIZE;
    return dayMeetings.slice(start, start + DAY_PAGE_SIZE);
  }, [dayMeetings, dayPage]);

  useEffect(() => {
    setDayPage(1);
  }, [selectedDate]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2.5}
          alignItems={{ xs: "stretch", lg: "flex-start" }}
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
              💡 Los números sobre un día indican cuántas reuniones hay.
            </Typography>
          </Box>

          {/* 📌 Reuniones del día */}
          <Box sx={{ flex: 1.15 }}>
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
                No hay reuniones para esta fecha.
              </Typography>
            ) : (
              <>
                <List dense disablePadding>
                  {paginatedDayMeetings.map((m) => (
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

                {dayMeetings.length > DAY_PAGE_SIZE ? (
                  <Stack alignItems="center" sx={{ mt: 1.5 }}>
                    <Pagination
                      count={dayTotalPages}
                      page={dayPage}
                      onChange={(_, value) => setDayPage(value)}
                      size="small"
                      color="primary"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Mostrando {paginatedDayMeetings.length} de {dayMeetings.length}
                    </Typography>
                  </Stack>
                ) : null}
              </>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
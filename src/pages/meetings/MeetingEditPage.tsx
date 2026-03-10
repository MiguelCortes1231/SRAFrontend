// src/pages/meetings/MeetingEditPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import PageHeader from "../../components/ui/PageHeader";
import MeetingForm from "../../components/forms/MeetingForm";

import type { Meeting, MeetingCore } from "../../models/meeting";
import { getMeeting, updateMeeting } from "../../services/meetings.service";
import { toast } from "react-toastify";

export default function MeetingEditPage() {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo cargar la reunión ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [meetingId]);

  const handleSubmit = async (core: MeetingCore) => {
    if (!meetingId) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const updated = await updateMeeting(meetingId, core);
      setMeeting(updated);

      toast.success("✅ Reunión actualizada correctamente");
      navigate(`/meetings/${meetingId}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo actualizar la reunión ❌");
      toast.error(err?.message || "❌ No se pudo actualizar la reunión");
    } finally {
      setSubmitting(false);
    }
  };

  const initial = useMemo(() => {
    if (!meeting) return undefined;
    return meeting.core;
  }, [meeting]);

  const actions = (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate("/meetings")}
      sx={{ borderRadius: 2 }}
    >
      Volver a reuniones
    </Button>
  );

  return (
    <Box>
      <PageHeader
        title="Editar reunión"
        subtitle="Corrige la información principal de la agenda ✏️"
        actions={actions}
      />

      {errorMsg ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      ) : null}

      {loading ? (
        <Typography color="text.secondary">Cargando reunión... ⏳</Typography>
      ) : meeting ? (
        <Card>
          <CardContent>
            <MeetingForm
              initial={initial}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
}
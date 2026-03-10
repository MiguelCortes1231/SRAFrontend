// src/components/forms/MinorsAttendanceForm.tsx
/**
 * 🧒 MinorsAttendanceForm (Fase 3 - Menores >= 17)
 * -----------------------------------------
 * Campos:
 * - CURP
 * - Nombre
 * - Apellidos
 * - Domicilio
 * - Teléfono
 * - Edad
 *
 * Validaciones:
 * - CURP válida ✅
 * - Edad >= 17 ✅
 */

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

import type { Meeting } from "../../models/meeting";
import { addMinorAttendance } from "../../services/meetings.service";
import {  isValidCurp, normalizeCurp } from "../../utils/validators";

type Props = {
  meeting: Meeting;
  onUpdated: (meeting: Meeting) => void;
};

export default function MinorsAttendanceForm({ meeting, onUpdated }: Props) {
  const [curp, setCurp] = useState("");
  const [nombre, setNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [edad, setEdad] = useState<number>(17);

  const [loading, setLoading] = useState(false);

  const curpNorm = useMemo(() => normalizeCurp(curp), [curp]);

  const errors = useMemo(() => {
    const list: string[] = [];

    if (!isValidCurp(curpNorm)) list.push("CURP inválida ❌");

    if (nombre.trim().length < 2) list.push("Nombre requerido ✍️");
    if (primerApellido.trim().length < 2) list.push("Primer apellido requerido ✍️");
    if (domicilio.trim().length < 5) list.push("Domicilio requerido ✍️");
    if (telefono.trim().length < 7) list.push("Teléfono requerido ✍️");

    return list;
  }, [curpNorm, edad, nombre, primerApellido, domicilio, telefono]);

  const canSubmit = errors.length === 0 && !loading;

  const handleAdd = async () => {
    if (!canSubmit) {
      alert("Revisa campos: " + errors.join(" · "));
      return;
    }

    try {
      setLoading(true);

      const updated = await addMinorAttendance(meeting.id, {
        curp: curpNorm,
        nombre: nombre.trim(),
        primerApellido: primerApellido.trim(),
        segundoApellido: segundoApellido.trim(),
        domicilio: domicilio.trim(),
        telefono: telefono.trim(),
        edad,
      });

      onUpdated(updated);

      // 🧼 Reset
      setCurp("");
      setNombre("");
      setPrimerApellido("");
      setSegundoApellido("");
      setDomicilio("");
      setTelefono("");
      setEdad(17);
    } catch (err: any) {
      alert(err?.message || "No se pudo registrar menor ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonSearchIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Asistencias · Menores ({'>'}= 17) 🧒✅
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Registra menores permitidos. Se valida CURP y edad mínima.
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="CURP"
                placeholder="18 caracteres"
                value={curpNorm}
                onChange={(e) => setCurp(e.target.value)}
                inputProps={{ maxLength: 18 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Primer Apellido"
                value={primerApellido}
                onChange={(e) => setPrimerApellido(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Segundo Apellido"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Edad"
                type="number"
                value={edad}
                onChange={(e) => setEdad(parseInt(e.target.value || "0", 10))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Domicilio"
                value={domicilio}
                onChange={(e) => setDomicilio(e.target.value)}
                multiline
                minRows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                disabled={!canSubmit}
                onClick={handleAdd}
                sx={{ borderRadius: 2 }}
              >
                {loading ? "Agregando... ⏳" : "Agregar menor ✅"}
              </Button>

              {errors.length > 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  ⚠️ {errors.join(" · ")}
                </Typography>
              ) : null}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Total menores registrados: <strong>{meeting.attendanceMinors.length}</strong>
              </Typography>

              {/* 📋 Lista simple */}
              {meeting.attendanceMinors.length > 0 ? (
                <Box sx={{ mt: 1 }}>
                  {meeting.attendanceMinors.slice(0, 6).map((m) => (
                    <Box
                      key={m.id}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        border: "1px solid rgba(0,0,0,0.06)",
                        mb: 0.8,
                      }}
                    >
                      <Typography sx={{ fontWeight: 900 }}>
                        {m.nombre} {m.primerApellido} {m.segundoApellido}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CURP: <strong>{m.curp}</strong> · Edad: <strong>{m.edad}</strong>
                      </Typography>
                    </Box>
                  ))}
                  {meeting.attendanceMinors.length > 6 ? (
                    <Typography variant="caption" color="text.secondary">
                      Mostrando 6 de {meeting.attendanceMinors.length}…
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

// src/components/forms/MeetingForm.tsx
/**
 * 🧾 MeetingForm (FASE 1)
 * -----------------------------------------
 * ✅ Campos principales:
 * - Tipo (Asamblea/Evento)
 * - Fecha
 * - Sede
 * - Organizador / Enlace
 * - Distrito federal / local
 * - Municipio (Autocomplete) 🧠
 * - Sección (Autocomplete dependiente) 🧠
 * - Dirección (texto)
 * - Ubicación GPS (Mapa manipulable + inputs lat/lng) 📍
 *
 * 🎯 Resultado:
 * - onSubmit(MeetingCore) listo para crear reunión (mock/API) ✅
 *
 * ⚠️ Nota:
 * - Se valida que Organizador y Enlace tengan mínimo 3 caracteres.
 *   En tu screenshot, "rr" no pasa (2 letras) → por eso no se habilitaba el botón.
 */

import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { MeetingCore, MeetingType } from "../../models/meeting";
import LocationMap from "../maps/LocationMap";

// ✅ Mocks de catálogo (luego vendrán de API)
const MUNICIPIOS_MOCK = [
  "OTHÓN P. BLANCO",
  "BACALAR",
  "BENITO JUÁREZ",
  "SOLIDARIDAD",
  "COZUMEL",
];

// ✅ Secciones por municipio (mock)
const SECCIONES_MOCK: Record<string, string[]> = {
  "OTHÓN P. BLANCO": ["0337", "0378", "1123", "2101"],
  BACALAR: ["1001", "1002", "1003"],
  "BENITO JUÁREZ": ["2001", "2002", "2003"],
  SOLIDARIDAD: ["3001", "3002"],
  COZUMEL: ["0186", "0190"],
};

// 🗓️ Fecha default yyyy-mm-dd (input type=date)
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type Props = {
  initial?: Partial<MeetingCore>;
  onSubmit: (data: MeetingCore) => Promise<void> | void;
  submitting?: boolean;
};

export default function MeetingForm({ initial, onSubmit, submitting = false }: Props) {
  // 🧠 Estado local del formulario
  const [type, setType] = useState<MeetingType>((initial?.type as MeetingType) || "ASAMBLEA");
  const [dateISO, setDateISO] = useState(initial?.dateISO || todayISO());
  const [sede, setSede] = useState(initial?.sede || "");

  const [address, setAddress] = useState(initial?.address || "");

  const [organizerName, setOrganizerName] = useState(initial?.organizer?.name || "");
  const [enlaceName, setEnlaceName] = useState(initial?.enlace?.name || "");

  const [distritoFederal, setDistritoFederal] = useState(initial?.distritoFederal || "");
  const [distritoLocal, setDistritoLocal] = useState(initial?.distritoLocal || "");

  // ✅ Municipio/Sección (Autocomplete)
  const [municipio, setMunicipio] = useState(initial?.municipio || "");
  const [seccion, setSeccion] = useState(initial?.seccion || "");

  // 📍 GPS string "lat,lng"
  const [gps, setGps] = useState(() => {
    const lat = initial?.location?.lat ?? 18.5001;
    const lng = initial?.location?.lng ?? -88.2961;
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  });

  // ✅ Parse GPS -> punto
  const gpsPoint = useMemo(() => {
    const parts = String(gps).split(",");
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return {
      lat: Number.isNaN(lat) ? 0 : lat,
      lng: Number.isNaN(lng) ? 0 : lng,
    };
  }, [gps]);

  // ✅ Opciones de sección dependientes del municipio
  const seccionesDisponibles = useMemo(() => {
    return SECCIONES_MOCK[municipio] ?? ["0001", "0002", "0003"];
  }, [municipio]);

  // 🧠 Errores visibles (para que no “engañe” el botón)
  const errors = useMemo(() => {
    const e: string[] = [];

    if (!dateISO) e.push("Fecha requerida 📅");
    if (sede.trim().length < 3) e.push("Sede mínimo 3 caracteres 🏢");

    if (organizerName.trim().length < 3) e.push("Organizador mínimo 3 caracteres 👤");
    if (enlaceName.trim().length < 3) e.push("Enlace mínimo 3 caracteres 👤");

    if (distritoFederal.trim().length < 1) e.push("Distrito Federal requerido 🗳️");
    if (distritoLocal.trim().length < 1) e.push("Distrito Local requerido 🗳️");

    if (municipio.trim().length < 2) e.push("Municipio requerido 🏙️");
    if (seccion.trim().length < 1) e.push("Sección requerida 🧷");

    if (address.trim().length < 5) e.push("Dirección mínimo 5 caracteres 🏠");

    // Validación GPS básica
    if (!gps || String(gps).split(",").length !== 2) e.push("GPS inválido (lat,lng) 📍");

    // lat/lng plausibles
    if (gpsPoint.lat === 0 && gpsPoint.lng === 0) e.push("GPS inválido (0,0) 📍");

    return e;
  }, [
    dateISO,
    sede,
    organizerName,
    enlaceName,
    distritoFederal,
    distritoLocal,
    municipio,
    seccion,
    address,
    gps,
    gpsPoint.lat,
    gpsPoint.lng,
  ]);

  const canSubmit = errors.length === 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      alert("Revisa campos:\n- " + errors.join("\n- "));
      return;
    }

    const payload: MeetingCore = {
      type,
      dateISO,
      sede: sede.trim(),
      location: gpsPoint,
      address: address.trim(),
      organizer: { name: organizerName.trim() },
      enlace: { name: enlaceName.trim() },
      distritoFederal: distritoFederal.trim(),
      distritoLocal: distritoLocal.trim(),
      municipio: municipio.trim(),
      seccion: seccion.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
        Fase 1 · Alta de reunión 🧾
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Captura los datos principales. Al guardar, el sistema genera un QR único 🔳
      </Typography>

      <Grid container spacing={2}>
        {/* 🏷️ Tipo */}
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Tipo de reunión"
            value={type}
            onChange={(e) => setType(e.target.value as MeetingType)}
          >
            <MenuItem value="ASAMBLEA">Asamblea</MenuItem>
            <MenuItem value="EVENTO">Evento</MenuItem>
          </TextField>
        </Grid>

        {/* 📅 Fecha */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Fecha"
            type="date"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* 🏢 Sede */}
        <Grid item xs={12} md={4}>
          <TextField
            label="Sede"
            placeholder="Ej: Casa ejidal, domo, salón..."
            value={sede}
            onChange={(e) => setSede(e.target.value)}
          />
        </Grid>

        {/* 👤 Organizador */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Organizador"
            placeholder="Nombre completo (mín 3 caracteres)"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
          />
        </Grid>

        {/* 👤 Enlace */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Enlace"
            placeholder="Nombre completo (mín 3 caracteres)"
            value={enlaceName}
            onChange={(e) => setEnlaceName(e.target.value)}
          />
        </Grid>

        {/* 🗳️ Distritos */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Distrito Federal"
            placeholder="Ej: 02"
            value={distritoFederal}
            onChange={(e) => setDistritoFederal(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            label="Distrito Local"
            placeholder="Ej: 14"
            value={distritoLocal}
            onChange={(e) => setDistritoLocal(e.target.value)}
          />
        </Grid>

        {/* 🏙️ Municipio (Autocomplete) */}
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={MUNICIPIOS_MOCK}
            value={municipio || null}
            onChange={(_, newValue) => {
              const v = newValue ?? "";
              setMunicipio(v);

              // 🧠 Si cambia municipio, reset sección
              setSeccion("");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Municipio" placeholder="Selecciona municipio" />
            )}
          />
        </Grid>

        {/* 🧷 Sección (Autocomplete dependiente) */}
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={seccionesDisponibles}
            value={seccion || null}
            onChange={(_, newValue) => setSeccion(newValue ?? "")}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} label="Sección" placeholder="Ej: 0378" />
            )}
          />
        </Grid>

        {/* 🏠 Dirección */}
        <Grid item xs={12}>
          <TextField
            label="Dirección (texto)"
            placeholder="Calle, colonia, referencias..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            multiline
            minRows={2}
          />
        </Grid>

        {/* 🗺️ Mapa */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Ubicación GPS 📍</Typography>
          <LocationMap value={gps} onChange={setGps} />
        </Grid>

        {/* ✅ Errores visibles */}
        {errors.length > 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 1.4,
                borderRadius: 2,
                bgcolor: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.30)",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>Faltan campos ⚠️</Typography>
              <Typography variant="body2" color="text.secondary">
                {errors.join(" · ")}
              </Typography>
            </Box>
          </Grid>
        ) : null}

        {/* ✅ Submit */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            justifyContent="flex-end"
            sx={{ mt: 1 }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit}
              sx={{ borderRadius: 2, py: 1.1 }}
            >
              {submitting ? "Guardando... ⏳" : "Guardar reunión + Generar QR 🔳"}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            💡 Tip: Organizador y Enlace deben tener mínimo 3 caracteres.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

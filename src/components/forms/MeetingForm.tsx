// src/components/forms/MeetingForm.tsx
/**
 * 🧾 MeetingForm (FASE 1 · API REAL)
 * -----------------------------------------
 * Ajustes solicitados por PM / backend ✅
 *
 * 🔢 Orden correcto:
 * 1. Sección
 * 2. Municipio
 * 3. Distrito Local
 * 4. Distrito Federal
 *
 * 📌 Reglas:
 * - Sección es el campo principal
 * - Municipio / Distrito Local / Distrito Federal:
 *   - se autollenan desde backend
 *   - inician deshabilitados
 *   - NO son editables manualmente
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { MeetingCore, MeetingType } from "../../models/meeting";
import LocationMap from "../maps/LocationMap";
import {
  findSectionById,
  getSections,
  type SectionCatalogItem,
} from "../../services/catalogs.service";

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
  // 🧠 estado base
  const [type, setType] = useState<MeetingType>((initial?.type as MeetingType) || "ASAMBLEA");
  const [dateISO, setDateISO] = useState(initial?.dateISO || todayISO());
  const [sede, setSede] = useState(initial?.sede || "");
  const [address, setAddress] = useState(initial?.address || "");

  const [organizerName, setOrganizerName] = useState(initial?.organizer?.name || "");
  const [enlaceName, setEnlaceName] = useState(initial?.enlace?.name || "");

  // ✅ orden solicitado
  const [seccion, setSeccion] = useState(initial?.seccion || "");
  const [municipio, setMunicipio] = useState(initial?.municipio || "");
  const [distritoLocal, setDistritoLocal] = useState(initial?.distritoLocal || "");
  const [distritoFederal, setDistritoFederal] = useState(initial?.distritoFederal || "");

  // 📍 GPS
  const [gps, setGps] = useState(() => {
    const lat = initial?.location?.lat ?? 18.5001;
    const lng = initial?.location?.lng ?? -88.2961;
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  });

  // 📚 catálogo secciones
  const [sections, setSections] = useState<SectionCatalogItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionError, setSectionError] = useState<string | null>(null);

  const [sectionInputText, setSectionInputText] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setSectionsLoading(true);
        setSectionError(null);

        const rows = await getSections();
        if (!alive) return;
        setSections(rows);
      } catch (err: any) {
        if (!alive) return;
        setSectionError(err?.message || "No se pudo cargar catálogo de secciones ❌");
      } finally {
        if (!alive) return;
        setSectionsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ GPS -> point
  const gpsPoint = useMemo(() => {
    const parts = String(gps).split(",");
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    return {
      lat: Number.isNaN(lat) ? 0 : lat,
      lng: Number.isNaN(lng) ? 0 : lng,
    };
  }, [gps]);

  // 🔎 sección seleccionada
  const selectedSection = useMemo(() => {
    if (!seccion) return null;
    return sections.find((s) => String(s.IdSeccion) === String(seccion)) ?? null;
  }, [sections, seccion]);

  // 🔁 cuando cambia sección -> autollenar
  useEffect(() => {
    if (!selectedSection) {
      setMunicipio("");
      setDistritoLocal("");
      setDistritoFederal("");
      return;
    }

    setMunicipio(selectedSection.Municipio || "");
    setDistritoLocal(String(selectedSection.IdDistritoLocal ?? ""));
    setDistritoFederal(String(selectedSection.IdDistritoFederal ?? ""));
  }, [selectedSection]);

  const errors = useMemo(() => {
    const e: string[] = [];

    if (!dateISO) e.push("Fecha requerida 📅");
    if (sede.trim().length < 3) e.push("Sede mínimo 3 caracteres 🏢");
    if (organizerName.trim().length < 3) e.push("Organizador mínimo 3 caracteres 👤");
    if (enlaceName.trim().length < 3) e.push("Enlace mínimo 3 caracteres 👤");

    if (!seccion.trim()) e.push("Sección requerida 🧷");
    if (!selectedSection) e.push("Sección no encontrada en catálogo ⚠️");

    if (!municipio.trim()) e.push("Municipio no resuelto desde backend 🏙️");
    if (!distritoLocal.trim()) e.push("Distrito Local no resuelto desde backend 🗳️");
    if (!distritoFederal.trim()) e.push("Distrito Federal no resuelto desde backend 🗳️");

    if (address.trim().length < 5) e.push("Dirección mínimo 5 caracteres 🏠");

    if (!gps || String(gps).split(",").length !== 2) e.push("GPS inválido (lat,lng) 📍");
    if (gpsPoint.lat === 0 && gpsPoint.lng === 0) e.push("GPS inválido (0,0) 📍");

    return e;
  }, [
    dateISO,
    sede,
    organizerName,
    enlaceName,
    seccion,
    selectedSection,
    municipio,
    distritoLocal,
    distritoFederal,
    address,
    gps,
    gpsPoint.lat,
    gpsPoint.lng,
  ]);

  const canSubmit = errors.length === 0 && !submitting && !sectionsLoading;

  const handleSectionChange = async (newValue: SectionCatalogItem | null) => {
    if (!newValue) {
      setSeccion("");
      setMunicipio("");
      setDistritoLocal("");
      setDistritoFederal("");
      return;
    }

    setSeccion(String(newValue.IdSeccion));

    try {
      const found = await findSectionById(newValue.IdSeccion);

      if (!found) {
        setMunicipio("");
        setDistritoLocal("");
        setDistritoFederal("");
        setSectionError("Sección no encontrada ❌");
        return;
      }

      setSectionError(null);
      setMunicipio(found.Municipio || "");
      setDistritoLocal(String(found.IdDistritoLocal ?? ""));
      setDistritoFederal(String(found.IdDistritoFederal ?? ""));
    } catch (err: any) {
      setMunicipio("");
      setDistritoLocal("");
      setDistritoFederal("");
      setSectionError(err?.message || "No se pudo resolver la sección ❌");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

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
        Captura los datos principales. La sección autocompleta municipio y distritos desde backend 🔄
      </Typography>

      {sectionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sectionError}
        </Alert>
      ) : null}

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
            placeholder="Nombre completo"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
          />
        </Grid>

        {/* 👤 Enlace */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Enlace"
            placeholder="Nombre completo"
            value={enlaceName}
            onChange={(e) => setEnlaceName(e.target.value)}
          />
        </Grid>

        {/* =========================================================
         * 🔢 ORDEN CORRECTO SOLICITADO
         * 1. Sección
         * 2. Municipio
         * 3. Distrito Local
         * 4. Distrito Federal
         * ========================================================= */}

        {/* 🧷 Sección */}
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={sections}
            loading={sectionsLoading}
            value={selectedSection}
            onChange={(_, newValue) => {
              void handleSectionChange(newValue);
            }}
            inputValue={sectionInputText}
            onInputChange={(_, newInputValue) => {
              setSectionInputText(newInputValue);
            }}
            getOptionLabel={(option) => String(option.IdSeccion)}
            isOptionEqualToValue={(option, value) =>
              String(option.IdSeccion) === String(value.IdSeccion)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sección"
                placeholder="Selecciona sección"
                helperText="Campo principal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {sectionsLoading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 🏙️ Municipio */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Municipio"
            value={municipio}
            disabled
            placeholder="Autorrellenado"
            helperText="Se llena automáticamente"
          />
        </Grid>

        {/* 🗳️ Distrito Local */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Distrito Local"
            value={distritoLocal}
            disabled
            placeholder="Autorrellenado"
            helperText="Se llena automáticamente"
          />
        </Grid>

        {/* 🗳️ Distrito Federal */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Distrito Federal"
            value={distritoFederal}
            disabled
            placeholder="Autorrellenado"
            helperText="Se llena automáticamente"
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

        {/* 🗺️ GPS */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Ubicación GPS 📍</Typography>
          <LocationMap value={gps} onChange={setGps} />
        </Grid>

        {/* ⚠️ errores */}
        {errors.length > 0 ? (
          <Grid item xs={12}>
            <Alert severity="warning">
              <strong>Faltan campos o datos resueltos:</strong>
              <br />
              {errors.join(" · ")}
            </Alert>
          </Grid>
        ) : null}

        {/* ✅ submit */}
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
            💡 La reunión se guarda en backend antes de permitir avanzar de fase.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
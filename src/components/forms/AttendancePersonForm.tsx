// src/components/forms/AttendancePersonForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import BadgeIcon from "@mui/icons-material/Badge";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { toast } from "react-toastify";

import type {
  AttendanceCaptureMode,
  AttendancePersonPayload,
  AttendancePersonRow,
  AttendancePersonType,
} from "../../models/attendance";
import type { SectionCatalogItem } from "../../services/catalogs.service";
import { getSections } from "../../services/catalogs.service";
import { scanIneAndSplit } from "../../services/ocr.service";
import {
  getAgeFromCurp,
  isCitizenAdultFromCurp,
  isMinor17FromCurp,
  isValidClaveElector,
  isValidCurp,
  isValidPhone,
  isValidPostalCode,
  normalizeCurp,
} from "../../utils/validators";
import OcrScannerOverlay from "../ui/OcrScannerOverlay";

type Props = {
  agendaId: string;
  currentList: AttendancePersonRow[];
  editingPerson?: AttendancePersonRow | null;
  onCreate: (payload: AttendancePersonPayload) => Promise<void>;
  onUpdate: (idListado: number, payload: AttendancePersonPayload) => Promise<void>;
  onCancelEdit?: () => void;
  readOnly?: boolean;
};

type FormState = AttendancePersonPayload;

const EMPTY_FORM: FormState = {
  ClaveElector: "",
  CURP: "",
  PrimerApellido: "",
  SegundoApellido: "",
  Nombre: "",
  IdSeccion: 0,
  Sexo: "H",
  FechaNacimiento: "",
  Domicilio: "",
  Colonia: "",
  CodigoPostal: "",
  Telefono: "",
};

export default function AttendancePersonForm({
  agendaId,
  currentList,
  editingPerson,
  onCreate,
  onUpdate,
  onCancelEdit,
  readOnly = false,
}: Props) {
  const [personType, setPersonType] = useState<AttendancePersonType>("CIUDADANO");
  const [captureMode, setCaptureMode] = useState<AttendanceCaptureMode>("MANUAL");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [sections, setSections] = useState<SectionCatalogItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setSectionsLoading(true);
        const rows = await getSections();
        if (!alive) return;
        setSections(rows);
      } catch (err: any) {
        toast.error(err?.message || "❌ No se pudo cargar catálogo de secciones");
      } finally {
        if (!alive) return;
        setSectionsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ocrFile) {
      setOcrPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(ocrFile);
    setOcrPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [ocrFile]);

  useEffect(() => {
    if (!editingPerson) return;

    const isMinor = Number(editingPerson.EsMenor) === 1 || !editingPerson.ClaveElector;

    setPersonType(isMinor ? "MENOR_17" : "CIUDADANO");
    setCaptureMode("MANUAL");
    setOcrFile(null);
    setOcrWarning(null);

    setForm({
      ClaveElector: editingPerson.ClaveElector || "",
      CURP: editingPerson.CURP || "",
      PrimerApellido: editingPerson.PrimerApellido || "",
      SegundoApellido: editingPerson.SegundoApellido || "",
      Nombre: editingPerson.Nombre || "",
      IdSeccion: Number(editingPerson.IdSeccion || 0),
      Sexo: editingPerson.Sexo || "H",
      FechaNacimiento: String(editingPerson.FechaNacimiento || "").slice(0, 10),
      Domicilio: editingPerson.Domicilio || "",
      Colonia: editingPerson.Colonia || "",
      CodigoPostal: String(editingPerson.CodigoPostal || ""),
      Telefono: editingPerson.Telefono || "",
    });
  }, [editingPerson]);

  const selectedSection = useMemo(() => {
    return sections.find((s) => Number(s.IdSeccion) === Number(form.IdSeccion)) ?? null;
  }, [sections, form.IdSeccion]);

  const ageFromCurp = useMemo(() => getAgeFromCurp(form.CURP), [form.CURP]);

  const duplicateError = useMemo(() => {
    const curp = normalizeCurp(form.CURP);
    const clave = String(form.ClaveElector || "").trim();

    return currentList.find((row) => {
      if (editingPerson && Number(row.IdListado) === Number(editingPerson.IdListado)) {
        return false;
      }

      if (clave && row.ClaveElector && row.ClaveElector === clave) return true;
      if (curp && normalizeCurp(row.CURP) === curp) return true;

      return false;
    })
      ? "Ya existe una persona con esa Clave de Elector o CURP 🚫"
      : null;
  }, [currentList, editingPerson, form.CURP, form.ClaveElector]);

  const errors = useMemo(() => {
    const list: string[] = [];

    if (!form.Nombre.trim()) list.push("Nombre requerido");
    if (!form.PrimerApellido.trim()) list.push("Primer apellido requerido");
    if (!form.CURP.trim() || !isValidCurp(form.CURP)) list.push("CURP inválida");
    if (!form.IdSeccion) list.push("Sección requerida");
    if (!form.Sexo) list.push("Sexo requerido");
    if (!form.FechaNacimiento) list.push("Fecha de nacimiento requerida");
    if (!form.Domicilio.trim()) list.push("Domicilio requerido");
    if (!form.Colonia.trim()) list.push("Colonia requerida");
    if (!isValidPostalCode(form.CodigoPostal)) list.push("Código Postal inválido");
    if (!isValidPhone(form.Telefono)) list.push("Teléfono inválido");

    if (personType === "MENOR_17") {
      if (!isMinor17FromCurp(form.CURP)) {
        list.push("La CURP no corresponde a una persona de 17 años");
      }
    }

    if (personType === "CIUDADANO") {
      if (!isCitizenAdultFromCurp(form.CURP)) {
        list.push("La CURP no corresponde a un ciudadano mayor o igual a 18 años");
      }
      if (!isValidClaveElector(form.ClaveElector)) {
        list.push("Clave de Elector inválida");
      }
    }

    if (duplicateError) list.push(duplicateError);

    return list;
  }, [form, personType, duplicateError]);

  const canSave = errors.length === 0 && !saving && !sectionsLoading && !readOnly;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setOcrFile(null);
    setCaptureMode("MANUAL");
    setPersonType("CIUDADANO");
    setOcrWarning(null);
  };

  const patchForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleScanOcr = async () => {
    if (!ocrFile) {
      toast.warning("⚠️ Selecciona una imagen INE antes de escanear");
      return;
    }

    try {
      setOcrLoading(true);
      setOcrWarning(null);

      const result = await scanIneAndSplit(ocrFile);

      setForm((prev) => ({
        ...prev,
        ...result.mapped,
        CURP: normalizeCurp(result.mapped.CURP),
      }));

      setOcrWarning(
        result.warningMessage ||
          "⚠️ Verifica todos los datos antes de guardar. El OCR puede contener errores."
      );

      if (result.splitUsed) {
        toast.success("✅ OCR procesado correctamente. Verifica los datos antes de guardar.");
      } else {
        toast.warning(
          "⚠️ El OCR solo pudo rellenar parcialmente algunos campos. Verifica y corrige."
        );
      }
    } catch (err: any) {
      setOcrWarning(
        "⚠️ No se pudo completar el OCR correctamente. Revisa la imagen e intenta completar manualmente."
      );
      toast.error(err?.message || "❌ No se pudo procesar OCR");
    } finally {
      setOcrLoading(false);
    }
  };

  const buildPayload = (): AttendancePersonPayload => {
    return {
      ClaveElector: personType === "MENOR_17" ? "" : String(form.ClaveElector || "").trim(),
      CURP: normalizeCurp(form.CURP),
      PrimerApellido: form.PrimerApellido.trim(),
      SegundoApellido: form.SegundoApellido.trim(),
      Nombre: form.Nombre.trim(),
      IdSeccion: Number(form.IdSeccion),
      Sexo: form.Sexo,
      FechaNacimiento: form.FechaNacimiento,
      Domicilio: form.Domicilio.trim(),
      Colonia: form.Colonia.trim(),
      CodigoPostal: String(form.CodigoPostal).trim(),
      Telefono: String(form.Telefono).trim(),
    };
  };

  const handleSave = async () => {
    if (!canSave) {
      toast.warning("⚠️ Revisa el formulario antes de continuar");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      if (editingPerson) {
        await onUpdate(editingPerson.IdListado, payload);
        toast.success("✅ Persona actualizada correctamente");
      } else {
        await onCreate(payload);
        toast.success("✅ Persona agregada correctamente");
      }

      resetForm();
      onCancelEdit?.();
    } catch (err: any) {
      toast.error(err?.message || "❌ No se pudo guardar la persona");
    } finally {
      setSaving(false);
    }
  };

  return (
  <>
    <Card>
      <CardContent
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BadgeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Fase 3 · Alta de asistencia 👥
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Captura una persona por vez. Puedes alternar entre menor de 17 años y ciudadano, con captura manual u OCR.
          </Typography>

          {readOnly ? (
            <Alert severity="info" icon={<VisibilityIcon />}>
              La agenda está completada ✅. El formulario de captura se muestra en modo solo lectura.
            </Alert>
          ) : null}

          {!readOnly ? (
            <>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Box>
                  <Typography sx={{ fontWeight: 900, mb: 0.8 }}>Tipo de persona</Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={personType}
                    onChange={(_, value) => {
                      if (!value) return;
                      setPersonType(value);
                      if (value === "MENOR_17") setCaptureMode("MANUAL");
                    }}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="MENOR_17">17 años 👦</ToggleButton>
                    <ToggleButton value="CIUDADANO">Ciudadano 👤</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 900, mb: 0.8 }}>Modo de captura</Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={captureMode}
                    onChange={(_, value) => {
                      if (!value) return;
                      setCaptureMode(value);
                    }}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="MANUAL">Manual ✍️</ToggleButton>
                    <ToggleButton value="OCR" disabled={personType === "MENOR_17"}>
                      OCR INE 📸
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Stack>

              {personType === "CIUDADANO" && captureMode === "OCR" ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(108,56,65,0.05)",
                    border: "1px solid rgba(108,56,65,0.15)",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Escaneo de INE con OCR 🧠📸
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                      {ocrFile ? "Reemplazar INE" : "Subir INE"}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setOcrFile(f);
                        }}
                      />
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<AutoFixHighIcon />}
                      onClick={handleScanOcr}
                      disabled={!ocrFile || ocrLoading}
                    >
                      {ocrLoading ? "Escaneando... ⏳" : "Escanear OCR"}
                    </Button>
                  </Stack>

                  {ocrFile ? (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Archivo cargado: <strong>{ocrFile.name}</strong>
                    </Typography>
                  ) : null}

                  {ocrPreviewUrl ? (
                    <Box
                      sx={{
                        mt: 2,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.10)",
                        bgcolor: "#fff",
                      }}
                    >
                      <img
                        src={ocrPreviewUrl}
                        alt="Previsualización INE"
                        style={{
                          width: "100%",
                          maxHeight: 340,
                          objectFit: "contain",
                          display: "block",
                          background: "#fff",
                        }}
                      />
                    </Box>
                  ) : null}

                  <Alert
                    severity="warning"
                    icon={<WarningAmberIcon />}
                    sx={{ mt: 2 }}
                  >
                    {ocrWarning ||
                      "⚠️ Siempre verifica los datos antes de guardar. El OCR puede no identificar correctamente algunos campos."}
                  </Alert>
                </Box>
              ) : null}
            </>
          ) : null}

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre(s)"
                value={form.Nombre}
                disabled={readOnly}
                onChange={(e) => patchForm({ Nombre: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Primer Apellido"
                value={form.PrimerApellido}
                disabled={readOnly}
                onChange={(e) => patchForm({ PrimerApellido: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Segundo Apellido"
                value={form.SegundoApellido}
                disabled={readOnly}
                onChange={(e) => patchForm({ SegundoApellido: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="CURP"
                value={form.CURP}
                disabled={readOnly}
                onChange={(e) => patchForm({ CURP: normalizeCurp(e.target.value) })}
                inputProps={{ maxLength: 18 }}
              />
              {ageFromCurp !== null ? (
                <Typography variant="caption" color="text.secondary">
                  Edad detectada por CURP: <strong>{ageFromCurp}</strong>
                </Typography>
              ) : null}
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Clave de Elector"
                value={personType === "MENOR_17" ? "" : form.ClaveElector}
                disabled={readOnly || personType === "MENOR_17"}
                placeholder={personType === "MENOR_17" ? "No aplica para menor" : "Ej: ABC123456"}
                onChange={(e) => patchForm({ ClaveElector: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Sexo"
                value={form.Sexo}
                disabled={readOnly}
                onChange={(e) => patchForm({ Sexo: e.target.value as "H" | "M" })}
              >
                <MenuItem value="H">Hombre (H)</MenuItem>
                <MenuItem value="M">Mujer (M)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Fecha de nacimiento"
                type="date"
                value={form.FechaNacimiento}
                disabled={readOnly}
                onChange={(e) => patchForm({ FechaNacimiento: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Autocomplete
                options={sections}
                loading={sectionsLoading}
                value={selectedSection}
                disabled={readOnly}
                onChange={(_, value) => {
                  patchForm({ IdSeccion: value ? Number(value.IdSeccion) : 0 });
                }}
                getOptionLabel={(option) => `${option.IdSeccion} - ${option.Municipio}`}
                isOptionEqualToValue={(option, value) =>
                  Number(option.IdSeccion) === Number(value.IdSeccion)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Sección" placeholder="Selecciona sección" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Domicilio"
                value={form.Domicilio}
                disabled={readOnly}
                onChange={(e) => patchForm({ Domicilio: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Colonia"
                value={form.Colonia}
                disabled={readOnly}
                onChange={(e) => patchForm({ Colonia: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Código Postal"
                value={form.CodigoPostal}
                disabled={readOnly}
                onChange={(e) => patchForm({ CodigoPostal: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Teléfono"
                value={form.Telefono}
                disabled={readOnly}
                onChange={(e) => patchForm({ Telefono: e.target.value })}
              />
            </Grid>
          </Grid>

          {!readOnly && errors.length > 0 ? (
            <Alert severity="warning">
              <strong>Revisa estos puntos:</strong>
              <br />
              {errors.join(" · ")}
            </Alert>
          ) : null}

          {!readOnly ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={() => {
                  resetForm();
                  onCancelEdit?.();
                }}
              >
                Reiniciar
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!canSave}
              >
                {saving
                  ? "Guardando... ⏳"
                  : editingPerson
                  ? "Guardar cambios ✏️"
                  : "Agregar persona ✅"}
              </Button>
            </Stack>
          ) : null}

          <Typography variant="caption" color="text.secondary">
            Agenda actual: <strong>{agendaId}</strong>
            {!readOnly ? " · Después de guardar, el formulario se reinicia para capturar otra persona." : ""}
          </Typography>
        </Stack>
      </CardContent>
    </Card>

    <OcrScannerOverlay
      open={ocrLoading}
      title="Escaneando INE..."
      subtitle="Leyendo datos y separando nombres con OCR 🧠📇"
    />
  </>
  );
}
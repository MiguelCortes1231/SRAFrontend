// src/components/attendance/AttendanceList.tsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { AttendancePersonRow } from "../../models/attendance";

type Props = {
  rows: AttendancePersonRow[];
  onEdit: (row: AttendancePersonRow) => void;
  onDelete: (row: AttendancePersonRow) => void;
  readOnly?: boolean;
};

export default function AttendanceList({
  rows,
  onEdit,
  onDelete,
  readOnly = false,
}: Props) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Aún no hay personas registradas en esta agenda 🫙
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={1.2}>
      {rows.map((row) => (
        <Card key={row.IdListado}>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {row.Nombre} {row.PrimerApellido} {row.SegundoApellido}
                  </Typography>
                  <Chip
                    size="small"
                    label={Number(row.EsMenor) === 1 ? "17 años 👦" : "Ciudadano 👤"}
                    color={Number(row.EsMenor) === 1 ? "warning" : "primary"}
                    variant="outlined"
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  CURP: <strong>{row.CURP}</strong>
                </Typography>

                {row.ClaveElector ? (
                  <Typography variant="body2" color="text.secondary">
                    Clave Elector: <strong>{row.ClaveElector}</strong>
                  </Typography>
                ) : null}

                <Typography variant="body2" color="text.secondary">
                  Sección: <strong>{row.IdSeccion}</strong> · Sexo: <strong>{row.Sexo}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Fecha Nacimiento: <strong>{row.FechaNacimiento}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {row.Domicilio}, {row.Colonia}, CP {row.CodigoPostal}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Teléfono: <strong>{row.Telefono}</strong>
                </Typography>
              </Box>

              {!readOnly ? (
                <Stack direction="row" spacing={1}>
                  <IconButton color="primary" onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton color="error" onClick={() => onDelete(row)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
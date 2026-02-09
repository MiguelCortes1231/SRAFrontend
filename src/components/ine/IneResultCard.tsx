// src/components/ine/IneResultCard.tsx
/**
 * 📦 IneResultCard
 * -----------------------------------------
 * Muestra resultado OCR en formato legible:
 * - Tarjeta con campos principales
 * - JSON raw al final (para debugging) 🧪
 */

import React from "react";
import { Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import type { IneScanResponse } from "../../services/ine.service";

type Props = {
  result: IneScanResponse;
};

export default function IneResultCard({ result }: Props) {
  const d = result.data;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Resultado OCR 🪪
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {result.message}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900 }}>Nombre</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.nombre}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900 }}>CURP</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.curp}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 900 }}>Tipo credencial</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.tipo_credencial} · {d.es_ine ? "INE" : "IFE"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 900 }}>Clave elector</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.clave_elector}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography sx={{ fontWeight: 900 }}>Sección</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.seccion}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900 }}>Dirección</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.calle} {d.numero}, {d.colonia}, CP {d.codigo_postal}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900 }}>Ubicación</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.estado} {d.municipio ? `· ${d.municipio}` : ""} · {d.pais}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        {/* 🧪 JSON raw */}
        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>
          JSON (debug) 🧪
        </Typography>
        <Box
          sx={{
            p: 1.2,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.04)",
            fontFamily: "monospace",
            fontSize: 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </Box>
      </CardContent>
    </Card>
  );
}

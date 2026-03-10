// src/components/maps/ReadOnlyMeetingMap.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// ✅ Fix íconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  lat: number;
  lng: number;
  address?: string;
  height?: number;
};

export default function ReadOnlyMeetingMap({
  lat,
  lng,
  address,
  height = 320,
}: Props) {
  const valid = Number.isFinite(lat) && Number.isFinite(lng);

  if (!valid) {
    return (
      <Box
        sx={{
          height,
          display: "grid",
          placeItems: "center",
          borderRadius: 3,
          border: "1px dashed rgba(0,0,0,0.15)",
          bgcolor: "rgba(0,0,0,0.03)",
          p: 2,
        }}
      >
        <Typography color="text.secondary">
          No hay coordenadas disponibles 🫙
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: "100%", height }}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>

      <Box sx={{ p: 1.2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Coordenadas: {lat}, {lng}
        </Typography>
        {address ? (
          <Typography variant="caption" color="text.secondary">
            {address}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
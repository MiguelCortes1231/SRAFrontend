// src/components/maps/LocationMap.tsx
/**
 * 🗺️ LocationMap PRO
 * - Click en mapa: mueve pin 📍
 * - Pin draggable: arrastrar y soltar 🧲
 * - Inputs lat/lng: editar manualmente ✍️
 * - Buscador OSM (Nominatim) 🔎
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";

import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_POSITION = { lat: 18.5001, lng: -88.2961 };

function MapController({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.setView(position, map.getZoom() ?? 15, { animate: true });
  }, [position, map]);
  return null;
}

function ClickToMove({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

type Props = {
  value?: string; // "lat,lng"
  onChange?: (val: string) => void;
};

function parseValue(val?: string) {
  if (!val) return DEFAULT_POSITION;
  const parts = String(val).split(",");
  if (parts.length !== 2) return DEFAULT_POSITION;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return DEFAULT_POSITION;
  return { lat, lng };
}

export default function LocationMap({ value, onChange }: Props) {
  const [position, setPosition] = useState(() => parseValue(value));
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);

  // ✅ inputs controlados
  const [latInput, setLatInput] = useState(String(position.lat));
  const [lngInput, setLngInput] = useState(String(position.lng));

  // 🔁 sincroniza si value cambia desde afuera
  useEffect(() => {
    const p = parseValue(value);
    setPosition(p);
    setLatInput(String(p.lat));
    setLngInput(String(p.lng));
  }, [value]);

  const emit = (p: { lat: number; lng: number }) => {
    setPosition(p);
    setLatInput(String(p.lat));
    setLngInput(String(p.lng));
    onChange?.(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`);
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      setSearching(true);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchText
      )}&limit=1`;

      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          emit({ lat, lng });
          return;
        }
      }

      alert("No se encontraron resultados para esa búsqueda 😕");
    } catch (err) {
      console.error(err);
      alert("Error al buscar la dirección 🌐");
    } finally {
      setSearching(false);
    }
  };

  const applyLatLngFromInputs = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Lat/Lng inválidos ❌");
      return;
    }
    emit({ lat, lng });
  };

  return (
    <Box>
      {/* 🔎 Buscador */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
        <TextField
          label="Buscar dirección"
          placeholder="Colonia, ciudad, calle..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={searching || !searchText.trim()}
          sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
        >
          {searching ? "Buscando... ⏳" : "Buscar 🔎"}
        </Button>
      </Stack>

      {/* 🧭 Inputs lat/lng */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
        <TextField
          label="Latitud"
          value={latInput}
          onChange={(e) => setLatInput(e.target.value)}
          placeholder="Ej: 18.500100"
        />
        <TextField
          label="Longitud"
          value={lngInput}
          onChange={(e) => setLngInput(e.target.value)}
          placeholder="Ej: -88.296100"
        />
        <Button
          variant="outlined"
          onClick={applyLatLngFromInputs}
          sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
        >
          Aplicar 📍
        </Button>
      </Stack>

      {/* 🗺️ Mapa */}
      <Box
        sx={{
          width: "100%",
          height: 300,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.10)",
        }}
      >
        <MapContainer center={position} zoom={14} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController position={position} />
          <ClickToMove onPick={emit} />

          {/* 📍 Marker draggable */}
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target;
                const p = m.getLatLng();
                emit({ lat: p.lat, lng: p.lng });
              },
            }}
          />
        </MapContainer>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        <PlaceIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
        Click en mapa o arrastra el pin. También puedes editar lat/lng manualmente.
      </Typography>
    </Box>
  );
}

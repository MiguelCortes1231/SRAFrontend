// src/components/evidence/ProtectedImage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getProtectedImageBlobUrl } from "../../services/evidence.service";

type Props = {
  filePath?: string | null;
  alt?: string;
  height?: number;
};

export default function ProtectedImage({
  filePath,
  alt = "Imagen protegida",
  height = 220,
}: Props) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 👀 Lazy load
  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "150px",
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [shouldLoad]);

  // 📥 Carga real
  useEffect(() => {
    let active = true;

    async function loadImage() {
      if (!filePath || !shouldLoad) return;

      try {
        setLoading(true);
        setErrorText(null);

        const url = await getProtectedImageBlobUrl(filePath);

        if (!active) return;
        setBlobUrl(url);
      } catch (err: any) {
        if (!active) return;

        const status = err?.response?.status;

        if (status === 404) {
          setErrorText("No se encontró la imagen actual 🚫");
        } else if (status === 429) {
          setErrorText("El servidor limitó temporalmente la carga de imágenes ⏳");
        } else {
          setErrorText("No se pudo cargar la imagen actual ❌");
        }
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadImage();

    return () => {
      active = false;
    };
  }, [filePath, shouldLoad]);

  if (!filePath) {
    return (
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height,
          borderRadius: 3,
          border: "1px dashed rgba(0,0,0,0.15)",
          bgcolor: "rgba(0,0,0,0.03)",
          display: "grid",
          placeItems: "center",
          p: 2,
        }}
      >
        <Typography color="text.secondary" align="center">
          Aún no hay imagen 🫙
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
        display: "grid",
        placeItems: "center",
      }}
    >
      {!shouldLoad ? (
        <Typography color="text.secondary" variant="body2">
          Esperando carga de imagen 👀
        </Typography>
      ) : loading ? (
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Cargando imagen...
          </Typography>
        </Box>
      ) : errorText ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(220,38,38,0.04)",
            p: 2,
          }}
        >
          <Typography align="center" color="error">
            {errorText}
          </Typography>
        </Box>
      ) : blobUrl ? (
        <img
          src={blobUrl}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            background: "#fff",
          }}
        />
      ) : (
        <Typography color="text.secondary">Sin imagen</Typography>
      )}
    </Box>
  );
}
// src/components/evidence/ProtectedImage.tsx
/**
 * 🖼️ ProtectedImage
 * -----------------------------------------
 * Carga imagen protegida vía API + Authorization header
 * y la muestra como blob URL.
 */

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { getProtectedImageBlobUrl } from "../../services/evidence.service";

type Props = {
  filePath?: string | null;
  alt: string;
  height?: number;
};

export default function ProtectedImage({ filePath, alt, height = 220 }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(filePath));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let currentBlobUrl: string | null = null;

    (async () => {
      if (!filePath) {
        setLoading(false);
        setBlobUrl(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const url = await getProtectedImageBlobUrl(filePath);
        if (!mounted) return;

        currentBlobUrl = url;
        setBlobUrl(url);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "No se pudo cargar la imagen ❌");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [filePath]);

  if (!filePath) {
    return (
      <Box
        sx={{
          height,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          border: "1px dashed rgba(0,0,0,0.16)",
          bgcolor: "rgba(0,0,0,0.03)",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Sin imagen 🫙
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error || !blobUrl) {
    return (
      <Box
        sx={{
          height,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          border: "1px solid rgba(220,38,38,0.20)",
          bgcolor: "rgba(220,38,38,0.05)",
          p: 2,
          textAlign: "center",
        }}
      >
        <Box>
          <BrokenImageIcon color="error" />
          <Typography variant="body2" color="error">
            {error || "No se pudo mostrar la imagen"}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
      }}
    >
      <img
        src={blobUrl}
        alt={alt}
        style={{
          width: "100%",
          height,
          objectFit: "contain",
          display: "block",
          background: "#fff",
        }}
      />
    </Box>
  );
}
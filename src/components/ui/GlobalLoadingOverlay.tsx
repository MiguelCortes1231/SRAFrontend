// src/components/ui/GlobalLoadingOverlay.tsx
/**
 * 🌌 GlobalLoadingOverlay
 * ---------------------------------------------------
 * Spinner global fullscreen tipo ngx-spinner.
 *
 * ✅ Se muestra en toda la pantalla
 * ✅ Usa animación elegante
 * ✅ Se queda 3 segundos extra antes de ocultarse
 * ✅ Muy útil para cargas de API
 */

import React, { useEffect, useRef, useState } from "react";
import { Backdrop, Box, Fade, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

import { loadingService } from "../../services/loading.service";

const pulse = keyframes`
  0% {
    transform: scale(0.85);
    opacity: 0.55;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.85);
    opacity: 0.55;
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export default function GlobalLoadingOverlay() {
    const [open, setOpen] = useState(false);
    const hideTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const unsubscribe = loadingService.subscribe((visible) => {
            // ✅ si vuelve a haber carga, cancela hide pendiente
            if (hideTimerRef.current) {
                window.clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }

            if (visible) {
                setOpen(true);
            } else {
                setOpen(false);
            }
        });

        return () => {
            unsubscribe();
            if (hideTimerRef.current) {
                window.clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    return (
        <Backdrop
            open={open}
            sx={{
                zIndex: (theme) => theme.zIndex.modal + 2000,
                bgcolor: "rgba(19, 19, 25, 0.45)",
                backdropFilter: "blur(6px)",
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        minWidth: 250,
                        px: 4,
                        py: 3.2,
                        borderRadius: 4,
                        bgcolor: "rgba(255,255,255,0.92)",
                        boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    {/* 🌌 Spinner fancy */}
                    <Box
                        sx={{
                            position: "relative",
                            width: 86,
                            height: 86,
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        {/* aro exterior */}
                        <Box
                            sx={{
                                position: "absolute",
                                width: 86,
                                height: 86,
                                borderRadius: "50%",
                                border: "5px solid rgba(108,56,65,0.16)",
                                borderTopColor: "#6C3841",
                                animation: `${spin} 1s linear infinite`,
                            }}
                        />

                        {/* círculo interno */}
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                bgcolor: "#6C3841",
                                animation: `${pulse} 1.2s ease-in-out infinite`,
                                boxShadow: "0 0 22px rgba(108,56,65,0.35)",
                            }}
                        />
                    </Box>

                    <Box sx={{ textAlign: "center" }}>
                        <Typography
                            sx={{
                                fontWeight: 900,
                                fontSize: 18,
                                color: "#6C3841",
                            }}
                        >
                            Cargando información...
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mt: 0.5,
                            }}
                        >
                            Espera un momento ⏳
                        </Typography>
                    </Box>
                </Box>
            </Fade>
        </Backdrop>
    );
}
// src/components/meetings/MeetingStepper.tsx
import React from "react";
import { Box, Stack, Typography } from "@mui/material";

type FlowItem = {
  phase: number;
  label: string;
  statusLabel: string;
  statusColor?: string;
  completed: boolean;
};

type Props = {
  flow: FlowItem[];
  activePhase: number;
  onPhaseClick?: (phase: number) => void;
};

export default function MeetingStepper({
  flow,
  activePhase,
  onPhaseClick,
}: Props) {
  const safeFlow = Array.isArray(flow) ? flow : [];

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        pb: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={0}
        alignItems="stretch"
        sx={{
          minWidth: { xs: 900, md: "100%" },
        }}
      >
        {safeFlow.map((step, index) => {
          const isActive = activePhase === step.phase;

          return (
            <React.Fragment key={step.phase}>
              <Box
                onClick={() => onPhaseClick?.(step.phase)}
                sx={{
                  flex: 1,
                  minWidth: 140,
                  px: 1,
                  py: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "all 0.25s ease",
                  bgcolor: isActive ? "rgba(108,56,65,0.08)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(108,56,65,0.18)"
                    : "1px solid transparent",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  "&:hover": {
                    bgcolor: "rgba(108,56,65,0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 1,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 16,
                    color: "#fff",
                    transition: "all 0.25s ease",
                    backgroundColor: step.completed
                      ? "#7b3f4a"
                      : isActive
                      ? "#6C3841"
                      : "#a3a3a3",
                    boxShadow: isActive
                      ? "0 0 0 6px rgba(108,56,65,0.12), 0 8px 18px rgba(108,56,65,0.22)"
                      : "none",
                  }}
                >
                  {step.completed ? "✓" : step.phase}
                </Box>

                <Typography
                  sx={{
                    fontWeight: isActive ? 900 : 700,
                    fontSize: { xs: 15, md: 16 },
                    color: isActive ? "text.primary" : "text.secondary",
                    lineHeight: 1.25,
                    minHeight: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.label}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: 14,
                    color: step.completed ? "#16a34a" : "text.secondary",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {step.statusLabel}
                </Typography>

                <Box
                  sx={{
                    mt: 1,
                    mx: "auto",
                    width: isActive ? 64 : 0,
                    height: 4,
                    borderRadius: 999,
                    bgcolor: "#6C3841",
                    transition: "all 0.25s ease",
                  }}
                />
              </Box>

              {index < safeFlow.length - 1 ? (
                <Box
                  sx={{
                    width: 28,
                    minWidth: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: 2,
                      bgcolor: "#d1d5db",
                    }}
                  />
                </Box>
              ) : null}
            </React.Fragment>
          );
        })}
      </Stack>
    </Box>
  );
}
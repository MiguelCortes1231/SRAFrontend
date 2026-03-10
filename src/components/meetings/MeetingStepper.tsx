// src/components/meetings/MeetingStepper.tsx
/**
 * 🧭 MeetingStepper
 * -----------------------------------------
 * Muestra fases reales según flow calculado
 * desde getAgenda.
 */

import React, { useMemo } from "react";
import { Step, StepLabel, Stepper } from "@mui/material";
import type { MeetingFlow, MeetingPhase, PhaseStatus } from "../../models/meeting";

type Props = {
  flow: MeetingFlow;
};

function labelForPhase(p: MeetingPhase) {
  switch (p) {
    case 1:
      return "Fase 1 · Alta 🧾";
    case 2:
      return "Fase 2 · Inicial 📸";
    case 3:
      return "Fase 3 · Asistencias 👥";
    case 4:
      return "Fase 4 · Foto grupal 📷";
    case 5:
      return "Fase 5 · Final 📸";
    case 6:
      return "Fase 6 · Comparación ✅";
    default:
      return `Fase ${p}`;
  }
}

function optionalText(status: PhaseStatus) {
  if (status === "COMPLETADA") {
    return <span style={{ fontSize: 11, color: "#16a34a" }}>Completa ✅</span>;
  }

  if (status === "OBSERVADA") {
    return <span style={{ fontSize: 11, color: "#b91c1c" }}>Cancelada / Observada ⚠️</span>;
  }

  if (status === "EN_PROGRESO") {
    return <span style={{ fontSize: 11, color: "#6C3841" }}>En progreso</span>;
  }

  return <span style={{ fontSize: 11, color: "#6b7280" }}>Pendiente</span>;
}

export default function MeetingStepper({ flow }: Props) {
  const phases: MeetingPhase[] = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const activeIndex = useMemo(() => {
    const idx = phases.findIndex((p) => flow[p] !== "COMPLETADA");
    return idx === -1 ? phases.length - 1 : idx;
  }, [flow, phases]);

  return (
    <Stepper activeStep={activeIndex} alternativeLabel>
      {phases.map((p) => (
        <Step key={p} completed={flow[p] === "COMPLETADA"}>
          <StepLabel optional={optionalText(flow[p])}>{labelForPhase(p)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
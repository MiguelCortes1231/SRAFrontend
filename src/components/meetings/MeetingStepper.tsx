// src/components/meetings/MeetingStepper.tsx
/**
 * 🧭 MeetingStepper
 * -----------------------------------------
 * Stepper visual para el flujo de fases (1..6)
 * - Muestra estado por fase ✅⚠️⏳
 * - Súper entendible para el usuario final
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
      return "Fase 2 · Evidencia Inicial 📸";
    case 3:
      return "Fase 3 · Asistencias 👥";
    case 4:
      return "Fase 4 · Foto Grupal 📷";
    case 5:
      return "Fase 5 · Evidencia Final 📸";
    case 6:
      return "Fase 6 · Comparar 🧪";
    default:
      return `Fase ${p}`;
  }
}

function stepState(status: PhaseStatus) {
  // 🧠 Stepper de MUI maneja active/completed, pero nosotros mapeamos estado:
  if (status === "COMPLETADA") return { completed: true, active: false };
  if (status === "EN_PROGRESO") return { completed: false, active: true };
  if (status === "OBSERVADA") return { completed: false, active: true }; // ⚠️ resaltado
  return { completed: false, active: false }; // PENDIENTE
}

export default function MeetingStepper({ flow }: Props) {
  const phases: MeetingPhase[] = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  // 🔎 fase “actual” = primera no completada, o la última si todo está listo
  const activeIndex = useMemo(() => {
    const idx = phases.findIndex((p) => flow[p] !== "COMPLETADA");
    return idx === -1 ? phases.length - 1 : idx;
  }, [flow, phases]);

  return (
    <Stepper activeStep={activeIndex} alternativeLabel>
      {phases.map((p) => {
        const s = flow[p];
        const st = stepState(s);

        return (
          <Step key={p} completed={st.completed}>
            <StepLabel
              optional={
                s === "OBSERVADA" ? (
                  <span style={{ fontSize: 11, color: "#b45309" }}>Observada ⚠️</span>
                ) : s === "PENDIENTE" ? (
                  <span style={{ fontSize: 11, color: "#6b7280" }}>Pendiente</span>
                ) : s === "EN_PROGRESO" ? (
                  <span style={{ fontSize: 11, color: "#6C3841" }}>En progreso</span>
                ) : (
                  <span style={{ fontSize: 11, color: "#16a34a" }}>Completa ✅</span>
                )
              }
            >
              {labelForPhase(p)}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

// src/utils/validators.ts
/**
 * ✅ Validators
 * -----------------------------------------
 * Aquí viven todas las validaciones importantes:
 * - CURP válida (formato) 🇲🇽
 * - Edad mínima (>= 17) 🧒✅
 */

/**
 * 🇲🇽 Regex CURP (formato general)
 * Nota: La CURP real tiene reglas adicionales (estado, fecha válida, dígito verificador).
 * Para UI + mocks, el formato es suficiente; mañana lo endurecemos si el cliente lo pide. 🔧
 */
const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

/** 🔠 Normaliza CURP */
export function normalizeCurp(curp: string): string {
  return String(curp ?? "").trim().toUpperCase();
}

/** ✅ Valida CURP */
export function isValidCurp(curp: string): boolean {
  const c = normalizeCurp(curp);
  return CURP_REGEX.test(c);
}

/** ✅ Valida edad mínima */
export function isAgeAllowed(age: number, min = 17): boolean {
  if (typeof age !== "number" || Number.isNaN(age)) return false;
  return age >= min;
}

/** 🧪 Devuelve mensaje de error (útil para formularios) */
export function validateMinorPayload(input: {
  curp: string;
  edad: number;
}): string | null {
  if (!isValidCurp(input.curp)) return "CURP inválida ❌";
  if (!isAgeAllowed(input.edad, 17)) return "Edad no permitida (mínimo 17) ⚠️";
  return null;
}

// src/utils/validators.ts
/**
 * ✅ Validators
 * -----------------------------------------
 * - CURP formato 🇲🇽
 * - Edad derivada desde CURP 🧠
 * - Ciudadano >= 18
 * - Menor exactamente 17
 */

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

export function normalizeCurp(curp: string): string {
  return String(curp ?? "").trim().toUpperCase();
}

export function isValidCurp(curp: string): boolean {
  return CURP_REGEX.test(normalizeCurp(curp));
}

/** 📅 Convierte DD/MM/YYYY -> YYYY-MM-DD */
export function ddmmyyyyToIso(dateStr: string): string {
  const raw = String(dateStr || "").trim();
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** 📅 Edad desde fecha ISO */
export function calculateAgeFromDate(isoDate: string): number | null {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();

  const hasNotHadBirthdayYet =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());

  if (hasNotHadBirthdayYet) age -= 1;

  return age;
}

/** 🧠 Fecha nacimiento desde CURP */
export function getBirthDateFromCurp(curp: string): string | null {
  const c = normalizeCurp(curp);
  if (!isValidCurp(c)) return null;

  const yy = Number(c.slice(4, 6));
  const mm = Number(c.slice(6, 8));
  const dd = Number(c.slice(8, 10));

  const currentYY = Number(String(new Date().getFullYear()).slice(-2));
  const fullYear = yy <= currentYY ? 2000 + yy : 1900 + yy;

  const iso = `${fullYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return null;
  return iso;
}

/** 🎂 Edad desde CURP */
export function getAgeFromCurp(curp: string): number | null {
  const birth = getBirthDateFromCurp(curp);
  if (!birth) return null;
  return calculateAgeFromDate(birth);
}

export function isMinor17FromCurp(curp: string): boolean {
  const age = getAgeFromCurp(curp);
  return age === 17;
}

export function isCitizenAdultFromCurp(curp: string): boolean {
  const age = getAgeFromCurp(curp);
  return age !== null && age >= 18;
}

/** 🔐 Clave de elector básica */
export function isValidClaveElector(value: string): boolean {
  return String(value ?? "").trim().length >= 8;
}

/** 📞 Teléfono mexicano simple */
export function isValidPhone(value: string): boolean {
  return /^\d{10}$/.test(String(value ?? "").trim());
}

/** 📮 CP simple */
export function isValidPostalCode(value: string): boolean {
  return /^\d{5}$/.test(String(value ?? "").trim());
}
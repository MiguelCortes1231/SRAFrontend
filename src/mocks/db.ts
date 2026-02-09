// src/mocks/db.ts
/**
 * 🧠 Mock DB (localStorage-backed)
 * -----------------------------------------
 * - “Base de datos” en memoria con persistencia opcional 🧪
 * - Ideal para mocks hoy (sin API) ✅
 * - Mañana se reemplaza por endpoints reales 🔁
 */

import type { Meeting } from "../models/meeting";

const DB_KEY = "reuniones_auditoria_mock_db_v1";

/** 🧾 Estructura de nuestra DB mock */
export type MockDB = {
  meetings: Meeting[];
};

/** 🏗️ Estado en memoria */
let memoryDB: MockDB | null = null;

/** 🔧 DB inicial */
function createEmptyDB(): MockDB {
  return { meetings: [] };
}

/** 📥 Carga desde localStorage */
export function loadDB(): MockDB {
  if (memoryDB) return memoryDB;

  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      memoryDB = createEmptyDB();
      return memoryDB;
    }
    const parsed = JSON.parse(raw) as MockDB;
    // 🧯 Hardening mínimo
    memoryDB = {
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
    };
    return memoryDB;
  } catch {
    memoryDB = createEmptyDB();
    return memoryDB;
  }
}

/** 💾 Persiste en localStorage */
export function saveDB(db: MockDB) {
  memoryDB = db;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // 🧯 Si falla, no rompemos
  }
}

/** 🧹 Reset DB (útil para dev) */
export function resetDB() {
  memoryDB = createEmptyDB();
  try {
    localStorage.removeItem(DB_KEY);
  } catch {}
}

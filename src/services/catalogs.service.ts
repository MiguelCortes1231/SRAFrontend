// src/services/catalogs.service.ts
/**
 * 🧭 Catalogs Service
 * -----------------------------------------
 * - Obtiene catálogo de secciones desde backend 🌐
 * - De una sección derivamos:
 *   - Municipio
 *   - Distrito Local
 *   - Distrito Federal
 *
 * ✅ Incluye:
 * - cache en memoria ⚡
 * - deduplicación de peticiones concurrentes 🧠
 * - force refresh opcional 🔄
 */

import { http } from "./http";

export type SectionCatalogItem = {
  IdSeccion: number;
  IdMunicipio: number;
  IdDistritoLocal: number;
  IdDistritoFederal: number;
  Municipio: string;
};

type GetSeccionesResponse = {
  success: boolean;
  data: SectionCatalogItem[];
};

// 📦 cache final
let sectionsCache: SectionCatalogItem[] | null = null;

// ⏳ promesa en curso para evitar múltiples GET simultáneos
let sectionsPromise: Promise<SectionCatalogItem[]> | null = null;

/** 📚 Obtener todas las secciones */
export async function getSections(force = false): Promise<SectionCatalogItem[]> {
  // 🔄 force refresh
  if (force) {
    sectionsCache = null;
    sectionsPromise = null;
  }

  // ✅ si ya hay cache, úsalo
  if (sectionsCache) {
    return sectionsCache;
  }

  // ✅ si ya hay una petición en curso, reutilízala
  if (sectionsPromise) {
    return sectionsPromise;
  }

  // 🚀 solo la primera llamada entra aquí
  sectionsPromise = (async () => {
    try {
      const res = await http.get<GetSeccionesResponse>("/getSecciones");
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];

      sectionsCache = rows;
      return rows;
    } finally {
      // 🧹 al terminar, liberamos la promesa en curso
      sectionsPromise = null;
    }
  })();

  return sectionsPromise;
}

/** 🔎 Buscar sección por ID */
export async function findSectionById(
  idSeccion: number | string
): Promise<SectionCatalogItem | null> {
  const list = await getSections();
  const id = Number(idSeccion);
  const found = list.find((row) => Number(row.IdSeccion) === id);
  return found ?? null;
}

/** 🧹 Limpiar cache */
export function clearSectionsCache() {
  sectionsCache = null;
  sectionsPromise = null;
}
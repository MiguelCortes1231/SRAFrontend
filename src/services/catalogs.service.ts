// src/services/catalogs.service.ts
/**
 * 🧭 Catalogs Service
 * -----------------------------------------
 * - Obtiene catálogo de secciones desde backend 🌐
 * - De una sección derivamos:
 *   - Municipio
 *   - Distrito Local
 *   - Distrito Federal
 * - Cache simple en memoria ⚡
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

let sectionsCache: SectionCatalogItem[] | null = null;

/** 📚 Obtener todas las secciones */
export async function getSections(force = false): Promise<SectionCatalogItem[]> {
  if (!force && sectionsCache) return sectionsCache;

  const res = await http.get<GetSeccionesResponse>("/getSecciones");
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  sectionsCache = rows;
  return rows;
}

/** 🔎 Buscar sección por ID */
export async function findSectionById(idSeccion: number | string): Promise<SectionCatalogItem | null> {
  const list = await getSections();
  const id = Number(idSeccion);
  const found = list.find((row) => Number(row.IdSeccion) === id);
  return found ?? null;
}

/** 🧹 Limpiar cache */
export function clearSectionsCache() {
  sectionsCache = null;
}
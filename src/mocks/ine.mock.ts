// src/mocks/ine.mock.ts
/**
 * 🧪 Mock INE/IFE OCR
 * -----------------------------------------
 * Simula:
 * - subir imagen
 * - “procesar”
 * - regresar JSON tipo tu API real (cuando llegue) 🔁
 */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type IneScanRequest = {
  frontImageBase64?: string; // 📸 frente
  backImageBase64?: string; // 📸 reverso
};

export type IneScanResponse = {
  ok: boolean;
  message: string;

  // 🔥 Formato inspirado en tu API real
  data: {
    es_ine: boolean;
    tipo_credencial: string;
    nombre: string;
    curp: string;
    fecha_nacimiento: string;
    sexo: "H" | "M";
    clave_elector: string;
    anio_registro: string;
    vigencia: string;

    calle: string;
    numero: string;
    colonia: string;
    codigo_postal: string;
    estado: string;
    municipio?: string;

    seccion: string;
    pais: string;
  };
};

export async function mockIneScan(_: IneScanRequest): Promise<IneScanResponse> {
  // ⏳ Simulamos OCR pesado
  await sleep(1200);

  // ✅ Respuesta mock “bonita”
  return {
    ok: true,
    message: "Procesamiento simulado (mock) ✅",
    data: {
      es_ine: true,
      tipo_credencial: "GH",
      nombre: "CASTILLO OLIVERA RICARDO ORLANDO",
      curp: "CAOR930531HQRSLC0",
      fecha_nacimiento: "31/05/1993",
      sexo: "H",
      clave_elector: "CSOLRC93053123H800",
      anio_registro: "2011 02",
      vigencia: "",
      calle: "C LOS MOLINOS 174",
      numero: "174",
      colonia: "FRACC LA HERRADURA III 77050",
      codigo_postal: "77050",
      estado: "OTHON P. BLANCO, Q. ROO.",
      municipio: "OTHON P. BLANCO",
      seccion: "0378",
      pais: "Mex",
    },
  };
}

import { CacheDirecta } from "./DirectCache";
import { CacheAsociativa } from "./cache-associative";

// Simula una memoria con bloques precargados
export const directCacheStrings: Record<string, string> = {
  AB: "A1B2C3D4",
  CD: "C5D6E7F8",
  EF: "E9FA0B1C",
  "12": "12345678",
};

// Función para imprimir los pasos
function mostrarPasos(
  titulo: string,
  pasos: { step: string; description: string; value?: any }[],
) {
  console.log(`\n🧪 ${titulo}`);
  pasos.forEach((p, i) => {
    console.log(
      `Paso ${i + 1}: [${p.step}] ${p.description}${p.value !== undefined ? ` → ${p.value}` : ""}`,
    );
  });
}

// Prueba con Cache Directa
const cacheDirecta = new CacheDirecta(16384);
cacheDirecta.executeCache("ABF123");
mostrarPasos("Cache Directa - Dirección ABF123", cacheDirecta.getSteps());

// Prueba con Cache Directa
cacheDirecta.executeCache("ABF123");
mostrarPasos("Cache Directa - Dirección ABF123", cacheDirecta.getSteps());

// Prueba con Cache Asociativa
const cacheAsociativa = new CacheAsociativa(16); // Caché pequeña para prueba
cacheAsociativa.executeCache("CD1234");
mostrarPasos("Cache Asociativa - Dirección CD1234", cacheAsociativa.getSteps());

// Segunda lectura para verificar acierto
cacheAsociativa.executeCache("CD1234");
mostrarPasos(
  "Cache Asociativa - Dirección CD1234 (segunda lectura)",
  cacheAsociativa.getSteps(),
);

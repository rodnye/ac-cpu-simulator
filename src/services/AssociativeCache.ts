import { hexTo4BitBinary } from "../utils/convert";
import { Cache } from "./Cache";
import { Memory } from "./Memory";

export class CacheAsociativa extends Cache {
  private memory: Memory;

  constructor(memory: Memory, numLineas: number = 20) {
    super(numLineas);
    this.memory = memory;
  }

  public executeCache(direccionHex: string): void {
    this.steps = [];

    // Convertir dirección hexadecimal a binario de 24 bits
    const bin = hexTo4BitBinary(direccionHex);
    const tag = bin.slice(0, 22); // bits 0 a 21
    const palabra = bin.slice(22, 24); // bits 22 y 23

    this.addStep(
      "decode-address",
      `Dirección decodificada: tag=${tag}, palabra=${palabra}`,
    );

    this.addStep(
      "search-tag",
      `Buscando etiqueta ${tag} en todas las líneas de caché`,
    );

    let encontrado = false;
    let lineaEncontrada = -1;

    // Buscar en todas las líneas
    for (let i = 0; i < this.lineas.length; i++) {
      const entry = this.lineas[i];
      if (entry && entry.tag === tag) {
        encontrado = true;
        lineaEncontrada = i;
        this.addStep("check-line", `Línea ${i}: etiqueta coincide - ACIERTO`);
        break;
      } else if (entry) {
        this.addStep(
          "check-line",
          `Línea ${i}: etiqueta=${entry.tag} - NO coincide`,
        );
      } else {
        this.addStep("check-line", `Línea ${i}: vacía`);
      }
    }

    if (encontrado) {
      this.addStep(
        "cache-hit",
        `Acierto de caché - Etiqueta encontrada en línea ${lineaEncontrada}`,
      );
      this.addStep(
        "cache-success",
        "Dato enviado a la CPU",
        this.memory.getAssociativeWord(tag, palabra),
      );
    } else {
      this.addStep("cache-miss", "Etiqueta no encontrada - FALLO de caché");

      // Buscar línea libre o seleccionar aleatoria
      const lineaLibre = this.lineas.findIndex((entry) => entry === null);
      const lineaDestino =
        lineaLibre !== -1
          ? lineaLibre
          : Math.floor(Math.random() * this.lineas.length);

      this.addStep(
        "select-line",
        lineaLibre !== -1
          ? `Línea ${lineaDestino} está libre - se usará para cargar el bloque`
          : `Todas las líneas ocupadas - reemplazo aleatorio en línea ${lineaDestino}`,
      );

      // Cargar bloque desde memoria
      const bloque = this.memory.getAssociativeBlock(tag);
      this.lineas[lineaDestino] = { tag, bloque };

      this.addStep(
        "load-memory",
        `Bloque cargado desde memoria en línea ${lineaDestino}`,
        bloque,
      );
      this.addStep(
        "send-word",
        "Dato enviado a la CPU desde la memoria",
        this.memory.getAssociativeWord(tag, palabra),
      );
    }
  }
}

import { hexTo4BitBinary } from "../utils/convert";
import { Cache } from "./Cache";
import { Memory } from "./Memory";

export class CacheAsociativa extends Cache {
  public executeCache(direccionHex: string): void {
    this.steps = [];

    const bin = hexTo4BitBinary(direccionHex);
    const tag = bin.slice(0, 22); // bits 0 a 21
    const palabra = bin.slice(22); // bits 22 y 23

    this.addStep(
      "decode-address",
      `Dirección decodificada: tag=${tag}, palabra=${palabra}`,
    );

    this.addStep(
      "search-tag",
      `Iniciando búsqueda iterativa de la etiqueta ${tag} en la caché`,
    );

    let index = -1;
    for (let i = 0; i < this.lineas.length; i++) {
      const entry = this.lineas[i];
      if (entry) {
        this.addStep("check-line", `Línea ${i}: etiqueta=${entry.tag}`);
        if (entry.tag === tag) {
          index = i;
          this.addStep(
            "cache-success",
            `Etiqueta encontrada en línea ${i}, dato enviado a la CPU`,
          );
          break;
        }
      } else {
        this.addStep("check-line", `Línea ${i}: vacía`);
      }
    }

    if (index === -1) {
      this.addStep("cache-miss", "Etiqueta no encontrada, fallo de caché");

      const bloque = Memory.getBlock(tag);
      const lineaLibre = this.lineas.findIndex((entry) => entry === null);
      const lineaDestino =
        lineaLibre !== -1
          ? lineaLibre
          : Math.floor(Math.random() * this.lineas.length);

      this.lineas[lineaDestino] = { tag, bloque };

      this.addStep(
        "load-memory",
        `Bloque cargado desde memoria en línea ${lineaDestino}`,
        bloque,
      );
      this.addStep("cache-success", "Dato enviado a la CPU");
    }
  }
}

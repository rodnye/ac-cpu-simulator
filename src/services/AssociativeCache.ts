import { Cache } from "./Cache";
import { Memory } from "./Memory";

export class CacheAsociativa extends Cache {
  public executeCache(direccionHex: string): void {
    this.steps = [];

    const bin = parseInt(direccionHex, 16).toString(2).padStart(24, "0");
    const tag = bin.slice(0, 8);
    const palabra = bin.slice(22);

    this.addStep(
      "decode-address",
      `Dirección decodificada: tag=${tag}, palabra=${palabra}`,
    );

    const index = this.lineas.findIndex((entry) => entry?.tag === tag);
    this.addStep("search-tag", `Buscando etiqueta ${tag} en la caché`);

    if (index !== -1) {
      this.addStep(
        "cache-success",
        `Etiqueta encontrada en línea ${index}, dato enviado a la CPU`,
      );
    } else {
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

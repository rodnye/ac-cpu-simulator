import { Cache } from "./Cache";
import { directCacheStrings } from "./Memory";

export class CacheDirecta extends Cache {
  public executeCache(direccionHex: string): void {
    this.steps = [];

    const bin = parseInt(direccionHex, 16).toString(2).padStart(24, "0");
    const tag = bin.slice(0, 8);
    const linea = parseInt(bin.slice(8, 22), 2);
    const palabra = bin.slice(22);

    this.addStep(
      "decode-address",
      `Dirección decodificada: tag=${tag}, línea=${linea}, palabra=${palabra}`,
    );

    const entrada = this.lineas[linea];
    this.addStep("search-line", `Buscando en la línea ${linea}`, linea);

    if (!entrada) {
      this.addStep("cache-miss", "Fallo de caché: no hay bloque en la línea");
      const bloque = directCacheStrings[tag];
      this.lineas[linea] = { tag, bloque };
      this.addStep(
        "load-memory",
        `Bloque cargado desde memoria en línea ${linea}`,
        bloque,
      );
      this.addStep("cache-success", "Dato enviado a la CPU");
    } else if (entrada.tag !== tag) {
      this.addStep("verify-tag", "Etiqueta no coincide, fallo de caché");
      const bloque = directCacheStrings[tag];
      this.lineas[linea] = { tag, bloque };
      this.addStep(
        "load-memory",
        `Bloque reemplazado desde memoria en línea ${linea}`,
        bloque,
      );
      this.addStep("cache-success", "Dato enviado a la CPU");
    } else {
      this.addStep("verify-tag", "Etiqueta coincide, acierto de caché");
      this.addStep("cache-success", "Dato enviado a la CPU");
    }
  }
}

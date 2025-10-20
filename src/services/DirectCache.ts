import { hexTo4BitBinary } from "../utils/convert";
import { Cache } from "./Cache";
import { Memory } from "./Memory";

export class CacheDirecta extends Cache {
  memory: Memory;
  public constructor(memory: Memory) {
    super();
    this.memory = memory;
  }

  public executeCache(direccionHex: string): void {
    this.steps = [];

    const bin = hexTo4BitBinary(direccionHex);
    const tag = direccionHex.substring(0, 2);

    const linea = parseInt(bin.substring(8, 23)) % 20;
    const palabra = bin.substring(23, 25);

    this.addStep(
      "decode-address",
      `Dirección decodificada: tag=${tag}, línea=${linea}, palabra=${palabra}`,
    );

    const entrada = this.lineas[linea];
    this.addStep("search-line", `Buscando en la línea ${linea}`, linea);

    if (!entrada) {
      this.addStep("cache-miss", "Fallo de caché: no hay bloque en la línea");
      const bloque = this.memory.getDirectBlock(tag);
      this.lineas[linea] = { tag, bloque };
      this.addStep(
        "load-memory",
        `Bloque cargado desde memoria en línea ${linea}`,
        bloque,
      );
      this.addStep(
        "cache-success",
        "Dato enviado a la CPU",
        this.memory.getDirectWord(tag, palabra),
      );
    } else if (entrada.tag !== tag) {
      this.addStep("verify-tag", "Etiqueta no coincide, fallo de caché");
      const bloque = this.memory.getDirectBlock(tag);
      this.lineas[linea] = { tag, bloque };
      this.addStep(
        "load-memory",
        `Bloque reemplazado desde memoria en línea ${linea}`,
        bloque,
      );
      this.addStep("send-word", "Dato enviado a la CPU desde la memoria");
    } else {
      this.addStep("verify-tag", "Etiqueta coincide, acierto de caché");
      this.addStep(
        "send-word",
        "Dato enviado a la CPU desde la memoria",
        this.memory.getDirectWord(tag, palabra),
      );
    }
  }
}

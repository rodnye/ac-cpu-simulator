import { Cache } from "./Cache";
import { Operation } from "./DataQueue";
import { directCacheStrings } from "./Memory";

export class CacheDirecta extends Cache {
  bin!: string;
  tag!: string;
  linea!: number;
  palabra!: string;
  constructor() {
    super();
  }

  public executeCache(direccionHex: string): void {
    const bin = parseInt(direccionHex, 16).toString(2).padStart(24, "0");
    this.bin = parseInt(direccionHex, 16).toString(2).padStart(24, "0");
    this.tag = bin.slice(0, 8);
    this.linea = parseInt(bin.slice(8, 22), 2);
    this.palabra = bin.slice(22);

    const operation: Operation = new Operation(
      "search-line",
      `Comprobando si hay algun dato en la linea ${this.linea}`,
      this.linea,
    );

    this.queue.push(operation);
  }

  public next(): Operation | null {
    if (this.queue.length === 0) {
      return null;
    }

    const actualOperation = this.queue.shift();
    if (!actualOperation) {
      return null;
    }

    let nextOperation: Operation | null = null;

    switch (actualOperation.step) {
      case "search-line":
        const entrada = this.lineas[actualOperation.value];
        if (entrada) {
          nextOperation = new Operation(
            "verify-tag",
            "Verificando si la etiqueta en la línea coincide con la buscada",
            actualOperation.value,
          );
        } else {
          nextOperation = new Operation(
            "cache-fail",
            "Hay un fallo de caché, no hay ningún bloque en la línea, dando curso a la petición a memoria",
          );
        }
        break;

      case "verify-tag":
        if (this.lineas[this.linea]?.tag === this.tag) {
          nextOperation = new Operation(
            "cache-success",
            "Las etiquetas coinciden, hay un acierto de caché, enviando la palabra a la CPU",
          );
        } else {
          nextOperation = new Operation(
            "cache-fail",
            "Hay un fallo de caché, las etiquetas no coinciden, dando curso a la petición en memoria",
          );
        }
        break;

      case "cache-fail":
        // Cargar bloque desde memoria y marcar como éxito después de la carga
        this.setBlock(this.linea, this.tag, directCacheStrings[this.tag]);
        nextOperation = new Operation(
          "cache-success",
          "Bloque cargado desde memoria principal, enviando dato a la CPU",
        );
        break;

      default:
        nextOperation = null;
        break;
    }

    if (nextOperation) {
      this.queue.push(nextOperation);
    }

    return actualOperation;
  }

  public setBlock(linea: number, tag: string, bloque: string) {
    this.lineas[linea] = { tag, bloque };
  }
}

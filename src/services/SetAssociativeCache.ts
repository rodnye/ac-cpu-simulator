import { hexTo4BitBinary } from "../utils/convert";
import { Cache, type CacheEntry } from "./Cache";
import { Memory } from "./Memory";

export class SetAssociativeCache extends Cache {
  private memory: Memory;
  private sets: Record<number, (CacheEntry | null)[]>;

  constructor(memory: Memory) {
    super();
    this.memory = memory;
    this.sets = {
      0: Array(4).fill(null),
      1: Array(4).fill(null),
      2: Array(4).fill(null),
      3: Array(4).fill(null),
      4: Array(4).fill(null),
    };
  }

  public executeCache(direccionHex: string): void {
    this.steps = [];

    // Convertir dirección hexadecimal a binario de 24 bits
    const bin = hexTo4BitBinary(direccionHex);
    const tag = direccionHex.substring(0, 2);
    const numberSet = parseInt(bin.slice(8, 23), 2) % 5; // 5 conjuntos de 4 lineas cada uno
    const palabra = bin.substring(23, 25);

    this.addStep(
      "decode-address",
      `Dirección decodificada: tag=${tag}, conjunto=${numberSet}, palabra=${palabra}`,
    );

    this.addStep("search-set", `Buscando en el conjunto ${numberSet}`);

    const actualSet = this.sets[numberSet];

    let encontrado = false;
    let lineaEncontrada = -1;

    // Buscar en las vías del conjunto
    for (let i = 0; i < 4; i++) {
      const entry = actualSet[i];

      if (entry && entry.tag === tag) {
        encontrado = true;
        lineaEncontrada = i;
        this.addStep(
          "check-way",
          `Linea ${i} del conjunto ${numberSet}: etiqueta coincide - ACIERTO`,
        );
        break;
      } else if (entry) {
        this.addStep(
          "check-way",
          `Linea ${i} del conjunto ${numberSet}: etiqueta=${entry.tag} - NO coincide`,
        );
      } else {
        this.addStep(
          "check-way",
          `Linea ${i} del conjunto ${numberSet}: vacía`,
        );
      }
    }

    if (encontrado) {
      this.addStep(
        "cache-hit",
        `Acierto de caché - Etiqueta encontrada en conjunto ${numberSet}, linea ${lineaEncontrada}`,
      );
      this.addStep(
        "cache-success",
        "Dato enviado a la CPU",
        this.memory.getDirectWord(tag, palabra),
      );
    } else {
      this.addStep(
        "cache-miss",
        "Etiqueta no encontrada en el conjunto - FALLO de caché",
      );

      // Buscar vía libre en el conjunto
      let viaLibre = -1;
      for (let i = 0; i < 4; i++) {
        if (this.lineas[i] === null) {
          viaLibre = i;
          break;
        }
      }

      let viaSeleccionada: number;
      if (viaLibre !== -1) {
        viaSeleccionada = viaLibre;
        this.addStep(
          "select-way",
          `Vía ${viaSeleccionada} está libre - se usará para cargar el bloque`,
        );
      } else {
        // Política de reemplazo: aleatoria dentro del conjunto
        viaSeleccionada = Math.floor(Math.random() * 8) % 4;
        this.addStep(
          "select-way",
          `Todas las linea ocupadas - reemplazo aleatorio en linea ${viaSeleccionada} del conjunto ${numberSet}`,
        );
      }

      const lineaDestino = viaSeleccionada;

      // Cargar bloque desde memoria
      const bloque = this.memory.getDirectBlock(tag);
      this.sets[numberSet][lineaDestino] = { tag, bloque };

      this.addStep(
        "load-memory",
        `Bloque cargado desde memoria en conjunto ${numberSet}, linea ${viaSeleccionada}`,
        bloque,
      );
      console.log(tag);
      this.addStep(
        "send-word",
        "Dato enviado a la CPU desde la memoria",
        this.memory.getDirectWord(tag, palabra),
      );
    }
  }
}

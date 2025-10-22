import { Cache } from "./Cache";
import type { Step } from "../StepManager";
import type { Memory } from "../Memory";
import { parseHexAssociativeAddress } from "../../utils/convert";

export class AssociativeCache extends Cache<AssociativeCacheStep> {
  constructor(memory: Memory) {
    super(memory, 20);
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, word } = parseHexAssociativeAddress(hexAddress);

    // NUEVO: Mostrar conversión y descomposición detallada
    const fullBinary = hexAddress
      .split("")
      .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
      .join("");

    this.addStep({
      id: "hex-to-binary",
      info: `Conversión de dirección hexadecimal a binario:\n\nHexadecimal: ${hexAddress}\nBinario completo: ${fullBinary}\n\nDescomposición para caché totalmente asociativa:\n• Tag: ${tag} (22 bits) - Identificador completo del bloque\n• Palabra: ${word} (2 bits) - Posición en el bloque\n•`,
    });

    this.addStep({
      id: "search-tag",
      info: `Búsqueda exhaustiva en caché totalmente asociativa:\n\n• Etiqueta buscada: ${tag}\n• Número de líneas: 20\n`,
    });

    let found = false;
    let foundLine = "-1";
    let lineNumber = 0;

    // Buscar en todas las líneas
    for (let i of Object.keys(this.lines)) {
      lineNumber++;
      const entry = this.lines[i];
      if (i === tag) {
        found = true;
        foundLine = i;
        this.addStep({
          id: "check-line",
          info: `Línea ${lineNumber}: ¡ETIQUETA ENCONTRADA! - ACIERTO\n\n• Etiqueta en caché: ${i}\n• Etiqueta buscada: ${tag}\n• Línea: ${lineNumber}`,
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-line",
          info: `Línea ${lineNumber}: etiqueta diferente - continuando búsqueda\n\n• Etiqueta en caché: ${i}\n• Etiqueta buscada: ${tag}\n• Línea: ${lineNumber}`,
        });
      } else {
        this.addStep({
          id: "check-line",
          info: `Línea ${lineNumber}: línea vacía - continuando búsqueda\n\n• Etiqueta en caché: (vacía)\n• Etiqueta buscada: ${tag}\n• Línea: ${lineNumber}`,
        });
      }
    }

    // Completar búsqueda en líneas restantes si no se encontró
    let remainingLines = 20 - lineNumber;
    for (let i = 1; i <= remainingLines && !found; i++) {
      this.addStep({
        id: "check-line",
        info: `Línea ${lineNumber + i}: línea vacía - continuando búsqueda\n\n• Etiqueta en caché: (vacía)\n• Etiqueta buscada: ${tag}\n• Línea: ${lineNumber + i}`,
      });
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = this.lines[foundLine].substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `¡ACIERTO! Etiqueta encontrada en línea ${foundLine}.\n\nDetalles:\n• Etiqueta en caché: ${foundLine}\n• Etiqueta buscada: ${tag}\n• Palabra: ${word} (posición ${parseInt(word, 2)})\n• Valor recuperado: ${this.output}\n• Bloque completo: ${this.lines[foundLine]}`,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: `FALLO - Etiqueta no encontrada en ninguna línea.\n\n• Etiqueta buscada: ${tag}\n• Líneas revisadas: 20\n• Se requiere acceso a memoria principal para cargar el bloque`,
    });

    this.output = null;
    return null;
  }

  public getWord(tag: string, word: string) {
    const index = parseInt(word, 2) * 2;
    return this.lines[tag].substring(index, index + 2);
  }

  public executeSetLine(hexAddress: string): void {
    this.emit("execute", "set-line");
    this.setSteps([]);

    let { tag, word } = parseHexAssociativeAddress(hexAddress);
    const freeLine = tag;

    this.addStep({
      id: "select-line",
      info: `Política de reemplazo: seleccionada línea ${freeLine} para almacenar nuevo bloque\n\n• Etiqueta en caché: ${freeLine}\n• Etiqueta buscada: ${tag}\n• Dirección: ${hexAddress}`,
    });

    this.lines[freeLine] = this.memory.getBlock(hexAddress);
    this.addStep({
      id: "load-memory",
      info: `Bloque cargado desde memoria principal:\n\n• Línea destino: ${freeLine}\n• Etiqueta en caché: ${freeLine}\n• Etiqueta buscada: ${tag}\n• Bloque: ${this.lines[freeLine]}\n• Tamaño: ${this.lines[freeLine].length * 4} bits`,
    });
  }

  // Al final de cada clase, agregar:
  public resetVisualState() {
    super.resetVisualState();
    this.input = null;
    this.output = null;
    // Nota: no resetear this.tags, this.lines, this.sets porque contienen datos reales
  }
}

// Tipado de pasos
export type AssociativeCacheStep = Step &
  (
    | { id: "hex-to-binary" }
    | { id: "search-tag" }
    | { id: "check-line" }
    | { id: "cache-hit" }
    | { id: "cache-miss" }
    | { id: "select-line" }
    | { id: "load-memory" }
  );

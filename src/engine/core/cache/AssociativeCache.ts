// FIXME: change all to the new controller system
import type { Memory } from "../../Memory";
import {
  parseHexAssociativeAddress,
} from "../../../utils/convert";
import { CacheController } from "../../controllers/CacheController";

export class AssociativeCache extends CacheController<AssociativeCacheStep> {
  constructor(memory: Memory) {
    super(memory);
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, word } = parseHexAssociativeAddress(hexAddress);
    this.addStep({
      id: "decode-address",
      info: `Caché totalmente asociativa - Búsqueda de etiqueta ${tag} en todas las líneas disponibles`,
    });

    this.addStep({
      id: "search-tag",
      info: `Búsqueda exhaustiva: comparando etiqueta ${tag} con cada una de las 20 líneas de la caché`,
    });

    let found = false;
    let foundLine = "-1";
    let aux = 20;

    // Buscar en todas las líneas
    for (let i of Object.keys(this.lines)) {
      aux--;
      const entry = this.lines[i];
      if (i === tag) {
        found = true;
        foundLine = i;
        this.addStep({
          id: "check-line",
          info: `Línea ${20 - aux}: ¡ETIQUETA ENCONTRADA! - ACIERTO`,
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-line",
          info: `Línea ${20 - aux}: etiqueta diferente - continuando búsqueda`,
        });
      }
    }

    while (aux && !found) {
      this.addStep({
        id: "check-line",
        info: `Línea ${20 - aux}: etiqueta diferente - continuando búsqueda`,
      });
      aux--;
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = this.lines[foundLine].substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `¡ACIERTO! Etiqueta encontrada en línea ${foundLine}. Valor recuperado: ${this.output}`,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: "FALLO - Etiqueta no encontrada en ninguna línea. Se requiere acceso a memoria principal",
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
    console.log(tag);

    this.addStep({
      id: "select-line",
      info: `Política de reemplazo: seleccionada línea ${freeLine} para almacenar nuevo bloque`,
    });

    this.lines[freeLine] = this.memory.getBlock(hexAddress);
    this.addStep({
      id: "load-memory",
      info: `Bloque cargado desde memoria principal a línea ${freeLine} de la caché totalmente asociativa`,
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
    | { id: "decode-address" }
    | { id: "search-tag" }
    | { id: "check-line" }
    | { id: "cache-hit" }
    | { id: "cache-miss" }
    | { id: "select-line" }
    | { id: "load-memory" }
  );

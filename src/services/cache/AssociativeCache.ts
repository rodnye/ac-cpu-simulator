import { Cache } from "./Cache";
import type { Step } from "../StepManager";
import type { Memory } from "../Memory";
import {
  binary4BitToHex,
  parseHexAssociativeAddress,
  randomHexChar,
} from "../../utils/convert";

export class AssociativeCache extends Cache<AssociativeCacheStep> {
  constructor(memory: Memory) {
    super(memory, 20);
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, word } = parseHexAssociativeAddress(hexAddress);
    this.addStep({
      id: "decode-address",
      info: `Dirección decodificada: tag=${tag}, palabra=${word}`,
      value: { tag, word },
    });

    this.addStep({
      id: "search-tag",
      info: `Buscando etiqueta ${tag} en todas las líneas de caché`,
      value: tag,
    });

    let found = false;
    let foundLine = "-1";

    // Buscar en todas las líneas
    for (let i of Object.values(this.lines)) {
      const entry = this.lines[i];
      if (entry && i === tag) {
        found = true;
        foundLine = i;
        this.addStep({
          id: "check-line",
          info: `Línea ${i}: etiqueta coincide - ACIERTO`,
          value: { line: i, match: true },
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-line",
          info: `Línea ${i}: etiqueta=${i} - NO coincide`,
          value: { line: i, match: false },
        });
      } else {
        this.addStep({
          id: "check-line",
          info: `Línea ${i}: vacía`,
          value: { line: i, empty: true },
        });
      }
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = this.lines[foundLine].substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `Acierto de caché - Etiqueta encontrada en línea ${foundLine}`,
        value: this.output,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: "Etiqueta no encontrada - FALLO de caché",
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

    // Buscar línea libre o usar reemplazo aleatorio

    let { tag, word } = parseHexAssociativeAddress(hexAddress);
    const freeLine = tag;

    this.addStep({
      id: "select-line",
      info: `Todas las líneas ocupadas - reemplazo aleatorio en línea ${freeLine}`,
      value: { line: freeLine, replacement: true },
    });

    this.lines[freeLine] = this.memory.getBlock(hexAddress);
    this.addStep({
      id: "load-memory",
      info: `Bloque cargado en línea ${freeLine}`,
      value: { line: freeLine, entry: this.lines[freeLine] },
    });
  }
}

// Tipado de pasos
export type AssociativeCacheStep = Step &
  (
    | {
        id: "decode-address";
        value: { tag: string; word: string };
      }
    | {
        id: "search-tag";
        value: string;
      }
    | {
        id: "check-line";
        value: { line: string; match?: boolean; empty?: boolean };
      }
    | {
        id: "cache-hit";
        value: string;
      }
    | {
        id: "cache-miss";
      }
    | {
        id: "select-line";
        value: { line: string; free?: boolean; replacement?: boolean };
      }
    | {
        id: "load-memory";
        value: { line: string; entry: string };
      }
  );

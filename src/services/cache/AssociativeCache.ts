import { Cache } from "./Cache";
import type { Step } from "../StepManager";
import type { Memory } from "../Memory";
import {
  parseHexAssociativeAddress,
  randomBinaryChar,
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
          info: `Línea ${20 - aux}: etiqueta coincide - ACIERTO`,
          value: { line: 20 - aux, match: true },
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-line",
          info: `Línea ${20 - aux}: etiqueta=${i} - NO coincide`,
          value: { line: 20 - aux, match: false },
        });
      }
    }

    while (aux && !found) {
      const linea = 0;
      const tag = randomBinaryChar(8);
      this.addStep({
        id: "check-line",
        info: `Línea ${20 - aux}: etiqueta=${tag} - NO coincide`,
        value: { line: linea, match: false },
      });
      aux--;
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

    let { tag, word } = parseHexAssociativeAddress(hexAddress);
    const freeLine = tag;
    console.log(tag);
    this.lines[freeLine] = this.memory.getBlock(hexAddress);

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
        value: { line: number; match?: boolean; empty?: boolean };
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

// AssociativeCache.ts
import { Cache, type CacheEntry } from "./Cache";
import { Cpu } from "../Cpu";
import type { Step } from "../StepManager";

export class AssociativeCache extends Cache<AssociativeCacheStep> {
  constructor(linesLen: number = 20) {
    super(linesLen);
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, word } = Cpu.parseHexAssociativeAddress(hexAddress);
    this.addStep({
      id: "decode-address",
      info: `Decodificación completada | Tag: ${tag} | Palabra: ${word}`,
      value: { tag, word },
    });

    this.addStep({
      id: "search-tag",
      info: `Búsqueda asociativa iniciada | Target tag: ${tag}`,
      value: tag,
    });

    let found = false;
    let foundLine = -1;

    // Buscar en todas las líneas
    console.log(this.lines.length);
    for (let i = 0; i < this.lines.length; i++) {
      const entry = this.lines[i];
      if (entry && entry.tag === tag) {
        found = true;
        foundLine = i;
        this.addStep({
          id: "check-line",
          info: `Línea ${i} | MATCH | Tag coincidente encontrado`,
          value: { line: i, match: true },
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-line",
          info: `Línea ${i} | NO MATCH | Tag actual: ${entry.tag}`,
          value: { line: i, match: false },
        });
      } else {
        this.addStep({
          id: "check-line",
          info: `Línea ${i} | EMPTY | Sin datos almacenados`,
          value: { line: i, empty: true },
        });
      }
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = this.lines[foundLine]!.block.substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `HIT | Línea: ${foundLine} | Output: ${this.output}`,
        value: this.output,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: "MISS | Tag no encontrado en caché completa",
    });

    this.output = null;
    return null;
  }

  public executeSetLine(_: number, entry: CacheEntry): void {
    this.emit("execute", "set-line");
    this.setSteps([]);

    // Buscar línea libre o usar reemplazo aleatorio
    const freeLine = this.lines.findIndex((l) => l === null);
    let selectedLine: number;

    if (freeLine !== -1) {
      selectedLine = freeLine;
      this.addStep({
        id: "select-line",
        info: `Asignación a línea libre | Línea: ${selectedLine}`,
        value: { line: selectedLine, free: true },
      });
    } else {
      selectedLine = Math.floor(Math.random() * this.lines.length);
      this.addStep({
        id: "select-line",
        info: `Reemplazo aleatorio | Línea seleccionada: ${selectedLine}`,
        value: { line: selectedLine, replacement: true },
      });
    }

    this.lines[selectedLine] = entry;
    console.log("seteado");
    console.log(entry);
    this.addStep({
      id: "load-memory",
      info: `Escritura completada | Línea: ${selectedLine} | Bloque: ${entry.block} | Tag: ${entry.tag}`,
      value: { line: selectedLine, entry },
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
        value: { line: number; free?: boolean; replacement?: boolean };
      }
    | {
        id: "load-memory";
        value: { line: number; entry: CacheEntry };
      }
  );

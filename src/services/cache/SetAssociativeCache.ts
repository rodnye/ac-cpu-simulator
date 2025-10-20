// SetAssociativeCache.ts
import { Cache, type CacheEntry } from "./Cache";
import { Cpu } from "../Cpu";
import type { Step } from "../StepManager";

export class SetAssociativeCache extends Cache<SetAssociativeCacheStep> {
  public sets: Record<number, (CacheEntry | null)[]>;

  constructor(linesLen: number = 5) {
    super(linesLen);
    this.sets = {
      0: Array(4).fill(null),
      1: Array(4).fill(null),
      2: Array(4).fill(null),
      3: Array(4).fill(null),
      4: Array(4).fill(null),
    };
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word } = Cpu.parseHexAddress(hexAddress);
    const setNumber = line % 5; // 5 sets of 4 lines each

    this.addStep({
      id: "decode-address",
      info: `Decodificación completada | Tag: ${tag} | Conjunto: ${setNumber} | Palabra: ${word}`,
      value: { tag, setNumber, word },
    });

    this.addStep({
      id: "search-set",
      info: `Búsqueda en conjunto | Target: Set ${setNumber}`,
      value: setNumber,
    });

    const currentSet = this.sets[setNumber];
    let found = false;
    let foundLine = -1;

    // Search in set ways
    for (let i = 0; i < 4; i++) {
      const entry = currentSet[i];
      if (entry && entry.tag === tag) {
        found = true;
        foundLine = i;
        this.addStep({
          id: "check-way",
          info: `Vía ${i} | MATCH | Tag coincidente en conjunto ${setNumber}`,
          value: { way: i, set: setNumber, match: true },
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-way",
          info: `Vía ${i} | NO MATCH | Tag actual: ${entry.tag}`,
          value: { way: i, set: setNumber, match: false },
        });
      } else {
        this.addStep({
          id: "check-way",
          info: `Vía ${i} | EMPTY | Sin datos en conjunto ${setNumber}`,
          value: { way: i, set: setNumber, empty: true },
        });
      }
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = currentSet[foundLine]!.block.substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `HIT | Conjunto: ${setNumber} | Vía: ${foundLine} | Output: ${this.output}`,
        value: this.output,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: "MISS | Tag no encontrado en el conjunto",
    });

    this.output = null;
    return null;
  }

  public executeSetLine(line: number, entry: CacheEntry): void {
    this.emit("execute", "set-line");
    this.setSteps([]);

    const setNumber = line % 5;
    const currentSet = this.sets[setNumber];

    // Find free way or use replacement policy
    let freeWay = -1;
    for (let i = 0; i < 4; i++) {
      if (currentSet[i] === null) {
        freeWay = i;
        break;
      }
    }

    let selectedWay: number;
    if (freeWay !== -1) {
      selectedWay = freeWay;
      this.addStep({
        id: "select-way",
        info: `Asignación a vía libre | Conjunto: ${setNumber} | Vía: ${selectedWay}`,
        value: { way: selectedWay, set: setNumber, free: true },
      });
    } else {
      // Random replacement policy within the set
      selectedWay = Math.floor(Math.random() * 8) % 4;
      this.addStep({
        id: "select-way",
        info: `Reemplazo aleatorio | Conjunto: ${setNumber} | Vía: ${selectedWay}`,
        value: { way: selectedWay, set: setNumber, replacement: true },
      });
    }

    currentSet[selectedWay] = entry;
    this.addStep({
      id: "load-memory",
      info: `Escritura completada | Conjunto: ${setNumber} | Vía: ${selectedWay} | Bloque: ${entry.block} | Tag: ${entry.tag}`,
      value: { set: setNumber, way: selectedWay, entry },
    });
  }
}

// Step typing
export type SetAssociativeCacheStep = Omit<Step, "value"> &
  (
    | {
        id: "decode-address";
        value: {
          tag: string;
          setNumber: number;
          word: string;
        };
      }
    | {
        id: "search-set";
        value: number;
      }
    | {
        id: "check-way";
        value: {
          way: number;
          set: number;
          match?: boolean;
          empty?: boolean;
        };
      }
    | {
        id: "cache-hit";
        value: string;
      }
    | {
        id: "cache-miss";
      }
    | {
        id: "select-way";
        value: {
          way: number;
          set: number;
          free?: boolean;
          replacement?: boolean;
        };
      }
    | {
        id: "load-memory";
        value: { set: number; way: number; entry: CacheEntry };
      }
  );

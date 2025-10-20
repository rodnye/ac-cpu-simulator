import { Cache, type CacheEntry } from "./Cache";
import { Cpu } from "../Cpu";
import type { Step } from "../StepManager";

export class AssociativeCache extends Cache<AssociativeCacheStep> {
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
      info: `Dirección decodificada: tag=${tag}, conjunto=${setNumber}, palabra=${word}`,
      value: { tag, setNumber, word },
    });

    this.addStep({
      id: "search-set",
      info: `Buscando en el conjunto ${setNumber}`,
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
          info: `Línea ${i} del conjunto ${setNumber}: etiqueta coincide - ACIERTO`,
          value: { way: i, set: setNumber, match: true },
        });
        break;
      } else if (entry) {
        this.addStep({
          id: "check-way",
          info: `Línea ${i} del conjunto ${setNumber}: etiqueta=${entry.tag} - NO coincide`,
          value: { way: i, set: setNumber, match: false },
        });
      } else {
        this.addStep({
          id: "check-way",
          info: `Línea ${i} del conjunto ${setNumber}: vacía`,
          value: { way: i, set: setNumber, empty: true },
        });
      }
    }

    if (found) {
      this.output = currentSet[foundLine]!.block;
      this.addStep({
        id: "cache-hit",
        info: `Acierto de caché - Etiqueta encontrada en conjunto ${setNumber}, línea ${foundLine}`,
        value: this.output,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: "Etiqueta no encontrada en el conjunto - FALLO de caché",
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
        info: `Vía ${selectedWay} está libre - se usará para cargar el bloque`,
        value: { way: selectedWay, set: setNumber, free: true },
      });
    } else {
      // Random replacement policy within the set
      selectedWay = Math.floor(Math.random() * 8) % 4;
      this.addStep({
        id: "select-way",
        info: `Todas las líneas ocupadas - reemplazo aleatorio en línea ${selectedWay} del conjunto ${setNumber}`,
        value: { way: selectedWay, set: setNumber, replacement: true },
      });
    }

    currentSet[selectedWay] = entry;
    this.addStep({
      id: "load-memory",
      info: `Bloque cargado en conjunto ${setNumber}, línea ${selectedWay}`,
      value: { set: setNumber, way: selectedWay, entry },
    });
  }
}

// Step typing
export type AssociativeCacheStep = Omit<Step, "value"> &
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

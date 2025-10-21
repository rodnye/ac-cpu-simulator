import { Cache } from "./Cache";
import { parseHexAddress } from "../../utils/convert";
import type { Step } from "../StepManager";
import type { Memory } from "../Memory";

export class SetAssociativeCache extends Cache<SetAssociativeCacheStep> {
  public sets: Record<string, Record<string, string>>;

  constructor(memory: Memory) {
    super(memory);
    this.sets = {};
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word } = parseHexAddress(hexAddress);
    const setNumber = line;

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
    let foundLine = "-1";

    // Search in set ways
    for (let value of Object.values(currentSet)) {
      if (currentSet[value] && value === tag) {
        found = true;
        foundLine = value;
        this.addStep({
          id: "check-way",
          info: `Línea ${value} del conjunto ${setNumber}: etiqueta coincide - ACIERTO`,
          value: { way: value, set: setNumber, match: true },
        });
        break;
      } else if (value) {
        this.addStep({
          id: "check-way",
          info: `Línea ${value} del conjunto ${setNumber}: etiqueta=${tag} - NO coincide`,
          value: { way: value, set: setNumber, match: false },
        });
      } else {
        this.addStep({
          id: "check-way",
          info: `Línea ${value} del conjunto ${setNumber}: vacía`,
          value: { way: value, set: setNumber, empty: true },
        });
      }
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = currentSet[foundLine].substring(index, index + 2);
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

  public getWord(direccionHex: string) {
    const { line, tag, word } = parseHexAddress(direccionHex);
    const index = parseInt(word, 2) * 2;
    return this.sets[line][tag].substring(index, index + 2);
  }

  public executeSetLine(directionHex: string): void {
    this.emit("execute", "set-line");
    this.setSteps([]);

    const { tag, line, word } = parseHexAddress(directionHex);
    const currentSet = this.sets[line];

    // Find free way or use replacement policy
    let freeWay = "-1";
    for (let i of Object.values(currentSet)) {
      if (currentSet[i] === null) {
        freeWay = i;
        break;
      }
    }

    let selectedWay: string;
    if (freeWay !== "-1") {
      selectedWay = freeWay;
      this.addStep({
        id: "select-way",
        info: `Vía ${selectedWay} está libre - se usará para cargar el bloque`,
        value: { way: selectedWay, set: line, free: true },
      });
    } else {
      // Random replacement policy within the set
      selectedWay = Object.values(currentSet)[Math.random() * 4];
      this.addStep({
        id: "select-way",
        info: `Todas las líneas ocupadas - reemplazo aleatorio en línea ${selectedWay} del conjunto ${line}`,
        value: { way: selectedWay, set: line, replacement: true },
      });
    }

    currentSet[selectedWay] = this.memory.getBlock(directionHex);
    this.addStep({
      id: "load-memory",
      info: `Bloque cargado en conjunto ${line}, línea ${selectedWay}`,
      value: { set: line, way: selectedWay, block: currentSet[selectedWay] },
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
          setNumber: string;
          word: string;
        };
      }
    | {
        id: "search-set";
        value: string;
      }
    | {
        id: "check-way";
        value: {
          way: string;
          set: string;
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
          way: string;
          set: string;
          free?: boolean;
          replacement?: boolean;
        };
      }
    | {
        id: "load-memory";
        value: { set: string; way: string; block: string };
      }
  );

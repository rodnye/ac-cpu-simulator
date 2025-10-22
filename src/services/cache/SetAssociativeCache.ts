import { Cache } from "./Cache";
import {
  binary4BitToHex,
  parseHexAddress,
  randomBinaryChar,
} from "../../utils/convert";
import type { Step } from "../StepManager";
import type { Memory } from "../Memory";

export class SetAssociativeCache extends Cache<SetAssociativeCacheStep> {
  public sets: Record<string, Record<string, string>>;

  private waysPerSet = 4;

  constructor(memory: Memory) {
    super(memory);
    this.sets = {};
  }

  private initSet(setN: string) {
    if (!this.sets[setN]) {
      this.sets[setN] = {};
    }

    for (let i = 0; i < this.waysPerSet; i++) {
      const tag = randomBinaryChar(8);
      const word = randomBinaryChar(2);
      const wayTag = tag + setN + word;

      const wayAddress = binary4BitToHex(wayTag);

      this.sets[setN][tag] = this.memory.getBlock(wayAddress);
    }
  }

  // Al final de cada clase, agregar:
  public resetVisualState() {
    super.resetVisualState();
    this.input = null;
    this.output = null;
    // Nota: no resetear this.tags, this.lines, this.sets porque contienen datos reales
  }

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word } = parseHexAddress(hexAddress);
    const setNumber = line;

    // NUEVO: Mostrar conversión y descomposición detallada
    const fullBinary = hexAddress
      .split("")
      .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
      .join("");

    this.addStep({
      id: "hex-to-binary",
      info: `Conversión de dirección hexadecimal a binario:\n\nHexadecimal: ${hexAddress}\nBinario completo: ${fullBinary}\n\nDescomposición para caché asociativa por conjuntos:\n• Tag: ${tag} (8 bits) - Identificador del bloque\n• Conjunto: ${setNumber} (14 bits) - Grupo ${parseInt(setNumber, 2)}\n• Palabra: ${word} (2 bits)`,
    });

    // CORRECCIÓN: Inicializar conjunto si no existe o está vacío
    if (
      !this.sets[setNumber] ||
      Object.keys(this.sets[setNumber]).length === 0
    ) {
      this.initSet(setNumber);
    }

    this.addStep({
      id: "search-set",
      info: `Explorando conjunto ${parseInt(setNumber, 2)}:\n\n• Vías disponibles: ${this.waysPerSet}\n• Etiqueta buscada: ${tag}\n`,
    });

    const currentSet = this.sets[setNumber];
    let found = false;
    let foundTag = "-1";
    let wayIndex = 0;

    const ways = Object.keys(currentSet);

    // CORRECCIÓN: Verificar que hay ways disponibles
    if (ways.length === 0) {
      this.addStep({
        id: "cache-miss",
        info: "FALLO - Conjunto vacío. Se requiere acceso a memoria principal",
      });
      this.output = null;
      return null;
    }

    for (let i = 0; i < ways.length; i++) {
      const currentTag = ways[i];
      wayIndex = i + 1;

      if (currentTag === tag) {
        found = true;
        foundTag = currentTag;
        this.addStep({
          id: "check-way",
          info: `Vía ${wayIndex} en conjunto ${parseInt(setNumber, 2)}: ¡ETIQUETA COINCIDE - ACIERTO!\n\n• Etiqueta en vía: ${currentTag}\n• Etiqueta buscada: ${tag}\n• Vía: ${wayIndex}/${this.waysPerSet}`,
        });
        break;
      } else {
        this.addStep({
          id: "check-way",
          info: `Vía ${wayIndex} en conjunto ${parseInt(setNumber, 2)}: etiqueta diferente\n\n• Etiqueta en vía: ${currentTag}\n• Etiqueta buscada: ${tag}\n• Continuando búsqueda...`,
        });
      }
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = currentSet[foundTag].substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `¡ACIERTO! Datos encontrados en caché asociativa por conjuntos.\n\nDetalles:\n• Conjunto: ${parseInt(setNumber, 2)}\n• Vía: ${wayIndex}\n• Etiqueta en caché: ${foundTag}\n• Etiqueta buscada: ${tag}\n• Palabra recuperada: ${this.output}\n• Bloque: ${currentSet[foundTag]}`,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: `FALLO - Etiqueta no encontrada en ninguna vía del conjunto.\n\n• Conjunto revisado: ${parseInt(setNumber, 2)}\n• Vías revisadas: ${this.waysPerSet}\n• Etiqueta buscada: ${tag}\n• Se requiere acceso a memoria principal`,
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

    if (!this.sets[line] || Object.keys(this.sets[line]).length === 0) {
      this.initSet(line);
    }
    const currentSet = this.sets[line];

    const ways = Object.keys(currentSet);
    let selectedWay: string;

    const randomIndex = Math.floor(Math.random() * ways.length);
    selectedWay = ways[randomIndex];

    this.addStep({
      id: "select-way",
      info: `Política de reemplazo aleatoria:\n\n• Conjunto: ${parseInt(line, 2)}\n• Vía seleccionada: ${randomIndex + 1}\n• Etiqueta a reemplazar: ${selectedWay}\n• Nueva etiqueta: ${tag}`,
    });

    delete currentSet[selectedWay];
    currentSet[tag] = this.memory.getBlock(directionHex);

    this.addStep({
      id: "load-memory",
      info: `Bloque cargado desde memoria principal:\n\n• Conjunto destino: ${parseInt(line, 2)}\n• Vía: ${randomIndex + 1}\n• Etiqueta en caché: ${tag}\n• Etiqueta buscada: ${tag}\n• Bloque: ${currentSet[tag]}\n• Tamaño: ${currentSet[tag].length * 4} bits`,
    });
  }
}

export type SetAssociativeCacheStep = Step &
  (
    | { id: "hex-to-binary" }
    | { id: "search-set" }
    | { id: "check-way" }
    | { id: "cache-hit" }
    | { id: "cache-miss" }
    | { id: "select-way" }
    | { id: "load-memory" }
  );

import { Cache } from "./Cache";
import {
  binary4BitToHex,
  parseHexAddress,
  randomBinaryChar,
  randomHexChar,
  randomInt,
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

      this.sets[setN][wayTag] = this.memory.getBlock(wayAddress);
    }
  }

  // Al final de cada clase, agregar:
  public resetVisualState() {
    super.resetVisualState();
    this.input = null;
    this.output = null;
    // Nota: no resetear this.tags, this.lines, this.sets porque contienen datos reales
  }

  // En SetAssociativeCache.ts, corrige el método executeGetLine:

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word } = parseHexAddress(hexAddress);
    const setNumber = line;

    // CORRECCIÓN: Inicializar conjunto si no existe o está vacío
    if (
      !this.sets[setNumber] ||
      Object.keys(this.sets[setNumber]).length === 0
    ) {
      this.initSet(setNumber);
    }

    this.addStep({
      id: "decode-address",
      info: `Dirección procesada - Conjunto ${setNumber} seleccionado de 4 posibles, etiqueta ${tag} para identificación, palabra ${word} dentro del bloque`,
    });

    this.addStep({
      id: "search-set",
      info: `Explorando las ${this.waysPerSet} vías del conjunto ${setNumber} en búsqueda de la etiqueta ${tag}`,
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
          info: `Vía ${wayIndex} en conjunto ${setNumber}: ¡ETIQUETA COINCIDE - ACIERTO!`,
        });
        break;
      } else {
        this.addStep({
          id: "check-way",
          info: `Vía ${wayIndex} en conjunto ${setNumber}: etiqueta diferente (${currentTag.substring(0, 12)}...) - continuando búsqueda`,
        });
      }
    }

    if (found) {
      const index = parseInt(word, 2) * 2;
      this.output = currentSet[foundTag].substring(index, index + 2);
      this.addStep({
        id: "cache-hit",
        info: `¡ACIERTO! Datos encontrados en conjunto ${setNumber}, vía ${wayIndex}. Valor recuperado: ${this.output}`,
      });
      return this.output;
    }

    this.addStep({
      id: "cache-miss",
      info: "FALLO - Etiqueta no encontrada en ninguna vía del conjunto. Se requiere acceso a memoria principal",
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
      info: `Política de reemplazo aleatoria: seleccionada vía ${selectedWay} (posición ${randomIndex + 1}) en conjunto ${line} para almacenar nuevo bloque`,
    });

    delete currentSet[selectedWay];
    currentSet[tag] = this.memory.getBlock(directionHex);

    this.addStep({
      id: "load-memory",
      info: `Bloque cargado desde memoria principal a conjunto ${line}, reemplazando vía ${selectedWay} con nueva etiqueta ${tag}`,
    });
  }
}

export type SetAssociativeCacheStep = Step &
  (
    | { id: "decode-address" }
    | { id: "search-set" }
    | { id: "check-way" }
    | { id: "cache-hit" }
    | { id: "cache-miss" }
    | { id: "select-way" }
    | { id: "load-memory" }
  );

import type { MemoryRegister } from "./memory-manager";
import {
  OperationError,
  OperationManager,
  OperationNextError,
  type Operation,
} from "./operation-manager";

interface CacheOperation extends Operation {
  step:
    | "check-line"
    | "check-tag"
    | "cache-success"
    | "cache-fail"
    | "set-register";
}

export class CacheManager extends OperationManager {
  lines: MemoryRegister[] = [];
  blocks: Record<string, string> = {};
  output!: string;
  public queue: CacheOperation[] = [];
  operationData!: {
    tag: string;
    line: number;
    wordIndex: number;
    hexString: string;
  };

  constructor() {
    super();
  }

  public next() {
    if (!this.hasNext()) throw new OperationNextError();

    const current = this.queue.shift()!;
    const { line, tag, wordIndex } = this.operationData;

    this.emit("operation", current);
    switch (current.step) {
      /**
       * Flujo de obtener dato de caché
       */
      case "check-line":
        if (this.lines[line]) {
          this.queue.push({
            step: "check-tag",
            info: "Verificando si la etiqueta del bloque en la linea coincide con la esperada",
          });
        } else {
          this.queue.push({
            step: "cache-fail",
            info: "Hay un fallo de cache, dando curso a la petición a memoria principal...",
          });
        }
        break;

      case "check-tag":
        if (this.lines[line].tag == tag) {
          this.queue.push({
            step: "cache-success",
            info: "hay un acierto de cache, enviando la palabra a la cpu...",
            value: this.blocks[tag].substring(wordIndex * 2, wordIndex * 2 + 3),
          });
        } else {
          this.queue.push({
            step: "cache-fail",
            info: "Hay un fallo de cache, dando curso a la petición a memoria principal...",
          });
        }
        break;
      case "cache-success":
        this.output = current.value as string;
        break;
      case "cache-fail":
        throw new OperationError("cache-fail");

      /**
       * Flujo de settear dato en cache
       */
      case "set-register": {
        const { line, tag, block } = current.value as {
          block: string;
          line: number;
          tag: string;
        };
        this.blocks[tag] = block;
        this.lines[line] = { tag, line };

        break;
      }
    }
  }

  public executeSetRegister(tag: string, line: number, block: string) {
    this.queue.push({
      step: "set-register",
      info: "",
      value: {
        tag, line, block
      }
    });
  }
  public executeGetCache(
    tag: string,
    line: number,
    wordIndex: number,
    hexString: string,
  ) {
    this.operationData = {
      tag,
      line,
      wordIndex,
      hexString,
    };

    this.queue.push({
      step: "check-line",
      info: `verificando si hay algún bloque en la linea:${line}`,
    });
  }
}

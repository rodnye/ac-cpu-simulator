import { hexTo4BitBinary } from "../utils/convert";
import { CacheManager } from "./cache-manager";
import { MemoryManager } from "./memory-manager";
import {
  OperationError,
  OperationManager,
  OperationNextError,
  type Operation,
} from "./operation-manager";

interface CpuOperation extends Operation {
  step: "get-cache" | "get-memory" | "set-cache" | "word";
}

export class CpuManager extends OperationManager<{ operation: CpuOperation }> {
  cacheManager: CacheManager;
  memoryManager: MemoryManager;
  operationData!: {
    tag: string;
    line: number;
    wordIndex: number;
    hexInput: string;
  };
  output!: string;

  constructor() {
    super();
    // grafo
    this.cacheManager = new CacheManager();
    this.memoryManager = new MemoryManager();
  }

  public next() {
    if (!this.hasNext()) throw new OperationNextError();

    const { line, tag, hexInput } = this.operationData;
    const current = this.queue.shift()!;
    this.emit("operation", current);

    switch (current.step) {
      case "get-cache":
        try {
          this.cacheManager.next();
          if (this.cacheManager.hasNext()) {
            this.queue.push({
              step: "get-cache",
              info: "Esperando respuesta de la cache",
            });
          } else {
            this.queue.push({
              step: "word",
              info: "Obteniendo palabra",
              value: this.cacheManager.output,
            });
          }
        } catch (e) {
          if (e instanceof OperationError) {
            this.memoryManager.executeGetWord(hexInput);
            this.queue.push({
              step: "get-memory",
              info: "Buscando en la memoria",
            });
          }
        }
        break;
      case "get-memory":
        this.memoryManager.next();
        if (!this.cacheManager.hasNext()) {
          const [word, block] = this.memoryManager.output;
          this.output = word;
          this.cacheManager.executeSetRegister(tag, line, block);
          this.queue.push({
            step: "set-cache",
            info: "Esperando seteo de caché...",
          });
        } else {
          this.queue.push({
            step: "get-memory",
            info: "Esperando respuesta de la memoria",
          });
        }
        break;
      case "set-cache": {
        this.cacheManager.next();
        if (!this.cacheManager.hasNext()) {
          this.queue.push({
            step: "word",
            info: "Obteniendo palabra...",
          });
        } else {
          this.queue.push({
            step: "set-cache",
            info: "Esperando seteo de caché...",
          });
        }
        break;
      }
      case "word":
        // ya el output se setteo
        break;
    }
  }

  executeGetDirectWord(hexInput: string) {
    const bits4 = hexTo4BitBinary(hexInput);
    const tag = bits4.substring(0, 9);
    const line = parseInt(bits4.substring(9, 23), 2);
    const wordIndex = parseInt(bits4.substring(23, 25));

    this.operationData = {
      tag: tag,
      line: line,
      wordIndex: wordIndex,
      hexInput,
    };

    this.cacheManager.executeGetCache(tag, line, wordIndex, hexInput);

    this.queue.push({
      step: "get-cache",
      info: "Buscando en el cache",
    });
  }
}

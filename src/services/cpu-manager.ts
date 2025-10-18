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
  step: 'get-cache' | 'get-memory' | 'word'
}

export class CpuManager extends OperationManager {
  cacheManager: CacheManager;
  memoryManager: MemoryManager;
  operationData!: {
    tag: string;
    line: number;
    wordIndex: number;
    hexInput: string;
  };
  output = null;
  queue: CpuOperation[] = [];

  public next() {
    if (!this.hasNext()) throw new OperationNextError();
    
    const {line, tag, hexInput} = this.operationData;
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
          if (this.cacheManager.hasNext()) {
            this.queue.push({
              step: "get-memory",
              info: "Esperando respuesta de la memoria",
            });
          } else {
            const [word, block] = this.memoryManager.output;
            this.cacheManager.executeSetRegister(tag, line, block);
            /*
            this.queue.push({
              step: "word",
              info: "Obteniendo palabra",
              value: this.memoryManager.output,
            });
            */
          }
        
        } catch (e) {
          if (e instanceof OperationError) {
            const [word, block] = this.memoryManager.getWord(hexInput);

            this.cacheManager.setRegister(tag, line, block);
          } else throw e;
        }
        break;
    }
  }

  constructor() {
    super();
    // grafo
    this.cacheManager = new CacheManager();
    this.memoryManager = new MemoryManager();
  }

  executeGetDirectWord(hexInput: string) {
    const bits4 = hexTo4BitBinary(hexInput);
    
    this.operationData = {
      tag: bits4.substring(0, 9),
      line: parseInt(bits4.substring(9, 23), 2),
      wordIndex: parseInt(bits4.substring(23, 25)),
      hexInput,
    };
    
    this.cacheManager.executeGetCache(
      this.operationData.tag, 
      this.operationData.line, 
      this.operationData.wordIndex, 
      this.operationData.hexInput
    );
    this.queue.push({
      step: "get-cache",
      info: "Buscando en el cache",
    });
  }
}

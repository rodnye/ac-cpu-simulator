import EventEmitter from "eventemitter3";
import { hexTo4BitBinary } from "../utils/convert";
import { CacheFail, CacheManager } from "./cache-manager";
import { MemoryManager } from "./memory-manager";

export class CPUManager extends EventEmitter {
  cacheManager: CacheManager;
  memoryManager: MemoryManager;

  constructor() {
    super();
    this.cacheManager = new CacheManager();
    this.memoryManager = new MemoryManager();
  }

  executeSearch(hexInput: string) {
    let string: string = hexTo4BitBinary(hexInput);

    try {
      this.cacheManager.getWord(hexInput);
    } catch (e) {
      if (e instanceof CacheFail) {
        const [word, block] = this.memoryManager.getWord(hexInput);
        this.emit("word", word);
        this.cacheManager.setRegister(block);
      }
    }
  }
}

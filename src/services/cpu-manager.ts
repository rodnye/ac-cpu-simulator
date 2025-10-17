import EventEmitter from "eventemitter3";
import { hexTo4BitBinary } from "../utils/convert";
import { CacheFail, CacheManager } from "./cache-manager";
import { MemoryManager } from "./memory-manager";

export class CPUManager extends EventEmitter<{ word: string }> {
  cacheManager: CacheManager;
  memoryManager: MemoryManager;

  constructor() {
    super();
    this.cacheManager = new CacheManager();
    this.memoryManager = new MemoryManager();
  }

  executeSearch(hexInput: string) {
    const string: string = hexTo4BitBinary(hexInput);
    const tag = string.substring(0, 9);
    const line = parseInt(string.substring(9, 23), 2);
    const wordIndex = parseInt(string.substring(23, 25));
    try {
      this.cacheManager.executeCache(tag, line, wordIndex, hexInput);
      this.cacheManager.next();
    } catch (e) {
      if (e instanceof CacheFail) {
        const [word, block] = this.memoryManager.getWord(hexInput);
        this.emit("word", word);
        this.cacheManager.setRegister(tag, line, block);
      }
    }
  }
}

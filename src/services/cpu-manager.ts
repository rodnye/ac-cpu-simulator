import { hexTo4BitBinary } from "../utils/convert";
import {
  CacheFail,
  DirectCacheManager,
  type CacheManager,
  type CacheRegister,
} from "./cache-manager";
import { MemoryManager } from "./memory-manager";

export class CPUManager  {
  cacheManager: CacheManager;
  memoryManager: MemoryManager;

  constructor() {
    this.cacheManager = new DirectCacheManager();
    this.memoryManager = new MemoryManager();
  }

  executeSearch(hexInput: string) {
    let string: string = "";
    for (let letter of hexInput) {
      string += hexTo4BitBinary(letter);
    }
    
    const query: CacheRegister = {
      tag: string.substring(0, 9),
      index: parseInt(string.substring(9, 23), 2),
      word: string.substring(23, 25),
    };
    
    try {
      this.cacheManager.receiveCacheRegister(query);
    } catch (e) {
      console.log("entro");
      if (e instanceof CacheFail) {
        console.log("entro x2");
        const { word, blockId } = this.memoryManager.getWord(query.tag);
        this.cacheManager.setRegister(blockId, word, query.tag);
      }
    }
  }
}

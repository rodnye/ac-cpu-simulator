import EventEmitter from "eventemitter3";
import { hexTo4BitBinary } from "../utils/convert";

export class CacheFail extends Error {}

class memoryRegister {
  tag: string;
  line: string;
  wordIndex: string;

  constructor(tag: string, line: string, wordIndex: string) {
    this.tag = tag;
    this.line = line;
    this.wordIndex = wordIndex;
  }
}

export class CacheManager extends EventEmitter {
  data!: memoryRegister[];
  blocks!: Record<string, string>;

  public getWord(string: string) {
    const binaryString: string = hexTo4BitBinary(string);
    const tag = binaryString.substring(0, 9);
    const wordIndex = parseInt(binaryString.substring(23, 25), 2);
    if (this.data[wordIndex]) {
      if (this.data[wordIndex].tag == tag) {
        const ret = this.blocks[tag].substring(
          wordIndex * 2,
          wordIndex * 2 + 3,
        );
        this.emit("cache-success", ret);
        return ret;
      }
    }

    this.emit("cache-fail", string);
    throw new CacheFail("cache-fail");
  }
}

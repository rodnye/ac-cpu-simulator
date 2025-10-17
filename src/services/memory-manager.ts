import { hexTo4BitBinary } from "../utils/convert";
import { arregloStrings } from "./directions";
import { CacheManager } from "./cache-manager";

export class MemoryManager {
  data: Record<string, string> = {};
  tags!: string[];
  abc: string = "0123456789ABCDEF";

  constructor() {
    this.initializeMemory();
  }

  private initializeMemory(): void {
    for (let i = 0; i < 15; i++) {
      this.data[arregloStrings[i]] = this.randomString(8);
    }
  }

  private randomString(num: number): string {
    let str = "";
    for (let i = 0; i < num; i++) {
      str += this.abc.charAt((Math.random() * 100) % 16);
    }
    return str;
  }

  public getWord(string: string) {
    const binary: string = hexTo4BitBinary(string);
    const tag = binary.substring(0, 9);
    const wordIndex = parseInt(binary.substring(23, 25), 2);
    CacheManager.setBlock(binary);
    return this.data[tag].substring(wordIndex * 2, wordIndex * 2 + 3);
  }
}

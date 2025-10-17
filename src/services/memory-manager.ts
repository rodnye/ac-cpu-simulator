import { hexTo4BitBinary } from "../utils/convert";
import { arregloStrings } from "./directions";
import EventEmitter from "eventemitter3";

export class MemoryManager extends EventEmitter<{
  data: MemoryManager["data"];
  "get-word": string;
}> {
  data: Record<string, string> = {};
  tags: string[] = [];
  abc: string = "0123456789ABCDEF";

  constructor() {
    super();
    this.initializeMemory();
  }

  private initializeMemory(): void {
    for (let i = 0; i < 15; i++) {
      this.data[arregloStrings[i].substring(0, 3)] = this.randomString(8);
    }
    this.emit("data", this.data);
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
    const tag = string.substring(0, 3);
    const wordIndex = parseInt(binary.substring(23, 25), 2);
    const ret = [
      this.data[tag].substring(wordIndex * 2, wordIndex * 2 + 3),
      this.data[tag],
    ];
    this.emit("get-word", ret);
    return ret;
  }
}

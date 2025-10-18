import { hexTo4BitBinary } from "../utils/convert";
import { arregloStrings } from "./directions";
import { OperationManager } from "./operation-manager";

const ABC = "0123456789ABCDEF";

export class MemoryManager extends OperationManager<{data: MemoryManager["data"]}> {
  data: Record<string, string> = {};
  tags: string[] = [];
  protected operationData!: Record<string, unknown>;
  public output!: string;

  constructor() {
    super();

    // initialize memory
    for (let i = 0; i < 15; i++) {
      this.data[arregloStrings[i].substring(0, 3)] = this.randomString(8);
    }
    this.emit("data", this.data);
  }

  private randomString(num: number): string {
    let str = "";
    for (let i = 0; i < num; i++) {
      str += ABC.charAt((Math.random() * 100) % 16);
    }
    return str;
  }

  public next () {
    if (!this.hasNext()) new 
  }


  public executeGetWord(hexString: string) {
    const binary: string = hexTo4BitBinary(hexString);
    const tag = hexString.substring(0, 3);
    const wordIndex = parseInt(binary.substring(23, 25), 2);
    this.queue.push({step: 'get-word', info: 'Obteniendo palabra...', value: {tag, wordIndex}});
  }

  public getWord(string: string) {
    const ret = [
      this.data[tag].substring(wordIndex * 2, wordIndex * 2 + 3),
      this.data[tag],
    ];
    this.emit("get-word", ret);
    return ret;
  }
}
export interface MemoryRegister {
  tag: string;
  line: number;
}


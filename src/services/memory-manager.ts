import { hexTo4BitBinary } from "../utils/convert";
import { arregloStrings } from "./directions";
import {
  OperationManager,
  OperationNextError,
  type Operation,
} from "./operation-manager";

const ABC = "0123456789ABCDEF";

export interface MemoryRegister {
  tag: string;
  line: number;
}

type MemoryOperation = Operation & {
  step: "get-word";
  value: {
    tag: string;
    wordIndex: number;
  };
};

export class MemoryManager extends OperationManager<{
  data: MemoryManager["data"];
  operation: MemoryOperation;
}> {
  data: Record<string, string> = {};
  tags: string[] = [];
  protected operationData!: Record<string, unknown>;

  /**
   * [word, block]
   */
  public output!: [string, string];

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

  public next() {
    if (!this.hasNext()) throw new OperationNextError();

    const current = this.queue.shift()!;

    if (current.step === "get-word") {
      const { tag, wordIndex } = current.value;
      this.output = [
        this.data[tag].substring(wordIndex * 2, wordIndex * 2 + 3),
        this.data[tag],
      ];
    }
  }

  public executeGetWord(hexString: string) {
    const binary: string = hexTo4BitBinary(hexString);
    const tag = hexString.substring(0, 3);
    const wordIndex = parseInt(binary.substring(23, 25), 2);
    this.queue.push({
      step: "get-word",
      info: "Obteniendo palabra...",
      value: { tag, wordIndex },
    });
  }
}

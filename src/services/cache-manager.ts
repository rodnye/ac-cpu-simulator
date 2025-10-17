import EventEmitter from "eventemitter3";

export class CacheFail extends Error {}

class MemoryRegister {
  tag: string;
  line: number;

  constructor(tag: string, line: number) {
    this.tag = tag;
    this.line = line;
  }
}

class Operation {
  step: string;
  description: string;
  value: any;

  constructor(step: string, description: string, value: any) {
    this.step = step;
    this.description = description;
    this.value = value;
  }
}

export class CacheManager extends EventEmitter<{
  "cache-success": string;
  "cache-fail": string;
}> {
  queue: Operation[] = [];
  data: MemoryRegister[] = [];
  blocks: Record<string, string> = {};
  private globalData!: {
    tag: string;
    line: number;
    wordIndex: number;
    hexString: string;
    output: any;
  };
  public output: any;
  public setRegister(tag: string, line: number, block: string) {
    this.blocks[tag] = block;
    this.data[line] = new MemoryRegister(tag, line);
  }

  private throwError(hexString: string) {
    this.emit("cache-fail", hexString);
    throw new CacheFail("cache-fail");
  }

  private verifyTag(bloque: MemoryRegister, tag: string, wordIndex: number) {
    if (bloque.tag == tag) {
      this.queue.push(
        new Operation(
          "send-word",
          "hay un acierto de cache, enviando la palabra a la cpu...",
          this.blocks[tag].substring(wordIndex * 2, wordIndex * 2 + 3),
        ),
      );
    } else {
      this.queue.push(
        new Operation(
          "cache-fail",
          "hay un fallo de chache, dando curso a la peticion a memoria principal...",
          null,
        ),
      );
    }
  }

  public next(): boolean {
    if (!this.queue.length) return false;
    const actual = this.queue.shift();
    let line, tag, wordIndex;

    console.log(actual?.step);
    switch (actual!.step) {
      case "check-line":
        line = this.globalData.line;
        tag = this.globalData.tag;
        wordIndex = this.globalData.wordIndex;

        if (this.data[line]) {
          this.queue.push(
            new Operation(
              "check-tag",
              "verificando si la etiqueta del bloque en la linea coincide con la esperada",
              null,
            ),
          );
        } else {
          this.queue.push(
            new Operation(
              "cache-fail",
              "hay un fallo de chache, dando curso a la peticion a memoria principal...",
              null,
            ),
          );
        }
        break;
      case "check-tag":
        line = this.globalData.line;
        tag = this.globalData.tag;
        wordIndex = this.globalData.wordIndex;
        this.verifyTag(this.data[line], tag, wordIndex);
        break;
      case "throw-error":
        this.throwError(this.globalData.hexString);
        break;
      case "send-word":
        this.output = this.globalData.output;
        break;
      case "cache-fail":
        this.throwError(this.globalData.hexString);
        break;
      default:
        break;
    }

    return false;
  }

  public executeCache(
    tag: string,
    line: number,
    wordIndex: number,
    hexString: string,
  ) {
    this.globalData = {
      tag,
      line,
      wordIndex,
      hexString,
      output: null,
    };
    const op = new Operation(
      "check-line",
      `verificando si hay algun bloque en la linea${line}`,
      null,
    );

    this.queue.push(op);
  }
}

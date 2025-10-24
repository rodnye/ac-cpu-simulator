import { binToHex, type Bin, type Hex } from "../../utils/convert";

export const MEMORY_LEN = Math.pow(2, 22);

export class Memory {
  /**
   * Simula la memoria principal del modelo IAS con 32 bits de direccionamiento
   */
  public getBlock(binTag: Bin): Bin {
    // validar que el tag sea de máximo 22 bits
    const paddedTag = binTag.padStart(22, "0");
    if (paddedTag.length > 22) {
      throw new Error("El tag debe ser de máximo 22 bits");
    }
    const firstPart = paddedTag.substring(14, 22) || "00000000";
    const firstWord = this.xorWithPattern(firstPart, "10101010");
    const secondPart = paddedTag.substring(6, 14) || "00000000"; 
    const secondWord = this.xorWithPattern(secondPart, "11001100");
    const thirdPart = paddedTag.substring(0, 6).padEnd(8, "0");
    const thirdWord = this.xorWithPattern(thirdPart, "11110000");
    const fourPart = paddedTag.substring(3, 9).padEnd(8, "0");
    const fourWord = this.xorWithPattern(fourPart, "10111111");

    const binary = (firstWord + secondWord + thirdWord + fourWord).split("").reverse().join("");

    return binary.substring(0, 32) as Bin; //asegurar 32 bits
  }

  private xorWithPattern(bits: string, pattern: string): string {
    const result = [];
    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i];
      const patternBit = pattern[i % pattern.length];
      result.push(bit === patternBit ? "0" : "1");
    }
    return result.join("");
  }

  /**
   *iterador para visualizar rangos de memoria
   */
  public *createIterator(
    start: number,
    end: number,
  ): IterableIterator<{
    tag: Bin;
    block: Bin;
    blockHex: Hex;
  }> {
    for (let i = start; i < end && i < MEMORY_LEN; i++) {
      const tag = i.toString(2).padStart(22, "0") as Bin;
      const block = this.getBlock(tag);
      yield {
        tag,
        block,
        blockHex: binToHex(block),
      };
    }
  }
}
import type { Bin } from "../../../utils/convert";

export interface DirectCacheEntry {
  tag: Bin;
  block: Bin;
}

export class DirectCache {
  private cachedLines: Record<Bin, DirectCacheEntry> = {};

  /**
   * Complejidad O(1) por eso es caché directa XD
   * @param line : un binario de 14 bits
   */
  public getLine(line: Bin): DirectCacheEntry {
    const linePadded = line.padStart(14, "0") as Bin;

    // si la linea tiene datos cacheados, retornarlos
    if (this.cachedLines[linePadded]) return this.cachedLines[linePadded];
    else {
      // si no, retornar un placeholder constante (esto asegura que siempre halla datos en cache [churre]):
      let expanded: string = linePadded;
      while (expanded.length < 32) expanded += linePadded;
      const totalBits = expanded.split("").reverse().join("").substring(0, 32);
      return {
        tag: totalBits.substring(0, 8) as Bin,
        block: totalBits.substring(8, 32) as Bin,
      };
    }
  }

  public getWord(line: Bin, word: Bin): Bin {
    const index = parseInt(word, 2) * 2;
    return this.getLine(line).block.substring(index, index + 2) as Bin;
  }

  public setLine(line: Bin, cacheEntry: DirectCacheEntry) {
    this.cachedLines[line.padStart(14, "0") as Bin] = cacheEntry;
  }
  
  public *createIterator(
    start: number,
    end?: number,
  ): IterableIterator<DirectCacheEntry> {
    if (end === undefined) end = start + 20;
    //const max14Bit = Math.pow(2, 14) - 1; //16383

    for (let i = start; i <= end; i++) {
      const binaryLine = i.toString(2) as Bin;
      yield this.getLine(binaryLine);
    }
  }

}
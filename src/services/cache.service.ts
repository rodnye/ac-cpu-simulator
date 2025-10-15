export interface CacheRegister {
  tag: string;
  index: number;
  word: string;
}

export class CacheFail extends Error {}

export abstract class CacheManager {
  data: CacheRegister[] = [];
  abstract receiveCacheRegister(a: any): string;
  abstract setRegister(b: number, word: string, tag: string): void;
}

export class DirectCacheManager extends CacheManager {
  data: CacheRegister[] = [];

  receiveCacheRegister(target: CacheRegister) {
    let registerMatch = this.data[target.index] || null;

    if (registerMatch.tag === target.tag) return registerMatch.word;
    throw new CacheFail("No se encontro");
  }

  // FIXME
  setRegister(blockId: number, word: string, tag: string) {
    this.data[blockId] = {
      tag,
      word,
      index: blockId,
    };
  }
}

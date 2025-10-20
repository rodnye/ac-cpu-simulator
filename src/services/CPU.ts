import { CacheDirecta } from "./DirectCache";
import { Operation } from "./DataQueue";
import { CacheAsociativa } from "./AssociativeCache";
import { SetAssociativeCache } from "./SetAssociativeCache";
import { Memory } from "./Memory";

export class CPU {
  memory: Memory;
  cacheDirect: CacheDirecta;
  cacheAssociative: CacheAsociativa;
  setAssociativeCache: SetAssociativeCache;
  operaciones: Operation[] = [];

  constructor() {
    this.memory = new Memory();
    this.cacheDirect = new CacheDirecta(this.memory);
    this.cacheAssociative = new CacheAsociativa(this.memory);
    this.setAssociativeCache = new SetAssociativeCache(this.memory);
  }

  public startDirectCache(direccionHex: string) {
    this.cacheDirect.executeCache(direccionHex);
  }

  public startAssociativeCache(direccionHex: string) {
    this.cacheAssociative.executeCache(direccionHex);
  }

  public startSetAssociativeCache(direccionHex: string) {
    this.setAssociativeCache.executeCache(direccionHex);
  }
}

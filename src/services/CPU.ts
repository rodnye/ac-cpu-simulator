import { CacheDirecta } from "./DirectCache";
import { Operation } from "./DataQueue";
import { CacheAsociativa } from "./AssociativeCache";
import { Memory } from "./Memory";

export class CPU {
  memory: Memory;
  cacheDirect: CacheDirecta;
  cacheAssociative: CacheAsociativa;
  operaciones: Operation[] = [];

  constructor() {
    this.memory = new Memory();
    this.cacheDirect = new CacheDirecta(this.memory);
    this.cacheAssociative = new CacheAsociativa(this.memory);
  }

  public startDirectCache(direccionHex: string) {
    this.cacheDirect.executeCache(direccionHex);
  }

  public startAssociativeCache(direccionHex: string) {
    this.cacheAssociative.executeCache(direccionHex);
  }
}

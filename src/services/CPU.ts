import { CacheDirecta } from "./DirectCache";
import { Operation } from "./DataQueue";

export class CPU {
  cache: CacheDirecta;
  operaciones: Operation[] = [];

  constructor() {
    this.cache = new CacheDirecta();
  }

  public start(direccionHex: string) {
    this.cache.executeCache(direccionHex);
  }
}

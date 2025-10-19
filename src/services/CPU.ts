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

  public next() {
    if (this.cache.hasNext()) {
      const operacion = this.cache.next();
      if (operacion) {
        console.log(operacion.info);
        this.operaciones.push(operacion);
      }
    }
  }
}

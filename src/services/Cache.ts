import { Operation } from "./DataQueue";

export abstract class Cache {
  public queue: Operation[];
  protected lineas: (CacheEntry | null)[];
  protected numLineas: number;

  constructor() {
    this.queue = [];
    this.numLineas = 12;
    this.lineas = new Array(12).fill(null);
  }

  public hasNext(): boolean {
    return this.queue.length > 0;
  }

  public getLineas(): (CacheEntry | null)[] {
    return this.lineas;
  }
  abstract setBlock(linea: number, tag: string, bloque: string): void;
  abstract executeCache(hexInput: string): void;
  abstract next(): any;
}

export interface CacheEntry {
  tag: string;
  bloque: string;
}

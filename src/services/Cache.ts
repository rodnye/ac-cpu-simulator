import EventEmitter from "eventemitter3";

export interface CacheEntry {
  tag: string;
  bloque: string;
}

export interface Step {
  step: string;
  description: string;
  value?: any;
}

export abstract class Cache extends EventEmitter {
  protected lineas: (CacheEntry | null)[];
  protected steps: Step[] = [];

  constructor(numLineas: number = 16384) {
    super();
    this.lineas = new Array(numLineas).fill(null);
  }

  public getSteps(): Step[] {
    return this.steps;
  }

  public hasNext(): boolean {
    return this.steps.length > 0;
  }

  public abstract executeCache(direccionHex: string): void;

  public next() {
    const actualStep = this.steps.shift();
    console.log(actualStep);
    this.emit("step", actualStep);
  }

  protected addStep(step: string, description: string, value?: any) {
    this.steps.push({ step, description, value });
  }
}

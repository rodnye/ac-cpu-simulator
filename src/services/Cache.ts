export interface CacheEntry {
  tag: string;
  bloque: string;
}

export interface Step {
  step: string;
  description: string;
  value?: any;
}

export abstract class Cache {
  protected lineas: (CacheEntry | null)[];
  protected steps: Step[] = [];

  constructor(numLineas: number = 16384) {
    this.lineas = new Array(numLineas).fill(null);
  }

  public getSteps(): Step[] {
    return this.steps;
  }

  public abstract executeCache(direccionHex: string): void;

  protected addStep(step: string, description: string, value?: any) {
    this.steps.push({ step, description, value });
  }
}

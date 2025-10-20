import { StepManager, type Step } from "../StepManager";

export interface CacheEntry {
  tag: string;
  block: string;
}

export abstract class Cache<S extends Step> extends StepManager<S> {
  lines: (CacheEntry | null)[];
  input: string | null = null;
  output: string | null = null;

  constructor(linesLen: number = 16384) {
    super();
    this.lines = new Array(linesLen).fill(null);
  }

  public abstract executeGetLine(direccionHex: string): void;
  public abstract executeSetLine(line: number, entry: CacheEntry): void;
}

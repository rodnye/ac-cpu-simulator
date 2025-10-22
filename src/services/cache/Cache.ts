import type { Memory } from "../Memory";
import { StepManager, type Step } from "../StepManager";

export type CacheType = "direct" | "set-associative" | "associative";

export abstract class Cache<S extends Step> extends StepManager<S> {
  memory: Memory;
  lines: Record<string, string>;
  input: string | null = null;
  output: string | null = null;

  constructor(memory: Memory, linesLen: number = 16384) {
    super();
    this.memory = memory;
    this.lines = {};
  }

  public abstract executeGetLine(direccionHex: string): void;
  public abstract executeSetLine(direccionHex: string): void;

  // Nuevo método para reset específico de cache
  public resetVisualState() {
    super.resetVisualState();
    // Nota: no resetear this.lines porque contiene datos reales de cache
    this.input = null;
    this.output = null;
  }
}

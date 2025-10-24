import { StepController, type Step } from "./StepController";
import type { MemoryController } from "./MemoryController";

export type CacheType = "direct" | "set-associative" | "associative";

export abstract class CacheController<S extends Step> extends StepController<S> {
  memory: MemoryController;

  constructor(memory: MemoryController) {
    super();
    this.memory = memory;
  }
}

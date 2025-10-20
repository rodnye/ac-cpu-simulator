import { DirectCache, type DirectCacheStep } from "./cache/DirectCache";
import { StepManager, StepNextError, type Step } from "./StepManager";
import { Memory, type MemoryStep } from "./Memory";

export type CpuStep = Step &
  (
    | {
        id: `cache:${string}`;
        value: DirectCacheStep[];
      }
    | {
        id: `memory:${string}`;
        value: MemoryStep[];
      }
    | {
        id: "get-word";
        value: string;
      }
  );

  export type CpuStepValueLessDTO = Omit<CpuStep, "value">;

export class Cpu extends StepManager<CpuStep> {
  cache: DirectCache;
  memory: Memory;

  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
    this.cache = new DirectCache();
    this.memory = new Memory();
  }

  public next() {
    if (!this.hasNext()) throw new StepNextError();

    const currentStep = this.steps[0];
    this.emit("step", currentStep);

    if (currentStep.id.startsWith("cache:")) {
      this.cache.setSteps(currentStep.value as DirectCacheStep[]);
      if (this.cache.hasNext()) this.cache.next();
      else this.steps.shift();
    } else if (currentStep.id.startsWith("memory:")) {
      this.memory.setSteps(currentStep.value as MemoryStep[]);
      if (this.memory.hasNext()) this.memory.next();
      else this.steps.shift();
    } else this.steps.shift();

    return currentStep;
  }

  public executeGetWord(direccionHex: string) {
    const { tag, line } = Cpu.parseHexAddress(direccionHex);
    
    const cachedValue = this.cache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: "Esperando respuesta de la caché",
      value: this.cache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.executeGetBlock(
        tag as keyof typeof Memory.directCacheStrings,
      );
      this.addStep({
        id: "memory:get-block",
        info: "Esperando respuesta de la memoria",
        value: this.memory.getSteps(),
      });

      this.cache.executeSetLine(line, {
        tag,
        block,
      });
      this.addStep({
        id: "cache:set-line",
        info: "Cargando bloque en la caché",
        value: this.cache.getSteps(),
      });

      this.output = block;
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: "Palabra obtenida exitosamente",
      value: this.output,
    });
    
    this.emit("execute", "get-word");
    return this.output;
  }

  // Utils
  public static parseHexAddress(hexAddress: string) {
    const binary = parseInt(hexAddress, 16).toString(2).padStart(24, "0");
    return {
      tag: binary.slice(0, 8),
      line: parseInt(binary.slice(8, 22), 2),
      word: binary.slice(22),
    };
  }
}

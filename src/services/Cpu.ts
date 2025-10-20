// Cpu.ts - Actualizado con nuevas funcionalidades
import { DirectCache, type DirectCacheStep } from "./cache/DirectCache";
import {
  AssociativeCache,
  type AssociativeCacheStep,
} from "./cache/AssociativeCache";
import { StepManager, StepNextError, type Step } from "./StepManager";
import { Memory, type MemoryStep } from "./Memory";

export type CpuStep = Step &
  (
    | {
        id: `cache:${string}`;
        value: DirectCacheStep[];
      }
    | {
        id: `set-cache:${string}`;
        value: AssociativeCacheStep[];
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

export class Cpu extends StepManager<CpuStep> {
  directCache: DirectCache;
  associativeCache: AssociativeCache;
  memory: Memory;

  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
    this.directCache = new DirectCache();
    this.associativeCache = new AssociativeCache();
    this.memory = new Memory();
  }

  public next() {
    if (!this.hasNext()) throw new StepNextError();

    const currentStep = this.steps[0];
    this.emit("step", currentStep);

    if (currentStep.id.startsWith("cache:")) {
      this.directCache.setSteps(currentStep.value as DirectCacheStep[]);
      if (this.directCache.hasNext()) this.directCache.next();
      else this.steps.shift();
    } else if (currentStep.id.startsWith("set-cache:")) {
      this.associativeCache.setSteps(
        currentStep.value as AssociativeCacheStep[],
      );
      if (this.associativeCache.hasNext()) this.associativeCache.next();
      else this.steps.shift();
    } else if (currentStep.id.startsWith("memory:")) {
      this.memory.setSteps(currentStep.value as MemoryStep[]);
      if (this.memory.hasNext()) this.memory.next();
      else this.steps.shift();
    } else this.steps.shift();

    return currentStep;
  }

  public executeGetWordDirect(direccionHex: string) {
    const { tag, line, word } = Cpu.parseHexAddress(direccionHex);

    const cachedValue = this.directCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: "Esperando respuesta de la caché directa",
      value: this.directCache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.executeGetDirectBlock(tag);
      this.addStep({
        id: "memory:get-block",
        info: "Esperando respuesta de la memoria",
        value: this.memory.getSteps(),
      });

      this.directCache.executeSetLine(line, { tag, block });
      this.addStep({
        id: "cache:set-line",
        info: "Cargando bloque en la caché directa",
        value: this.directCache.getSteps(),
      });

      this.output = this.memory.executeGetDirectWord(tag, word);
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

  public executeGetWordSetAssociative(direccionHex: string) {
    const { tag, line, word } = Cpu.parseHexAddress(direccionHex);

    const cachedValue = this.associativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "set-cache:get-cache",
      info: "Esperando respuesta de la caché asociativa por conjuntos",
      value: this.associativeCache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.executeGetDirectBlock(tag);
      this.addStep({
        id: "memory:get-block",
        info: "Esperando respuesta de la memoria",
        value: this.memory.getSteps(),
      });

      this.associativeCache.executeSetLine(line, { tag, block });
      this.addStep({
        id: "set-cache:set-line",
        info: "Cargando bloque en la caché asociativa por conjuntos",
        value: this.associativeCache.getSteps(),
      });

      this.output = this.memory.executeGetDirectWord(tag, word);
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

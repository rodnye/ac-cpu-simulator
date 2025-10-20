// Cpu.ts - Actualizado con nuevas funcionalidades
import { DirectCache, type DirectCacheStep } from "./cache/DirectCache";
import {
  SetAssociativeCache,
  type SetAssociativeCacheStep,
} from "./cache/SetAssociativeCache";
import { StepManager, StepNextError, type Step } from "./StepManager";
import { Memory, type MemoryStep } from "./Memory";
import { hexTo4BitBinary } from "../utils/convert";

export type CpuStep = Step &
  (
    | {
        id: `cache:${string}`;
        value: DirectCacheStep[];
      }
    | {
        id: `set-cache:${string}`;
        value: SetAssociativeCacheStep[];
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
  associativeCache: SetAssociativeCache;
  memory: Memory;

  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
    this.directCache = new DirectCache();
    this.associativeCache = new SetAssociativeCache();
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
        currentStep.value as SetAssociativeCacheStep[],
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
  static parseHexAddress(direccionHex: string): {
    tag: string;
    line: number;
    word: string;
  } {
    const bin = hexTo4BitBinary(direccionHex);
    return {
      tag: direccionHex.substring(0, 2),
      line: parseInt(bin.substring(8, 23)) % 20,
      word: bin.substring(22, 24),
    };
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
}

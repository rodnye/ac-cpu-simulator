/* eslint-disable @typescript-eslint/no-explicit-any */
import { DirectCache, type DirectCacheStep } from "./cache/DirectCache";
import {
  SetAssociativeCache,
  type SetAssociativeCacheStep,
} from "./cache/SetAssociativeCache";
import { StepManager, StepNextError, type Step } from "./StepManager";
import { Memory, type MemoryStep } from "./Memory";
import { parseHexAddress, parseHexAssociativeAddress } from "../utils/convert";
import { AssociativeCache } from "./cache/AssociativeCache";

export type CpuStep = Step &
  // FIXME: eliminar estos any
  (| {
        id: `cache:${string}`;
        value: DirectCacheStep[] | any[];
      }
    | {
        id: `set-cache:${string}`;
        value: SetAssociativeCacheStep[] | any[];
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
  setAssociativeCache: SetAssociativeCache;
  associativeCache: AssociativeCache;

  memory: Memory;

  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
    this.memory = new Memory();
    this.directCache = new DirectCache(this.memory);
    this.setAssociativeCache = new SetAssociativeCache(this.memory);
    this.associativeCache = new AssociativeCache(this.memory);
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
      this.setAssociativeCache.setSteps(
        currentStep.value as SetAssociativeCacheStep[],
      );
      if (this.setAssociativeCache.hasNext()) this.setAssociativeCache.next();
      else this.steps.shift();
    } else if (currentStep.id.startsWith("memory:")) {
      this.memory.setSteps(currentStep.value as MemoryStep[]);
      if (this.memory.hasNext()) this.memory.next();
      else this.steps.shift();
    } else this.steps.shift();

    return currentStep;
  }

  public executeGetWordDirect(direccionHex: string) {
    const { tag, line, word } = parseHexAddress(direccionHex);

    const cachedValue = this.directCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: "Esperando respuesta de la caché directa",
      value: this.directCache.getSteps(),
    });

    if (cachedValue === null) {
      this.addStep({
        id: "memory:get-block",
        info: "Esperando respuesta de la memoria",
        value: this.memory.getSteps(),
      });

      this.directCache.executeSetLine(direccionHex);
      this.addStep({
        id: "cache:set-line",
        info: "Cargando bloque en la caché directa",
        value: this.directCache.getSteps(),
      });

      this.output = this.directCache.getWord(line, word);
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Palabra obtenida exitosamente: ${this.output}`,
      value: this.output,
    });

    this.emit("execute", "get-word");
    return this.output;
  }

  public executeGetWordSetAssociative(direccionHex: string) {
    const cachedValue = this.setAssociativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "set-cache:get-cache",
      info: "Esperando respuesta de la caché asociativa por conjuntos",
      value: this.setAssociativeCache.getSteps(),
    });

    if (cachedValue === null) {
      this.addStep({
        id: "memory:get-block",
        info: "Esperando respuesta de la memoria",
        value: this.memory.getSteps(),
      });

      this.setAssociativeCache.executeSetLine(direccionHex);
      this.addStep({
        id: "set-cache:set-line",
        info: "Cargando bloque en la caché asociativa por conjuntos",
        value: this.setAssociativeCache.getSteps(),
      });

      this.output = this.setAssociativeCache.getWord(direccionHex);
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

  public executeGetWordAssociative(direccionHex: string) {
    const { tag, word } = parseHexAssociativeAddress(direccionHex);

    const cachedValue = this.associativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: "Esperando respuesta de la caché totalmente asociativa",
      value: this.associativeCache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.getBlock(tag);
      this.addStep({
        id: "memory:get-block",
        info: "Esperando respuesta de la memoria",
        value: this.memory.getSteps(),
      });

      this.associativeCache.executeSetLine(direccionHex);
      this.addStep({
        id: "cache:set-line",
        info: "Cargando bloque en la caché totalmente asociativa",
        value: this.associativeCache.getSteps(),
      });

      this.output = this.associativeCache.getWord(tag, word);
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

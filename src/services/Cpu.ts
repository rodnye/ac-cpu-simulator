/* eslint-disable @typescript-eslint/no-explicit-any */
import { DirectCache, type DirectCacheStep } from "./cache/DirectCache";
import {
  SetAssociativeCache,
  type SetAssociativeCacheStep,
} from "./cache/SetAssociativeCache";
import { StepManager, StepNextError, type Step } from "./StepManager";
import { Memory, type MemoryStep } from "./Memory";
import { hexTo4BitBinary } from "../utils/convert";
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
    this.directCache = new DirectCache();
    this.setAssociativeCache = new SetAssociativeCache();
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
    const { tag, line, word } = Cpu.parseHexAddress(direccionHex);

    const cachedValue = this.directCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: `Buscando direccion ${direccionHex}`,
      value: this.directCache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.executeGetDirectBlock(tag);
      this.addStep({
        id: "memory:get-block",
        info: "Solicitud enviada",
        value: this.memory.getSteps(),
      });

      this.directCache.executeSetLine(line, { tag, block });
      this.addStep({
        id: "cache:set-line",
        info: "Almacenando bloque en caché directa",
        value: this.directCache.getSteps(),
      });

      this.output = this.memory.executeGetDirectWord(tag, word);
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Palabra recibida: ${this.output}`,
      value: this.output,
    });

    this.emit("execute", "get-word");
    return this.output;
  }

  public executeGetWordSetAssociative(direccionHex: string) {
    const { tag, line, word } = Cpu.parseHexAddress(direccionHex);

    const cachedValue = this.setAssociativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "set-cache:get-cache",
      info: `Buscando direccion ${direccionHex}`,
      value: this.setAssociativeCache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.executeGetDirectBlock(tag);
      this.addStep({
        id: "memory:get-block",
        info: "Solicitud enviada",
        value: this.memory.getSteps(),
      });

      this.setAssociativeCache.executeSetLine(line, { tag, block });
      this.addStep({
        id: "set-cache:set-line",
        info: "Almacenando bloque en caché asociativa por conjuntos",
        value: this.setAssociativeCache.getSteps(),
      });

      this.output = this.memory.executeGetDirectWord(tag, word);
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Dato recibido: ${this.output}`,
      value: this.output,
    });

    this.emit("execute", "get-word");
    return this.output;
  }

  public executeGetWordAssociative(direccionHex: string) {
    const { tag, word } = Cpu.parseHexAssociativeAddress(direccionHex);

    const cachedValue = this.associativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: `Buscando direccion ${direccionHex}`,
      value: this.associativeCache.getSteps(),
    });

    if (cachedValue === null) {
      const block = this.memory.executeGetAssociativeBlock(tag);
      this.addStep({
        id: "memory:get-block",
        info: "Solicitud enviada",
        value: this.memory.getSteps(),
      });

      // Selección de línea y carga del bloque
      this.associativeCache.executeSetLine(0, { tag, block }); // línea se ignora internamente
      this.addStep({
        id: "cache:set-line",
        info: "Almacenando bloque en caché asociativa",
        value: this.associativeCache.getSteps(),
      });

      this.output = this.memory.executeGetAssociativeWord(tag, word);
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Dato recibido: ${this.output}`,
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
      line: parseInt(bin.substring(8, 22), 2),
      word: bin.substring(22, 24),
    };
  }

  static parseHexAssociativeAddress(direccionHex: string): {
    tag: string;
    word: string;
  } {
    const bin = hexTo4BitBinary(direccionHex);
    return {
      tag: direccionHex.substring(0, 22),
      word: bin.substring(22, 24),
    };
  }
}

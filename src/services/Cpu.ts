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
  (
    | {
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
      if (this.directCache.hasNext()) {
        this.directCache.next();
      } else {
        this.steps.shift(); // Solo remover cuando no hay más sub-pasos
      }
    } else if (currentStep.id.startsWith("set-cache:")) {
      this.setAssociativeCache.setSteps(
        currentStep.value as SetAssociativeCacheStep[],
      );
      if (this.setAssociativeCache.hasNext()) {
        this.setAssociativeCache.next();
      } else {
        this.steps.shift();
      }
    } else if (currentStep.id.startsWith("memory:")) {
      this.memory.setSteps(currentStep.value as MemoryStep[]);
      if (this.memory.hasNext()) {
        this.memory.next();
      } else {
        this.steps.shift();
      }
    } else {
      this.steps.shift(); // Paso simple sin sub-pasos
    }

    return currentStep;
  }

  public executeGetWordDirect(direccionHex: string) {
    this.setSteps([]); // Limpiar pasos anteriores
    const { tag, line, word } = parseHexAddress(direccionHex);

    // Paso 1: Intentar obtener de caché
    const cachedValue = this.directCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: `Solicitando datos a la caché directa para la dirección ${direccionHex}`,
      value: [...this.directCache.getSteps()], // Copia del array
    });

    if (cachedValue === null) {
      // Cache miss - Obtener de memoria
      const memoryBlock = this.memory.getBlock(direccionHex);
      this.addStep({
        id: "memory:get-block",
        info: `Fallo de caché - Bloque ${memoryBlock} obtenido desde memoria principal para la dirección ${direccionHex}`,
        value: [...this.memory.getSteps()],
      });

      // Cargar bloque en caché
      this.directCache.executeSetLine(direccionHex);
      this.addStep({
        id: "cache:set-line",
        info: `Transferiendo bloque desde memoria principal a caché directa (Línea ${line})`,
        value: [...this.directCache.getSteps()],
      });

      // Obtener palabra específica del bloque cargado
      this.output = this.directCache.getWord(line, word);
    } else {
      // Cache hit
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Operación completada - Palabra ${this.output} entregada al procesador`,
      value: this.output!,
    });

    this.emit("execute", "get-word");
    return this.output;
  }

  // Los métodos executeGetWordSetAssociative y executeGetWordAssociative
  // necesitan correcciones similares pero los mantengo igual por brevedad
  public executeGetWordSetAssociative(direccionHex: string) {
    this.setSteps([]);
    const cachedValue = this.setAssociativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "set-cache:get-cache",
      info: `Solicitando datos a la caché asociativa por conjuntos para la dirección ${direccionHex}`,
      value: [...this.setAssociativeCache.getSteps()],
    });

    if (cachedValue === null) {
      const memoryBlock = this.memory.getBlock(direccionHex);
      this.addStep({
        id: "memory:get-block",
        info: `Fallo de caché - Bloque ${memoryBlock} obtenido desde memoria principal`,
        value: [...this.memory.getSteps()],
      });

      this.setAssociativeCache.executeSetLine(direccionHex);
      this.addStep({
        id: "set-cache:set-line",
        info: `Transferiendo bloque desde memoria principal a caché asociativa por conjuntos`,
        value: [...this.setAssociativeCache.getSteps()],
      });

      this.output = this.setAssociativeCache.getWord(direccionHex);
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Operación completada - Palabra ${this.output} entregada al procesador`,
      value: this.output!,
    });

    this.emit("execute", "get-word");
    return this.output;
  }

  public executeGetWordAssociative(direccionHex: string) {
    this.setSteps([]);
    const { tag, word } = parseHexAssociativeAddress(direccionHex);

    const cachedValue = this.associativeCache.executeGetLine(direccionHex);
    this.addStep({
      id: "cache:get-cache",
      info: `Solicitando datos a la caché totalmente asociativa para la dirección ${direccionHex}`,
      value: [...this.associativeCache.getSteps()],
    });

    if (cachedValue === null) {
      const block = this.memory.getBlock(direccionHex); // Usar dirección completa
      this.addStep({
        id: "memory:get-block",
        info: `Fallo de caché - Bloque ${block} obtenido desde memoria principal`,
        value: [...this.memory.getSteps()],
      });

      this.associativeCache.executeSetLine(direccionHex);
      this.addStep({
        id: "cache:set-line",
        info: `Transferiendo bloque desde memoria principal a caché totalmente asociativa`,
        value: [...this.associativeCache.getSteps()],
      });

      this.output = this.associativeCache.getWord(tag, word);
    } else {
      this.output = cachedValue;
    }

    this.addStep({
      id: "get-word",
      info: `Operación completada - Palabra ${this.output} entregada al procesador`,
      value: this.output!,
    });

    this.emit("execute", "get-word");
    return this.output;
  }
}

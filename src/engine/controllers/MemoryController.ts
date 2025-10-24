import { Memory, MEMORY_LEN } from "../core/Memory";
import { StepController, type Step } from "./StepController";
import { binToHex } from "../../utils/convert";
import type { Bin } from "../../utils/convert";

export class MemoryController extends StepController<MemoryStep> {
  public memory = new Memory();

  /**
   * Ejecuta una lectura de memoria para obtener un bloque completo
   * @param binTag - Tag en formato hexadecimal (hasta 22 bits)
   * @returns El bloque de datos recuperado
   */
  public executeGetBlock(binTag: Bin): Bin {
    this.emit("execute", "get-block");
    this.setSteps([]);

    if (!binTag || binTag.length > 22) {
      throw new Error(
        "Tag binario debe ser de máximo 22 caracteres (22 bits)",
      );
    }

    this.addStep({
      id: "memory-start",
      actions: [
        {
          type: "text",
          text: `Iniciando lectura de memoria - Tag: ${binToHex(binTag)}`,
        },
        {
          type: "text",
          target: "extra",
          text: `La memoria principal recibe solicitud para leer el bloque correspondiente al tag ${binTag}. La memoria tiene capacidad de ${MEMORY_LEN.toLocaleString()} palabras (2^22).`,
        },
      ],
    });

    // Acceso a memoria
    this.addStep({
      id: "memory-access",
      actions: [
        {
          type: "text",
          text: `Accediendo a la dirección ${binToHex(binTag)} en memoria principal`,
        },
        {
          type: "text",
          target: "extra",
          text: `Buscando el bloque en la posición ${parseInt(binTag, 2).toLocaleString()} de la memoria (${MEMORY_LEN.toLocaleString()} posiciones disponibles). Este acceso es más lento que el acceso a caché.`,
        },
        {
          type: "highlight",
          row: parseInt(binTag, 2) % 16,
          tableId: "memory-table",
        },
      ],
    });

    // Recuperar el bloque de memoria
    const block = this.memory.getBlock(binTag);
    const blockHex = binToHex(block);

    this.addStep({
      id: "block-retrieved",
      actions: [
        {
          type: "text",
          text: `Bloque recuperado de memoria`,
        },
        {
          type: "table",
          table: [
            ["Dirección", "Bloque (Hex)"],
            [binToHex(binTag), blockHex],
          ],
        },
        {
          type: "text",
          target: "extra",
          text: `El bloque de 24 bits (${blockHex} en hexadecimal) ha sido recuperado exitosamente de la posición ${parseInt(binTag, 2).toLocaleString()} de la memoria principal.`,
        },
      ],
    });

    this.addStep({
      id: "memory-complete",
      actions: [
        {
          type: "status",
          status: "success",
        },
        {
          type: "text",
          text: `Lectura de memoria completada - Bloque ${blockHex} recuperado de la dirección ${parseInt(binTag, 2).toLocaleString()}`,
        },
        {
          type: "text",
          target: "extra",
          text: `La operación de lectura de memoria ha finalizado exitosamente. El bloque está disponible para ser transferido a la caché o procesado directamente. Memoria direccionada: ${parseInt(binTag, 2).toLocaleString()}/${(MEMORY_LEN - 1).toLocaleString()}`,
        },
      ],
    });

    return block;
  }
}

// Tipado de pasos para el controlador de memoria
export interface MemoryStep extends Step {
  id:
    | "memory-start"
    | "convert-tag"
    | "memory-architecture"
    | "calculate-address"
    | "address-range"
    | "memory-access"
    | "block-retrieved"
    | "block-decomposition"
    | "memory-complete";
}

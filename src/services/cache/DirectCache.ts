import { Cache } from "./Cache";
import type { Step } from "../StepManager";
import {
  hexTo4BitBinary,
  parseHexAddress,
  randomBinaryChar,
} from "../../utils/convert";

export class DirectCache extends Cache<DirectCacheStep> {
  private tags: Record<string, string> = {}; // Nuevo: almacenar tags por línea

  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word, bin } = parseHexAddress(hexAddress);

    {
      const binTable: [string, string][] = [];
      const iterator = bin.matchAll(/\d{4}/g);

      let value;
      while ((value = iterator.next()?.value?.[0]) !== undefined) {
        binTable.push([hexAddress.charAt(binTable.length), value]);
      }
      this.addStep({
        id: "decode-address-bin",
        info: `Conversión de dirección hexadecimal ${hexAddress} a formato binario para procesamiento en caché`,
      });
    }

    this.addStep({
      id: "decode-address",
      info: `Dirección descompuesta en componentes: etiqueta=${tag} (identificador único), línea=${line} (posición en caché), palabra=${word} (posición dentro del bloque)`,
    });

    this.addStep({
      id: "verify-line",
      info: `Accediendo a la línea ${line} de la caché directa para verificar si contiene el bloque solicitado`,
    });

    const currentTag = this.tags[line]; // Obtener tag almacenado en la línea

    if (currentTag) {
      this.addStep({
        id: "verify-tag",
        info: `Comparando etiqueta de la caché (${currentTag}) con etiqueta solicitada (${tag}) para validar coincidencia`,
      });

      if (currentTag === tag) {
        // ÉXITO - Cache hit
        const block = this.lines[line]; // Usar bloque de caché, no de memoria
        const index = parseInt(word, 2) * 2;
        this.output = block.substring(index, index + 2);
        this.addStep({
          id: "cache-hit",
          info: `¡ACIERTO! Bloque encontrado en caché. Palabra recuperada: ${this.output}`,
        });

        return this.output;
      } else {
        this.addStep({
          id: "cache-miss",
          info: `FALLO - La etiqueta no coincide (${currentTag} vs ${tag}). Se requiere acceso a memoria principal`,
        });
      }
    } else {
      this.addStep({
        id: "cache-miss",
        info: `FALLO - No hay bloque en la línea ${line}. Se requiere acceso a memoria principal`,
      });
    }

    this.output = null;
    return null;
  }

  public getWord(line: string, word: string) {
    const index = parseInt(word, 2) * 2;
    return this.lines[line].substring(index, index + 2);
  }

  public getCacheData(string: string) {
    return randomBinaryChar(8) + string + randomBinaryChar(2);
  }

  public executeSetLine(directionHex: string): void {
    const { line, tag, word } = parseHexAddress(directionHex);
    const block = this.memory.getBlock(directionHex);

    this.emit("execute", "set-line");
    this.setSteps([]);

    // Almacenar tanto el bloque como el tag
    this.lines[line] = block;
    this.tags[line] = tag; // Guardar el tag para futuras comparaciones

    this.addStep({
      id: "load-memory",
      info: `Cargando bloque desde memoria principal a caché directa: Línea ${line}, Tag ${tag}, Bloque ${block}`,
    });
  }
}

// tipado de pasos
export type DirectCacheStep = Step &
  (
    | { id: "decode-address-bin" }
    | { id: "decode-address" }
    | { id: "verify-line" }
    | { id: "cache-miss" }
    | { id: "cache-hit" }
    | { id: "verify-tag" }
    | { id: "load-memory" }
  );

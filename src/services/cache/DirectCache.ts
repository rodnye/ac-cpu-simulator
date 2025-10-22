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

    // NUEVO: Paso detallado de conversión hexadecimal a binario
    {
      const binTable: [string, string][] = [];
      const iterator = bin.matchAll(/\d{4}/g);

      let value;
      while ((value = iterator.next()?.value?.[0]) !== undefined) {
        binTable.push([hexAddress.charAt(binTable.length), value]);
      }

      // Mostrar conversión detallada
      const conversionDetails = binTable
        .map(([hexChar, binary]) => `${hexChar} → ${binary}`)
        .join("\n");

      this.addStep({
        id: "hex-to-binary",
        info: `Conversión de dirección hexadecimal a binario:\n\nHexadecimal: ${hexAddress}\n\nConversión carácter por carácter:\n${conversionDetails}\n\nCadena binaria completa: ${bin}`,
      });
    }

    // NUEVO: Mostrar descomposición detallada
    this.addStep({
      id: "decode-address",
      info: `Descomposición de la dirección binaria:\n\nBinario completo: ${bin}\n\nComponentes:\n• Tag: ${tag} (8 bits) - Identificador único del bloque\n• Línea: ${line} (14 bits) - Posición en caché (línea ${parseInt(line, 2)})\n• Palabra: ${word} (2 bits) - Posición dentro del bloque (palabra ${parseInt(word, 2)})\n`,
    });

    this.addStep({
      id: "verify-line",
      info: `Accediendo a la línea ${parseInt(line, 2)} de la caché directa para verificar si contiene el bloque solicitado con tag ${tag}`,
    });

    const currentTag = this.tags[line]; // Obtener tag almacenado en la línea

    if (currentTag) {
      this.addStep({
        id: "verify-tag",
        info: `Comparando etiquetas:\n• Tag en caché: ${currentTag}\n• Tag solicitado: ${tag}\n\nResultado: ${currentTag === tag ? "COINCIDENCIA - ACIERTO" : "NO COINCIDE - FALLO"}`,
      });

      if (currentTag === tag) {
        // ÉXITO - Cache hit
        const block = this.lines[line]; // Usar bloque de caché, no de memoria
        const index = parseInt(word, 2) * 2;
        this.output = block.substring(index, index + 2);
        this.addStep({
          id: "cache-hit",
          info: `¡ACIERTO! Bloque encontrado en caché.\n\nDetalles:\n• Línea: ${parseInt(line, 2)}\n• Tag: ${tag}\n• Palabra recuperada: ${this.output}\n• Bloque completo: ${block}`,
        });

        return this.output;
      } else {
        this.addStep({
          id: "cache-miss",
          info: `FALLO - La etiqueta no coincide.\n\n• Tag en caché: ${currentTag}\n• Tag solicitado: ${tag}\n\nSe requiere acceso a memoria principal para cargar el bloque.`,
        });
      }
    } else {
      this.addStep({
        id: "cache-miss",
        info: `FALLO - No hay bloque almacenado en la línea ${parseInt(line, 2)}.\n\nSe requiere acceso a memoria principal para cargar el bloque.`,
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

    // Mostrar información detallada del bloque a cargar
    this.addStep({
      id: "load-memory",
      info: `Cargando bloque desde memoria principal a caché directa:\n\n• Dirección: ${directionHex}\n• Línea destino: ${parseInt(line, 2)}\n• Tag: ${tag}\n• Bloque cargado: ${block}\n• Tamaño del bloque: ${block.length * 4} bits`,
    });

    // Almacenar tanto el bloque como el tag
    this.lines[line] = block;
    this.tags[line] = tag; // Guardar el tag para futuras comparaciones
  }

  // Al final de cada clase, agregar:
  public resetVisualState() {
    super.resetVisualState();
    this.input = null;
    this.output = null;
    // Nota: no resetear this.tags, this.lines, this.sets porque contienen datos reales
  }
}

// tipado de pasos
export type DirectCacheStep = Step &
  (
    | { id: "hex-to-binary" }
    | { id: "decode-address" }
    | { id: "verify-line" }
    | { id: "cache-miss" }
    | { id: "cache-hit" }
    | { id: "verify-tag" }
    | { id: "load-memory" }
  );

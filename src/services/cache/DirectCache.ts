// DirectCache.ts
import { Cache, type CacheEntry } from "./Cache";
import type { Step } from "../StepManager";
import { Cpu } from "../Cpu";

export class DirectCache extends Cache<DirectCacheStep> {
  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word } = Cpu.parseHexAddress(hexAddress);

    this.addStep({
      id: "decode-address",
      info: `Decodificación completada | Tag: ${tag} | Línea: ${line} | Palabra: ${word}`,
      value: { tag, line, word },
    });

    const entry = this.lines[line];
    this.addStep({
      id: "verify-line",
      info: `Acceso a línea ${line} - Verificación de contenido`,
      value: line,
    });

    if (entry) {
      this.addStep({
        id: "verify-tag",
        info: "Validación de etiqueta | Comparación tag almacenado vs solicitado",
      });
      if (entry.tag === tag) {
        // ÉXITO
        const index = parseInt(word, 2) * 2;
        this.output = entry.block.substring(index, index + 2);
        this.addStep({
          id: "cache-hit",
          info: `HIT | Bloque recuperado: ${entry.block} | Output: ${this.output}`,
          value: this.output,
        });

        return this.output;
      } else {
        this.addStep({
          id: "cache-miss",
          info: "MISS | Tag no coincide | Bloque inválido",
        });
      }
    } else {
      this.addStep({
        id: "cache-miss",
        info: "MISS | Línea vacía | Bloque no presente en caché",
      });
    }

    this.output = null;
    return null;
  }

  public executeSetLine(line: number, entry: CacheEntry): void {
    this.emit("execute", "set-line");
    this.setSteps([]);
    this.lines[line] = entry;
    this.addStep({
      id: "load-memory",
      info: `Escritura completada | Línea: ${line} | Bloque: ${entry.block} | Tag: ${entry.tag}`,
      value: { line, entry },
    });
  }
}

// tipado de pasos
export type DirectCacheStep = Omit<Step, "value"> &
  (
    | {
        id: "decode-address";
        value: {
          tag: string;
          line: number;
          word: string;
        };
      }
    | {
        id: "verify-line";
        value: number;
      }
    | {
        id: "cache-miss";
      }
    | {
        id: "cache-hit";
        value: DirectCache["output"];
      }
    | {
        id: "verify-tag";
      }
    | {
        id: "load-memory";
        value: { line: number; entry: CacheEntry };
      }
  );

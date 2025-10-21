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
      info: `🔍 DECODIFICACIÓN\nTag: ${tag}\nLínea: ${line}\nPalabra: ${word}`,
      value: { tag, line, word },
    });

    const entry = this.lines[line];
    this.addStep({
      id: "verify-line",
      info: `📊 VERIFICACIÓN LÍNEA\nAccediendo a línea: ${line}\nBuscando bloque almacenado`,
      value: line,
    });

    if (entry) {
      this.addStep({
        id: "verify-tag",
        info: `🏷️ VALIDACIÓN TAG\nTag almacenado: ${entry.tag}\nTag solicitado: ${tag}`,
      });
      if (entry.tag === tag) {
        // ÉXITO
        const index = parseInt(word, 2) * 2;
        this.output = entry.block.substring(index, index + 2);
        this.addStep({
          id: "cache-hit",
          info: `✅ CACHE HIT\nBloque: ${entry.block}\nPalabra extraída: ${this.output}\nLínea: ${line}`,
          value: this.output,
        });

        return this.output;
      } else {
        this.addStep({
          id: "cache-miss",
          info: `❌ CACHE MISS\nTags no coinciden\nAlmacenado: ${entry.tag} vs Solicitado: ${tag}`,
        });
      }
    } else {
      this.addStep({
        id: "cache-miss",
        info: `❌ CACHE MISS\nLínea ${line} vacía\nNo hay bloque almacenado`,
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
      info: `💾 CARGA EN CACHÉ\nLínea: ${line}\nBloque: ${entry.block}\nTag: ${entry.tag}`,
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

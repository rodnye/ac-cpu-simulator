import { Cache, type CacheEntry } from "./Cache";
import { Cpu } from "../Cpu";
import type { Step } from "../StepManager";

export class DirectCache extends Cache<DirectCacheStep> {
  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word } = Cpu.parseHexAddress(hexAddress);

    this.addStep({
      id: "decode-address",
      info: `Dirección decodificada: tag=${tag}, línea=${line}, palabra=${word}`,
      value: { tag, line, word },
    });

    const entry = this.lines[line];
    this.addStep({
      id: "verify-line",
      info: `Buscando en la línea ${line}`,
      value: line,
    });

    if (entry) {
      this.addStep({
        id: "verify-tag",
        info: "Línea encontrada, verificando etiqueta",
      });
      if (entry.tag === tag) {
        // ÉXITO
        this.output = entry.block;
        this.addStep({
          id: "cache-hit",
          info: "Bloque encontrado.",
          value: this.output,
        });

        return this.output;
      } else {
        this.addStep({
          id: "cache-miss",
          info: "Etiqueta no coincide, fallo de caché",
        });
      }
    } else {
      this.addStep({
        id: "cache-miss",
        info: "Fallo de caché: no hay bloque en la línea",
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
      info: `Bloque cargado en línea ${line}`,
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

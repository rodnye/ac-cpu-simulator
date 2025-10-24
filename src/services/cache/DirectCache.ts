import { Cache, type CacheEntry } from "./Cache";
import type { Step } from "../StepManager";
import { Cpu } from "../Cpu";

export class DirectCache extends Cache<DirectCacheStep> {
  public executeGetLine(hexAddress: string) {
    this.emit("execute", "get-line");
    this.setSteps([]);
    this.input = hexAddress;

    const { tag, line, word, bin } = Cpu.parseHexAddress(hexAddress);
    
    {
      const binTable: [string, string][] = [];
      const iterator = bin.matchAll(/\d{4}/g);
      
      let value;
      while ((value = iterator.next()?.value?.[0]) !== undefined) {
        binTable.push([hexAddress.charAt(binTable.length), value]);
      }
      this.addStep({
        id: "decode-address-bin",
        info: `Convertir a binario de 4 posiciones`,
        value: binTable,
      });
    }

    this.addStep({
      id: "decode-address",
      info: `Dirección decodificada`,
      value: { tag, line, word, bin },
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
        const index = parseInt(word, 2) * 2;
        this.output = entry.block.substring(index, index + 2);
        this.addStep({
          id: "cache-hit",
          info: `Bloque encontrado: ${entry.block}`,
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
      info: `Cacheando: \nLínea ${line}\nBloque ${entry.block}`,
      value: { line, entry },
    });
  }
}

// tipado de pasos
export type DirectCacheStep = Omit<Step, "value"> &
  (
    | {
        id: "decode-address-bin";
        value: [string, string][];
      }
    | {
        id: "decode-address";
        value: {
          tag: string;
          line: number;
          word: string;
          bin: string;
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

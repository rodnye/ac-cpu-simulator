import { Cache } from "./Cache";
import type { Step } from "../StepManager";
import {
  hexTo4BitBinary,
  parseHexAddress,
  randomBinaryChar,
} from "../../utils/convert";

export class DirectCache extends Cache<DirectCacheStep> {
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
        info: `Convertir a binario de 4 posiciones`,
        value: binTable,
      });
    }

    this.addStep({
      id: "decode-address",
      info: `Dirección decodificada`,
      value: { tag, line, word, bin },
    });

    const binStr = hexTo4BitBinary(hexAddress);
    const realTag = binStr.substring(0, 8);

    this.addStep({
      id: "verify-line",
      info: `Buscando en la línea ${line}`,
      value: line,
    });

    if (realTag) {
      this.addStep({
        id: "verify-tag",
        info: "Línea encontrada, verificando etiqueta",
      });
      if (realTag === tag) {
        // ÉXITO
        const block = this.memory.getBlock(hexAddress);
        const index = parseInt(word, 2) * 2;
        this.output = block.substring(index, index + 2);
        this.addStep({
          id: "cache-hit",
          info: `Bloque encontrado: ${block}`,
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
    this.lines[line] = block;
    this.addStep({
      id: "load-memory",
      info: `Cacheando: \nLínea ${line}\nBloque ${block}`,
      value: { line, block },
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
          line: string;
          word: string;
          bin: string;
        };
      }
    | {
        id: "verify-line";
        value: string;
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
        value: { line: string; block: string };
      }
  );

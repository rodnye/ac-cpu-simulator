import { CacheController } from "./CacheController";
import type { Step, StepAction } from "./StepController";
import {
  binary4BitToHex,
  binToHex,
  hexTo4BitBinary,
  parseHexAddress,
  type Hex,
} from "../../utils/convert";
import { DirectCache } from "../core/cache/DirectCache";

export class DirectCacheController extends CacheController<DirectCacheStep> {
  private directCache = new DirectCache();

  public executeGetLine(hexAddress: Hex) {
    this.emit("execute", "get-line");
    this.setSteps([]);

    const { tag, line, word, bin } = parseHexAddress(hexAddress);

    {
      const binTable: string[][] = [[], []];
      const iterator = bin.matchAll(/\d{4}/g);

      let value: string | undefined;
      while ((value = iterator.next()?.value?.[0]) !== undefined) {
        binTable[0].push(hexAddress.charAt(binTable[0].length));
        binTable[1].push(value);
      }
      this.addStep({
        id: "decode-address-bin",
        actions: [
          {
            type: "text",
            text: `Conversión de dirección hexadecimal (${hexAddress})`,
          },
          {
            type: "text",
            target: "extra",
            text: `Conversión de dirección hexadecimal ${hexAddress} a formato binario para procesamiento en caché. Cada número fue convertido a su representación de 4 bits`,
          },
          {
            type: "table",
            table: binTable,
          },
        ],
      });
    }

    this.addStep({
      id: "decode-address",
      actions: [
        {
          type: "text",
          text: `Solicitud descompuesta en componentes`,
        },
        {
          type: "text",
          target: "extra",
          text: `La cadena binaria generada (${bin}), se descompuso en sus componentes`,
        },
        {
          type: "table",
          table: [
            ["", "Tag (8 bits)", "Line (12 bits)", "Word (2 bits)"],
            ["Binario:", tag, line, word],
            ["Hexadecimal:", binToHex(tag), binToHex(line), binToHex(word)],
          ],
        },
      ],
    });

    const stepHighlight: StepAction = {
      type: "highlight",
      row: parseInt(line, 2),
      tableId: "direct-cache",
    };

    this.addStep({
      id: "verify-line",
      actions: [
        {
          type: "text",
          text: `Accediendo a la línea ${binToHex(line)} de la caché directa para verificar si contiene la etiqueta solicitada`,
        },
        stepHighlight,
      ],
    });

    const cachedLine = this.directCache.getLine(line);

    this.addStep({
      id: "verify-tag",
      actions: [
        {
          type: "text",
          text: "Comparando etiquetas",
        },
        {
          type: "text",
          target: "extra",
          text: `Comparando de la caché (${binToHex(cachedLine.tag)}) con etiqueta solicitada (${binToHex(tag)}) para validar coincidencia`,
        },
        stepHighlight,
        {
          type: "table",
          table: [
            ["Solicitud", "Tag de la Cache"],
            [binToHex(tag), binToHex(cachedLine.tag)],
          ],
        },
      ],
    });

    if (cachedLine.tag === tag) {
      // ÉXITO - Cache hit
      this.addStep({
        id: "cache-hit:tag",
        actions: [
          { type: "status", status: "success" },
          {
            type: "text",
            text: `COINCIDEN !`,
          },
          {
            type: "text",
            target: "extra",
            text: `La etiqueta de la caché (${binToHex(cachedLine.tag)}) coincide con etiqueta solicitada (${binToHex(tag)}) esto es un acierto de cache, lo que significa que con anterioridad esta etiqueta había sido almacenada en la caché en esta línea.`,
          },
          stepHighlight,
          {
            type: "table",
            table: [
              ["Solicitud", "Tag de la Cache"],
              [binToHex(tag) + " =", "= " + binToHex(cachedLine.tag)],
            ],
          },
        ],
      });

      const blockHex = binToHex(cachedLine.block);
      this.addStep({
        id: "cache-hit:get-block",
        actions: [
          { type: "status", status: "success" },
          {
            type: "text",
            text: `El bloque en esta línea de la caché (${binToHex(line)}) es: `,
          },
          {
            type: "table",
            table: [
              ["Line", "Block"],
              [binToHex(line), blockHex],
            ],
          },
        ],
      });

      let output!: string;
      {
        const table: string[][] = [[], [], []];
        for (let i = 0; i < 4; i++) {
          const currentPart = blockHex.substring(i * 2, i * 2 + 2) as Hex;
          const currentPartIndex = i.toString(2).padStart(2, "0");
          if (currentPartIndex === word) {
            table[0].push(word + "\n(Esta es la palabra)");
            output = hexTo4BitBinary(currentPart);
          } else table[0].push(currentPartIndex);

          table[1].push(currentPart);
          table[2].push(hexTo4BitBinary(currentPart));
        }
        this.addStep({
          id: "cache-hit:get-word",
          actions: [
            { type: "status", status: "success" },
            {
              type: "text",
              text: `Obteniendo palabra del bloque cacheado`,
            },
            {
              type: "text",
              target: "extra",
              text: `Del bloque cacheado: (${blockHex}), \n se obtendrán 8 bits según la posición indicada por la word ${word}`,
            },
            {
              type: "table",
              table,
            },
          ],
        });
      }

      this.addStep({
        id: "cache-hit",
        actions: [
          {type: "status", status: "success"},
          {
            type: "text",
            text: `Palabra recuperada: ${output}`,
          },
          {
            type: "text",
            target: "extra",
            text: "Hubo acierto de caché, esto significa que no fue necesario acceder a la memoria, el dato será recuperado por la CPU",
          },
        ],
      });

      return output;
    } else {
      this.addStep({
        id: "cache-miss",
        actions: [
          { type: "status", status: "error" },
          {
            type: "text",
            text: `NO COINCIDEN !`,
          },
          {
            type: "text",
            target: "extra",
            text: `La etiqueta de la caché (${binToHex(cachedLine.tag)}) vs la etiqueta solicitada (${binToHex(tag)}) es un cache-miss, lo que significa que no esta cacheada la etiqueta solicitada en la linea.`,
          },
          stepHighlight,
          {
            type: "table",
            table: [
              ["Solicitud", "Tag de la Cache"],
              [binToHex(tag), "diferente a " + binToHex(cachedLine.tag)],
            ],
          },
        ],
      });

      const block = this.memory.executeGetBlock(tag);
      const blockIndex = parseInt(word, 2) * 2;
      const output = binary4BitToHex(block).substring(blockIndex, blockIndex + 2);

      this.addStep({
        id: 'memory:get-block',
        actions: [
          {type: 'text', text: 'Solicitando bloque de la memoria'},
          {
          type: 'wait',
          waitFor: this.memory,
          steps: this.memory.getSteps()
        }]
      });

      this.directCache.setLine(line, { tag, block: block });

      this.addStep({
        id: "load-memory",
        actions: [
          {
            type: "text",
            text: `Cargado bloque desde memoria principal a caché directa`,
          },
          {
            type: "table",
            table: [
              ["Line", "Tag", "Block"],
              [binToHex(line), binToHex(tag), binToHex(block)],
            ],
          },
          {type: 'text', target: "extra", text: "El bloque cargado se ha guardado en la caché para una futura consulta de la misma línea y el mismo tag."}
        ],
      });
      return output;
    }
  }
}

// tipado de pasos
export type DirectCacheStep = Step;

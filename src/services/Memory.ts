import EventEmitter from "eventemitter3";
import { binary4BitToHex, hexTo4BitBinary } from "../utils/convert";
import { generarCadenasUnicas } from "../utils/block-gernerator";

export const blocksData = generarCadenasUnicas(50);

export class Memory extends EventEmitter {
  directCacheArray: Record<string, string>;
  directCalls: string[];
  associativeCacheStrings: Record<string, string>;

  constructor() {
    super();
    this.directCacheArray = {};
    this.associativeCacheStrings = {};
    this.directCalls = [];
    this.initMemory();
  }

  private initMemory() {
    let binaryString: string;
    let directTag: string;
    let associativeTag: string;

    let tag2Hex: string;
    let cadena: string;

    for (let hexString of blocksData) {
      binaryString = hexTo4BitBinary(hexString);
      directTag = binaryString.substring(0, 8);
      associativeTag = binaryString.substring(0, 22);
      this.directCacheArray[directTag] = hexString;
      this.associativeCacheStrings[associativeTag] = hexString;

      //Crear direcciones de entrada validas
      tag2Hex = binary4BitToHex(directTag);
      cadena = binary4BitToHex(binaryString.slice(8, 24));
      this.directCalls.push(directTag);
    }
  }

  public getDirectBlock(tag: string) {
    return this.directCacheArray[tag];
  }

  public getDirectWord(tag: string, wordIndex: string) {
    let index = parseInt(wordIndex, 2) * 2;
    return this.directCacheArray[tag].substring(index, index + 2);
  }
  public getAssociativeBlock(tag: string) {
    return this.associativeCacheStrings[tag];
  }
}

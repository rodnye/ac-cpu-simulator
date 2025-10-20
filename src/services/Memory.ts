import EventEmitter from "eventemitter3";
import { hexTo4BitBinary } from "../utils/convert";
import {
  generarCadenasUnicas,
  generarCuerpos,
  generarTagsUnicos,
} from "../utils/block-gernerator";

export const blocksData = generarCadenasUnicas(50);
export const uniqueTags = generarTagsUnicos(50);
export const cuerpos = generarCuerpos(50);

export class Memory extends EventEmitter {
  directCacheArray: Record<string, string>;
  directCalls: string[];
  associativeCalls: string[];
  associativeCacheStrings: Record<string, string>;

  constructor() {
    super();
    this.directCacheArray = {};
    this.associativeCacheStrings = {};
    this.directCalls = [];
    this.associativeCalls = [];
    this.initMemory();
  }

  private initMemory() {
    let binaryString: string;
    let directTag: string;
    let associativeTag: string;
    let hexString: string;

    for (let i = 0; i < 50; i++) {
      hexString = blocksData[i];
      binaryString = hexTo4BitBinary(hexString);

      directTag = uniqueTags[i];
      this.directCacheArray[directTag] = hexString;

      associativeTag = binaryString.substring(0, 22);
      this.associativeCacheStrings[associativeTag] = hexString;

      //Crear direcciones de entrada validas para cache directa
      this.directCalls.push(directTag + cuerpos[i]);

      //Crear direcciones de entrada validas para cache asociativa
      this.associativeCalls.push(hexString);
    }
    console.log(this.directCalls);
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

  public getAssociativeWord(tag: string, wordIndex: string) {
    let index = parseInt(wordIndex, 2) * 2;
    return this.associativeCacheStrings[tag].substring(index, index + 2);
  }
}

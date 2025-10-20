import { hexTo4BitBinary } from "../utils/convert";
import { StepManager, type Step } from "./StepManager";

export type MemoryStep = Step & {
  id: "get-block" | "get-word";
  value: string;
};

export class Memory extends StepManager<MemoryStep> {
  public directCacheArray: Record<string, string>;
  private associativeCacheStrings: Record<string, string>;
  public directCalls: string[];
  public associativeCalls: string[];

  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
    this.directCacheArray = {};
    this.associativeCacheStrings = {};
    this.directCalls = [];
    this.associativeCalls = [];
    this.initMemory();
  }

  private initMemory() {
    const blocksData = this.generateUniqueStrings(50);
    const uniqueTags = this.generateUniqueTags(50);
    const bodies = this.generateBodies(50);

    for (let i = 0; i < 50; i++) {
      const hexString = blocksData[i];
      const binaryString = hexTo4BitBinary(hexString);

      const directTag = uniqueTags[i];
      this.directCacheArray[directTag] = hexString;

      const associativeTag = binaryString.substring(0, 22);
      this.associativeCacheStrings[associativeTag] = hexString;

      this.directCalls.push(directTag + bodies[i]);
      this.associativeCalls.push(hexString);
    }
  }

  public executeGetDirectBlock(tag: string) {
    this.setSteps([]);
    this.input = tag;
    this.output = this.directCacheArray[tag];

    this.addStep({
      id: "get-block",
      info: `Obteniendo bloque directo desde la etiqueta '${tag}'`,
      value: this.output,
    });

    return this.output;
  }

  public executeGetDirectWord(tag: string, wordIndex: string) {
    this.setSteps([]);
    this.input = `${tag}:${wordIndex}`;
    const index = parseInt(wordIndex, 2) * 2;
    this.output = this.directCacheArray[tag].substring(index, index + 2);

    this.addStep({
      id: "get-word",
      info: `Obteniendo palabra desde tag '${tag}', índice '${wordIndex}'`,
      value: this.output,
    });

    return this.output;
  }

  public executeGetAssociativeBlock(tag: string) {
    this.setSteps([]);
    this.input = tag;
    this.output = this.associativeCacheStrings[tag];

    this.addStep({
      id: "get-block",
      info: `Obteniendo bloque asociativo desde la etiqueta '${tag}'`,
      value: this.output,
    });

    return this.output;
  }

  public executeGetAssociativeWord(tag: string, wordIndex: string) {
    this.setSteps([]);
    this.input = `${tag}:${wordIndex}`;
    const index = parseInt(wordIndex, 2) * 2;
    this.output = this.associativeCacheStrings[tag].substring(index, index + 2);

    this.addStep({
      id: "get-word",
      info: `Obteniendo palabra asociativa desde tag '${tag}', índice '${wordIndex}'`,
      value: this.output,
    });

    return this.output;
  }

  // Utility methods
  private generateUniqueStrings(quantity: number): string[] {
    const characters = "ABCDEF0123456789";
    const stringLength = 8;
    const set = new Set<string>();

    while (set.size < quantity) {
      let string = "";
      for (let i = 0; i < stringLength; i++) {
        const index = Math.floor(Math.random() * characters.length);
        string += characters[index];
      }
      set.add(string);
    }

    return Array.from(set);
  }

  private generateUniqueTags(quantity: number): string[] {
    const characters = "ABCDEF0123456789";
    const tagLength = 2;
    const tagSet = new Set<string>();

    while (tagSet.size < quantity) {
      let tag = "";
      for (let i = 0; i < tagLength; i++) {
        const index = Math.floor(Math.random() * characters.length);
        tag += characters[index];
      }
      tagSet.add(tag);
    }

    return Array.from(tagSet);
  }

  private generateBodies(quantity: number): string[] {
    const characters = "ABCDEF0123456789";
    const length = 4;
    const stringArray: string[] = [];

    for (let i = 0; i < quantity; i++) {
      let body = "";
      for (let j = 0; j < length; j++) {
        const index = Math.floor(Math.random() * characters.length);
        body += characters[index];
      }
      stringArray.push(body);
    }

    return stringArray;
  }
}

import { StepManager, type Step } from "./StepManager";

export type MemoryStep = Step & {
  id: "get-block",
  value: string
};
export type MemoryBlock = string;

export class Memory extends StepManager<MemoryStep> {
  static directCacheStrings = {
    AA: "AAC00000",
    AB: "ABF00001",
    AC: "ACA00002",
    FF: "FFF00003",
    BB: "BBB00004",
    CC: "CCC00005",
    DD: "DDC00006",
    DA: "DAA00007",
    AD: "ADA00008",
    FD: "FDD00009",
    D1: "D1G00010",
    F6: "F6B00011",
    B5: "B5B00012",
    EE: "EE00013",
    C4: "C4B00014",
  };

  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
  }

  public executeGetBlock(tag: keyof typeof Memory.directCacheStrings) {
    this.setSteps([]);
    this.input = tag;
    this.output = this.getBlock(tag);
    this.addStep({
      id: "get-block",
      info: `Obteniendo bloque desde la etiqueta '${tag}'`,
      value: this.output,
    });

    return this.output;
  }

  private getBlock(tag: keyof typeof Memory.directCacheStrings): MemoryBlock {
    return Memory.directCacheStrings[tag];
  }
}

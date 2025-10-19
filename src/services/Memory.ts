import EventEmitter from "eventemitter3";

export class Memory extends EventEmitter {
  static directCacheStrings: Record<string, string> = {
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

  constructor() {
    super();
  }

  public static getBlock(tag: string) {
    return this.directCacheStrings[tag];
  }
}

export class MemoryManager {
  data: Record<string, string> = {};

  constructor() {
    this.initializeMemory();
  }

  private initializeMemory(): void {
    for (let i = 0; i < 30; i++) {
      const binaryKey = i.toString(2).padStart(8, "0");
      const randomValue = Math.floor(Math.random() * 4)
        .toString(2)
        .padStart(2, "0");

      this.data[binaryKey] = randomValue;
    }
  }

  getWord(tag: string) {
    return {
      word: this.data[tag],
      blockId: Math.floor(Object.keys(this.data).indexOf(tag) / 4),
    };
  }
}

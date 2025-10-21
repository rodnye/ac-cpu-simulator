import { binary4BitToHex, hexTo4BitBinary } from "../utils/convert";
import { StepManager, type Step } from "./StepManager";

export type MemoryStep = Step & {
  id: "get-block" | "get-word";
  value: string;
};

export class Memory extends StepManager<MemoryStep> {
  input: string | null = null;
  output: string | null = null;

  constructor() {
    super();
  }

  public executeMemory(directionHex: string) {
    let binary = "1001" + hexTo4BitBinary(directionHex) + "0110";
    binary = binary.split("").reverse().join("");

    return binary4BitToHex(binary);
  }

  public getBlock(directionHex: string) {
    let binary = "1001" + hexTo4BitBinary(directionHex) + "0110";
    binary = binary.split("").reverse().join("");

    return binary4BitToHex(binary);
  }
}

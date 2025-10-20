import { Cpu } from "./Cpu";

const cpu = new Cpu();

cpu.on("step", (s) => console.log("\n\n----- CPU:", s))
cpu.cache.on("step", (s) => console.log("-------- Cache:", s))
cpu.memory.on("step", (s) => console.log("--------Memory:", s))

cpu.executeGetWord("ABF123");
cpu.startTimer(5000);

cpu.once('timer-stop', () => {
  console.log("\n\n\nTest 2\n\n\n");
  cpu.executeGetWord("ABF123");
  cpu.startTimer(5000);
})
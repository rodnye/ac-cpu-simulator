import { Cpu } from "./Cpu";

const cpu = new Cpu();
const tag = "ABC123";

cpu.on("step", (s) => console.log("\n\n----- CPU:", s));
cpu.directCache.on("step", (s) => console.log("-------- Cache:", s));
cpu.memory.on("step", (s) => console.log("--------Memory:", s));

cpu.executeGetWordDirect(tag);
cpu.startTimer(100);
cpu.executeGetWordDirect(tag);

//cpu.once("timer-stop", () => {
//  console.log("\n\n\nTest 2\n\n\n");
//  cpu.executeGetWordDirect(tag);
//  cpu.startTimer(5000);
//});

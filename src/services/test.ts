import { CpuManager } from "./cpu-manager";

const cpu = new CpuManager();

cpu.executeGetDirectWord("DDC0006");

const x = setInterval(() => {
  if (cpu.hasNext()) {
    console.log(cpu.next());
  }
  else {
    clearInterval(x);
  }
})
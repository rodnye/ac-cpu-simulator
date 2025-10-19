import { CpuManager } from "./cpu-manager";

const cpu = new CpuManager();

cpu.executeGetDirectWord("DDC0006");

let x = setInterval(() => {
  if (cpu.hasNext()) {
    cpu.next();
  } else {
    clearInterval(x);
  }
});
await new Promise((resolve) => setTimeout(resolve, 5000));

cpu.executeGetDirectWord("DDC0006");

x = setInterval(() => {
  if (cpu.hasNext()) {
    cpu.next();
  } else {
    clearInterval(x);
  }
});

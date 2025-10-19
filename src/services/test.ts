import { CPU } from "./CPU";

const cpu = new CPU();

cpu.start("AAC000");

while (cpu.cache.hasNext()) {
  cpu.next();
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
console.log("-----------------------");

cpu.start("AAC000");

while (cpu.cache.hasNext()) {
  cpu.next();
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

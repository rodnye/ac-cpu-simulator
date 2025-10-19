import { CPU } from "./CPU";

const cpu = new CPU();

cpu.start("ABF123");

while (cpu.cache.hasNext()) {
  cpu.cache.next();
}

cpu.start("ABF123");

while (cpu.cache.hasNext()) {
  cpu.cache.next();
}

import { CPU } from "./CPU";

const cpu = new CPU();
const tag = cpu.memory.directCalls[1];

cpu.startDirectCache(tag);

while (cpu.cacheDirect.hasNext()) {
  cpu.cacheDirect.next();
}

cpu.startDirectCache(tag);

while (cpu.cacheDirect.hasNext()) {
  cpu.cacheDirect.next();
}

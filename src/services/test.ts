// test-associative.ts
import { CPU } from "./CPU";

const cpu = new CPU();

const testTag = cpu.memory.associativeCalls[0];

console.log("=== Probando Caché Asociativa ===");
cpu.startAssociativeCache(testTag);

while (cpu.cacheAssociative.hasNext()) {
  cpu.cacheAssociative.next();
}

console.log("\n=== Segunda ejecución (debería ser cache hit) ===");
cpu.startAssociativeCache(testTag);

while (cpu.cacheAssociative.hasNext()) {
  cpu.cacheAssociative.next();
}

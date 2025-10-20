// test-associative.ts
import { CPU } from "./CPU";

const cpu = new CPU();

//const testTag = cpu.memory.associativeCalls[0];
//
//console.log("=== Probando Caché Asociativa ===");
//cpu.startAssociativeCache(testTag);
//
//while (cpu.cacheAssociative.hasNext()) {
//  cpu.cacheAssociative.next();
//}
//
//console.log("\n=== Segunda ejecución (debería ser cache hit) ===");
//cpu.startAssociativeCache(testTag);
//
//while (cpu.cacheAssociative.hasNext()) {
//  cpu.cacheAssociative.next();
//}

//test para cache directa
//const tag = cpu.memory.directCalls[1];
//cpu.startDirectCache(tag);
//
//while (cpu.cacheDirect.hasNext()) {
//  cpu.cacheDirect.next();
//}
//
//cpu.startDirectCache(tag);
//
//while (cpu.cacheDirect.hasNext()) {
//  cpu.cacheDirect.next();
//}

//test para setCache
const tag = cpu.memory.directCalls[1];

cpu.startSetAssociativeCache(tag);

while (cpu.setAssociativeCache.hasNext()) {
  cpu.setAssociativeCache.next();
}

cpu.startSetAssociativeCache(tag);

while (cpu.setAssociativeCache.hasNext()) {
  cpu.setAssociativeCache.next();
}

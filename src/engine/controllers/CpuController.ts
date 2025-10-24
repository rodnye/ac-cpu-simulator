import type { Hex } from "../../utils/convert";
import { DirectCacheController } from "./DirectCacheController";
import { MemoryController } from "./MemoryController";
import { StepController } from "./StepController";

export class CpuController extends StepController {
  directCache: DirectCacheController;
  //setAssociativeCache: SetAssociativeCache;
  //associativeCache: AssociativeCache;

  memory = new MemoryController();

  constructor() {
    super();
    this.directCache = new DirectCacheController(this.memory);
    //this.setAssociativeCache = new SetAssociativeCache(this.memory);
    //this.associativeCache = new AssociativeCache(this.memory);
  }

  public executeGetWordDirect(hexAddress: Hex) {
    this.addStep({
      id: "start",
      actions: [
        {
          type: "text",
          text: "Se comenzará la petición hacia la memoria y hacia la caché para obtener la palabra solicitada",
        },
        { type: "table", table: [[`Solicitud: ${hexAddress}`]] },
      ],
    });
    
    const cacheOutput = this.directCache.executeGetLine(hexAddress);
    this.addStep({
      id: "wait",
      actions: [
        {
          type: "text",
          text: "Esperando respuesta",
        },
        { type: "table", table: [[`Solicitud: ${hexAddress}`]] },
        {
          type: "wait",
          waitFor: this.directCache,
          steps: this.directCache.getSteps(),
        },
      ],
    });

    this.addStep({
      id: "get-word",
      actions: [
        { type: "text", text: `Palabra obtenida exitosamente: ${cacheOutput}` },
        {type: "status", status: "success"}
      ],
    });

    this.emit("execute", "get-word");
  }
}

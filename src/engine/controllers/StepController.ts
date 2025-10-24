import EventEmitter from "eventemitter3";

export type ActionStatus = "active" | "idle" | "error" | "success";

export type StepAction =
  // añade texto a la info del componente
  | {
      type: "text";
      target?: "info" | "extra";
      text: string;
    }
  // añade una tabla a la info del componente
  | {
      type: "table";
      target?: "info" | "extra";
      table: string[][];
    }
  // resalta un componente de la UI
  | {
      type: "highlight";
      row: number;
      tableId: string;
    }
  // cambia el estado de la info con un destello visual
  | {
      type: "status";
      status: ActionStatus;
    }
  | WaitStepAction;

/**
 * Hace que el controlador espere por otro controlador,
 * esta accion crea persistencia en el estado de un componente anidado
 */ 
export type WaitStepAction<S extends Step = Step> = {
  type: "wait";
  waitFor: StepController<S>;
  steps: S[];
};

/**
 * Un paso no es mas que un snapshot en el tiempo de la ejecucion de un proceso.
 * Este consta de un id unico en su controlador, y  de una serie de acciones que serán
 * escuchadas por `StepController.on("step")`
 */
export interface Step {
  id: string;
  actions?: StepAction | StepAction[];
}

export type TimerId = ReturnType<typeof setInterval>;

export class StepError extends Error {}
export class StepTimerError extends StepError {}
export class StepNextError extends StepError {
  constructor(
    msg: string = "Error de siguiente operacion, no hay operaciones pendientes",
  ) {
    super(msg);
  }
}

/**
 * el tipo Step["actions"] es complejo, esto retorna un arreglo de ellos
 */
export const getStepActions = <S extends Step = Step>(step: S) => {
  let actions: StepAction[] = [];
  if (step.actions !== undefined) {
    if (!Array.isArray(step.actions)) {
      actions.push(step.actions);
    } else {
      actions = step.actions;
    }
  }
  return actions;
};

export abstract class StepController<
  S extends Step = Step,
> extends EventEmitter<{
  step: (step: S) => void;
  "timer-stop": () => void;
  "timer-start": () => void;
  execute: (id: string) => void;
  reset: () => void; // Nuevo evento
}> {
  private timer: TimerId | undefined;

  // steps
  protected steps: S[] = [];
  public getSteps() {
    return this.steps;
  }
  protected addStep(step: S) {
    this.steps.push(step);
  }
  public setSteps(steps: S[]) {
    this.steps = steps;
  }
  public countAllSteps() {
    let total = 0;
    const queue: Step[][] = [this.steps];
    let currentSteps: Step[] | undefined;
    while ((currentSteps = queue.shift())) {
      for (const step of currentSteps) {
        total++;
        const waitActions = getStepActions(step).filter(
          (a) => a.type === "wait",
        );
        for (const { steps } of waitActions) queue.push(steps);
      }
    }
    return total;
  }

  // iterator
  public next() {
    if (!this.hasNext()) throw new StepNextError();
    const step = this.steps[0]!;
    const waitActions = getStepActions(step).filter((step) => {
      return step.type === "wait" && step.steps.length;
    }) as WaitStepAction[];

    for (const { waitFor, steps } of waitActions) {
      waitFor.setSteps(steps);
      if (waitFor.hasNext()) waitFor.next();
    }

    this.emit("step", step);
    if (waitActions.length === 0) {
      this.steps.shift();
    }
    return step;
  }
  public hasNext(): boolean {
    return this.steps.length > 0;
  }

  /**
   * ensures that an external StepManager controls the execution of this StepManage
   * this allows for external control over the execution of operations
   */
  public setExternalTimer(timer: TimerId) {
    this.stopTimer();
    this.timer = timer;
  }

  public get timerRunning(): boolean {
    return !!this.timer;
  }

  public startTimer(time: number = 3000) {
    if (this.timerRunning) {
      throw new StepTimerError(
        "A timer is already running. Please stop the current timer before starting a new one.",
      );
    }

    this.timer = setInterval(() => {
      if (this.hasNext()) {
        this.next();
      } else {
        this.stopTimer();
      }
    }, time);
  }

  public stopTimer() {
    if (!this.timerRunning) {
      throw new StepTimerError(
        "There is no timer running. Please start a timer before stopping it.",
      );
    }

    clearInterval(this.timer);
    this.timer = undefined;
    this.emit("timer-stop");
  }
}

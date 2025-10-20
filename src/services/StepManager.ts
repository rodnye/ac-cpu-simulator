import EventEmitter from "eventemitter3";

export interface Step {
  id: string;
  info: string;
  value?: unknown;
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

export abstract class StepManager<S extends Step = Step> extends EventEmitter<{
  step: (step: S) => void;
  "timer-stop": () => void;
  "timer-start": () => void;
  "execute": (id: string) => void;
}> {
  private timer: TimerId | undefined;

  // bus de entrada, bus de salida
  public abstract input: unknown;
  public abstract output: unknown;
  
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
  
  // iterator
  public next() {
    if (!this.hasNext()) throw new StepNextError();

    const step: S = this.steps.shift()!;
    this.emit("step", step);
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

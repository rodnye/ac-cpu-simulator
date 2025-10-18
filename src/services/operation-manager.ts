import EventEmitter from "eventemitter3";

export interface Operation {
  step: string;
  info: string;
  value?: unknown;
}

export type TimerId = ReturnType<typeof setInterval>;

export class OperationError extends Error {}
export class OperationTimerError extends OperationError {}
export class OperationNextError extends OperationError {
  constructor(
    msg: string = "Error de siguiente operacion, no hay operaciones pendientes",
  ) {
    super(msg);
  }
}
new Error();
export abstract class OperationManager<
  T extends EventEmitter.ValidEventTypes = { operation: Operation },
> extends EventEmitter<{ operation: Operation } & T> {
  public queue: Operation[] = [];
  private timer: TimerId | undefined;

  protected abstract operationData: Record<string, unknown>;
  public abstract output: unknown;
  abstract next(): void;
  public hasNext(): boolean {
    return this.queue.length > 0;
  }

  /**
   * ensures that an external OperationManager controls the execution of this OperationManage
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
      throw new OperationTimerError(
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
      throw new OperationTimerError(
        "There is no timer running. Please start a timer before stopping it.",
      );
    }

    clearInterval(this.timer);
    this.timer = undefined;
  }
}

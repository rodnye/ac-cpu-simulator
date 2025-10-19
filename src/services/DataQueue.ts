export class Operation {
  step: string;
  info: string;
  value: any;

  constructor(step: string, info: string, value?: any) {
    this.step = step;
    this.info = info;
    this.value = value;
  }
}

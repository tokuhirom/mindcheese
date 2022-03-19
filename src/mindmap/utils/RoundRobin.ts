export class RoundRobin<T> {
  private readonly data: T[];
  private index: number;

  constructor(data: T[]) {
    this.data = data;
    this.index = 0;
  }

  take(): T {
    const v = this.data[this.index++];
    if (this.index == this.data.length) {
      this.index = 0;
    }
    return v;
  }
}

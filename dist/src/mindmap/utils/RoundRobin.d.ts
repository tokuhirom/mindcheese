export declare class RoundRobin<T> {
  private readonly data;
  private index;
  constructor(data: T[]);
  take(): T;
}

import { Size } from "../model/Size";

export declare class Bounds {
  constructor(n: number, e: number, w: number, s: number);
  readonly n: number;
  readonly e: number;
  readonly w: number;
  readonly s: number;
  readonly size: Size;
}

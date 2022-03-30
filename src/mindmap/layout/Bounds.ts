import { Size } from "../model/Size";

export class Bounds {
  constructor(n: number, e: number, w: number, s: number) {
    this.n = n;
    this.e = e;
    this.w = w;
    this.s = s;
    this.size = new Size(this.e + this.w * -1, this.s + this.n * -1);
    console.log(
      `size: e=${e},w=${w},s=${s},n=${n} w=${this.size.width},h=${this.size.height}`
    );
  }

  readonly n: number; // negative
  readonly e: number;
  readonly w: number; // negative
  readonly s: number;
  readonly size: Size;
}

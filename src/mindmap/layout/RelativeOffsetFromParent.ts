export class RelativeOffsetFromParent {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // https://ageek.dev/ts-nominal-typing
  __RelativeOffsetFromParentBrand: any;
  x: number;
  y: number;
}

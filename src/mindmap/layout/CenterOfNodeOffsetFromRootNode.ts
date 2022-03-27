export class CenterOfNodeOffsetFromRootNode {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // https://ageek.dev/ts-nominal-typing
  __CenterOfNodeOffsetFromRootNodeBrand: any;
  readonly x: number;
  readonly y: number;
}

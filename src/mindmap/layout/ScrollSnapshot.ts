export class ScrollSnapshot {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  __ScrollSnapshotBrand: any;
  readonly x: number;
  readonly y: number;
}

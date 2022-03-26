import { Direction } from "../MindmapConstants";

export class LayoutData {
  constructor() {
    this.visible = true;
  }

  direction: Direction = Direction.CENTER;
  visible: boolean;

  // relative position of the center of the node.
  relativeCenterOffsetX: number = 0;
  relativeCenterOffsetY: number = 0;
}

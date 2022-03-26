import { Direction } from "../MindmapConstants";

export class LayoutData {
  constructor() {
    this.visible = true;
  }

  direction: Direction;
  visible: boolean;

  // relative position of the center of the node.
  offsetX: number;
  offsetY: number;
}

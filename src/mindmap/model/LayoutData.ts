import { Direction } from "../MindmapConstants";

export class LayoutData {
  constructor() {
    this.visible = true;
  }

  direction: Direction;
  visible: boolean;
  offsetX: number;
  offsetY: number;
}

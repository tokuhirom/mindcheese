import { Direction } from "../MindmapConstants";

export class LayoutData {
  direction: Direction = Direction.CENTER;

  // relative position of the center of the node.
  relativeCenterOffsetX = 0;
  relativeCenterOffsetY = 0;
}

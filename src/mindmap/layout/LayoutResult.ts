import { CenterOfNodeOffsetFromRootNode } from "./CenterOfNodeOffsetFromRootNode";
import { MindNode } from "../model/MindNode";
import { Direction } from "../MindmapConstants";
import { Bounds } from "./Bounds";
import { Mind } from "../Mind";
import { RootNodeOffsetFromTopLeftOfMcnodes } from "./RootNodeOffsetFromTopLeftOfMcnodes";

export class LayoutResult {
  private readonly _relativeFromRootMap: Record<
    string,
    CenterOfNodeOffsetFromRootNode
  >;

  constructor(
    relativeFromRootMap: Record<string, CenterOfNodeOffsetFromRootNode>
  ) {
    this._relativeFromRootMap = relativeFromRootMap;
  }

  getCenterOffsetOfTheNodeFromRootNode(
    node: MindNode
  ): CenterOfNodeOffsetFromRootNode {
    return this._relativeFromRootMap[node.id];
  }

  /**
   *                  Child
   *             xxxxx───────
   * ┌──────┐  xxx   ▲
   * │ Root │xxx     │
   * └──────┘        │
   *                 │
   *                 │
   */
  getNodePointIn(node: MindNode): CenterOfNodeOffsetFromRootNode {
    const point = this.getCenterOffsetOfTheNodeFromRootNode(node);
    return new CenterOfNodeOffsetFromRootNode(
      point.x - (node.data.view.elementSizeCache!.width / 2) * node.direction,
      point.y + node.data.view.elementSizeCache!.height / 2
    );
  }

  /**
   *                                    ┌───────┐
   *                                    │ Child │
   *                                 xxx└───────┘
   *                    ┌───────┐  xxx
   *                    │ Child │xxx
   *                xxxx└───────┘▲
   * ┌───────┐   xxxx            │
   * │  Root │xxxx               │
   * └───────┘▲                  │
   *          │                  │
   *          │                  │
   *          │                  │
   *          │                  │
   */
  getNodePointOut(
    node: MindNode,
    destination: MindNode
  ): CenterOfNodeOffsetFromRootNode {
    if (node.isroot) {
      const x =
        (node.data.view.elementSizeCache!.width / 2) * destination.direction;
      return new CenterOfNodeOffsetFromRootNode(
        x,
        -(node.data.view.elementSizeCache!.height / 2)
      );
    } else {
      const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);
      const x =
        offsetPoint.x +
        (node.data.view.elementSizeCache!.width / 2) * node.direction;
      return new CenterOfNodeOffsetFromRootNode(
        x,
        offsetPoint.y + node.data.view.elementSizeCache!.height / 2
      );
    }
  }

  getAdderPosition(
    node: MindNode,
    marginForAdder: number
  ): CenterOfNodeOffsetFromRootNode {
    const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);

    const x =
      offsetPoint.x +
      (node.data.view.elementSizeCache!.width / 2 + marginForAdder) *
        node.direction -
      (node.direction == Direction.RIGHT ? marginForAdder : 0);

    const y =
      offsetPoint.y +
      node.data.view.elementSizeCache!.height / 2 -
      Math.ceil(marginForAdder / 2);

    return new CenterOfNodeOffsetFromRootNode(x, y);
  }

  getTopLeft(
    node: MindNode,
    lineWidth: number
  ): CenterOfNodeOffsetFromRootNode {
    const viewSize = node.data.view.elementSizeCache!;
    const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);
    if (node.isroot) {
      const x = offsetPoint.x + (viewSize.width / 2) * -1;
      const y = offsetPoint.y - viewSize.height - lineWidth;
      return new CenterOfNodeOffsetFromRootNode(x, y);
    } else {
      // XXX To be honest, I think we should think about the **direction**,
      // but it is buggy when used in calculations. A mystery.
      const x = offsetPoint.x + (viewSize.width / 2) * -1;
      const y = offsetPoint.y - viewSize.height / 2 - lineWidth;
      return new CenterOfNodeOffsetFromRootNode(x, y);
    }
  }

  getBounds(mind: Mind): Bounds {
    const nodes = mind.nodes;
    let n = 0;
    let e = 0;
    let w = 0;
    let s = 0;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];

      const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);
      console.log(
        `getMinSize: id=${node.id}, x=${offsetPoint.x}, y=${offsetPoint.y}`
      );
      const viewSize = node.data.view.elementSizeCache!;
      e = Math.max(offsetPoint.x + viewSize.width / 2, e);
      w = Math.min(offsetPoint.x - viewSize.width / 2, w);
      n = Math.min(offsetPoint.y - viewSize.height / 2, n);
      s = Math.max(offsetPoint.y + viewSize.height / 2, s);
    }
    // maximum distance from center of root node.
    console.log(`getMinSize: n=${n}, e=${e}, w=${w}, s=${s}`);
    return new Bounds(n, e, w, s);
  }

  // get the center point offset
  getOffsetOfTheRootNode(mind: Mind): RootNodeOffsetFromTopLeftOfMcnodes {
    const bounds = this.getBounds(mind);
    console.log(`getViewOffset: e=${bounds.e}, w=${bounds.w}`);

    const x = -bounds.w + mind.root!.data.view.elementSizeCache!.width / 2;
    const y = -bounds.n + mind.root!.data.view.elementSizeCache!.height / 2;
    return new RootNodeOffsetFromTopLeftOfMcnodes(x, y);
  }
}

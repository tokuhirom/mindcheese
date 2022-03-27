import { Direction } from "./MindmapConstants";

import MindNode from "./model/MindNode";
import MindCheese from "./MindCheese";
import GraphCanvas from "./GraphCanvas";
import { Size } from "./Size";
import { CenterOfNodeOffsetFromRootNode } from "./LayoutEngine";

export class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  readonly x: number;
  readonly y: number;
}

export class OffsetFromTopLeftOfMcnodes {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  __OffsetFromTopLeftOfMcnodesBrand: any;
  readonly x: number;
  readonly y: number;
}

export class RootNodeOffsetFromTopLeftOfMcnodes extends OffsetFromTopLeftOfMcnodes {
  convertCenterOfNodeOffsetFromRootNode(
    offset: CenterOfNodeOffsetFromRootNode
  ): OffsetFromTopLeftOfMcnodes {
    return new OffsetFromTopLeftOfMcnodes(this.x + offset.x, this.y + offset.y);
  }
}

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

export default class LayoutProvider {
  private readonly mindCheese: MindCheese;
  private readonly hSpace: number;
  private readonly vSpace: number;
  private readonly pSpace: number;
  private readonly graphCanvas: GraphCanvas;

  /**
   * The constructor
   * @param mindCheese MindCheese instance
   * @param hspace horizontal spacing between nodes
   * @param vspace vertical spacing between nodes
   * @param pspace Horizontal spacing between node and connection line (to place node adder)
   * @param graphCanvas
   */
  constructor(
    mindCheese: MindCheese,
    hspace: number,
    vspace: number,
    pspace: number,
    graphCanvas: GraphCanvas
  ) {
    this.hSpace = hspace;
    this.vSpace = vspace;
    this.pSpace = pspace;
    this.mindCheese = mindCheese;
    this.graphCanvas = graphCanvas;
  }

  getTopLeft(node: MindNode): CenterOfNodeOffsetFromRootNode {
    const viewSize = node.data.view.elementSizeCache!;
    const offsetPoint =
      this.mindCheese.getCenterOffsetOfTheNodeFromRootNode(node);
    if (node.isroot) {
      const x = offsetPoint.x + (viewSize.width / 2) * -1;
      const y = offsetPoint.y - viewSize.height - this.graphCanvas.lineWidth;
      return new CenterOfNodeOffsetFromRootNode(x, y);
    } else {
      // XXX To be honest, I think we should think about the **direction**,
      // but it is buggy when used in calculations. A mystery.
      const x = offsetPoint.x + (viewSize.width / 2) * -1;
      const y =
        offsetPoint.y - viewSize.height / 2 - this.graphCanvas.lineWidth;
      return new CenterOfNodeOffsetFromRootNode(x, y);
    }
  }

  /**
   * https://github.com/tokuhirom/mindcheese/blob/main/docs/images/pointin.png?raw=true
   */
  getNodePointIn(node: MindNode): CenterOfNodeOffsetFromRootNode {
    const point = this.mindCheese.getCenterOffsetOfTheNodeFromRootNode(node);
    return new CenterOfNodeOffsetFromRootNode(
      point.x - (node.data.view.elementSizeCache!.width / 2) * node.direction,
      point.y + node.data.view.elementSizeCache!.height / 2
    );
  }

  /**
   * https://github.com/tokuhirom/mindcheese/blob/main/docs/images/pointout.png?raw=true
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
      const offsetPoint =
        this.mindCheese.getCenterOffsetOfTheNodeFromRootNode(node);
      const x =
        offsetPoint.x +
        (node.data.view.elementSizeCache!.width / 2) * node.direction;
      return new CenterOfNodeOffsetFromRootNode(
        x,
        offsetPoint.y + node.data.view.elementSizeCache!.height / 2
      );
    }
  }

  getAdderPoint(node: MindNode): CenterOfNodeOffsetFromRootNode {
    const offsetPoint =
      this.mindCheese.getCenterOffsetOfTheNodeFromRootNode(node);

    const x =
      offsetPoint.x +
      (node.data.view.elementSizeCache!.width / 2 + this.pSpace) *
        node.direction -
      (node.direction == Direction.RIGHT ? this.pSpace : 0);

    const y =
      offsetPoint.y +
      node.data.view.elementSizeCache!.height / 2 -
      Math.ceil(this.pSpace / 2);

    return new CenterOfNodeOffsetFromRootNode(x, y);
  }

  getBounds(): Bounds {
    const nodes = this.mindCheese.mind.nodes;
    let n = 0;
    let e = 0;
    let w = 0;
    let s = 0;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];

      const offsetPoint =
        this.mindCheese.getCenterOffsetOfTheNodeFromRootNode(node);
      console.log(
        `getMinSize: id=${node.id}, x=${offsetPoint.x}, y=${offsetPoint.y}`
      );
      const viewSize = node.data.view.elementSizeCache!;
      e = Math.max(offsetPoint.x + viewSize.width / 2 + this.hSpace, e);
      w = Math.min(offsetPoint.x - viewSize.width / 2 - this.hSpace, w);
      n = Math.min(offsetPoint.y - viewSize.height / 2 - this.vSpace, n);
      s = Math.max(offsetPoint.y + viewSize.height / 2 - this.vSpace, s);
    }
    // maximum distance from center of root node.
    console.log(`getMinSize: n=${n}, e=${e}, w=${w}, s=${s}`);
    return new Bounds(n, e, w, s);
  }
}

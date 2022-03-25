import {Direction} from "./MindmapConstants";

import MindNode from "./model/MindNode";
import MindCheese from "./MindCheese";
import GraphCanvas from "./GraphCanvas";
import {Size} from "./Size";

export class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  readonly x: number;
  readonly y: number;
}

export class Bounds {
  constructor(n: number, e: number, w: number, s: number) {
    this.n = n;
    this.e = e;
    this.w = w;
    this.s = s;
  }

  size(): Size {
    return new Size(this.e + this.w * -1, this.s + this.n * -1);
  }

  readonly n: number;
  readonly e: number;
  readonly w: number;
  readonly s: number;
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
   * @param pspace Horizontal spacing between node and connection line (to place node expander)
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

  reset(): void {
    console.debug("layout.reset");
  }

  layout(): void {
    const rootNode = this.mindCheese.mind.root;
    rootNode.data.layout.offsetX = 0;
    rootNode.data.layout.offsetY = 0;

    this.layoutOffsetSubNodes(
      rootNode.children.filter((it) => it.direction == Direction.LEFT)
    );
    this.layoutOffsetSubNodes(
      rootNode.children.filter((it) => it.direction == Direction.RIGHT)
    );
  }

  // layout both the x and y axis
  private layoutOffsetSubNodes(nodes: MindNode[]): number {
    if (nodes.length == 0) {
      return 0;
    }

    let totalHeight = 0;
    {
      let baseY = 0;
      for (let i = 0, l = nodes.length; i < l; i++) {
        const node = nodes[i];
        const layoutData = node.data.layout;

        const childrenHeight = this.layoutOffsetSubNodes(node.children);
        const nodeOuterHeight = Math.max(
          node.data.view.height,
          node.expanded ? childrenHeight : 0
        );
        layoutData.offsetY = baseY + nodeOuterHeight / 2;
        layoutData.offsetX =
          this.hSpace * node.direction +
          (node.parent.data.view.width * (node.parent.direction + node.direction)) / 2;
        if (!node.parent.isroot) {
          layoutData.offsetX += this.pSpace * node.direction;
        }

        baseY +=
          nodeOuterHeight +
          (node.expanded ? childrenHeight / 2 : 0) +
          this.vSpace;
        totalHeight +=
          nodeOuterHeight + (node.expanded ? childrenHeight / 2 : 0);
      }
    }

    if (nodes.length > 1) {
      totalHeight += this.vSpace * (nodes.length - 1);
    }

    {
      const middleHeight = totalHeight / 2;
      for (let i = 0, l = nodes.length; i < l; i++) {
        nodes[i].data.layout.offsetY -= middleHeight;
      }
    }

    return totalHeight;
  }

  getNodeOffset(node: MindNode): Point {
    const layoutData = node.data.layout;

    let x = layoutData.offsetX;
    let y = layoutData.offsetY;
    if (!node.isroot) {
      const offsetPoint = this.getNodeOffset(node.parent);
      x += offsetPoint.x;
      y += offsetPoint.y;
    }
    y += node.isroot ? 0 : node.data.view.height / 2;
    console.log(`getNodeOffset: node=${node.id} x=${x} y=${y}`);

    return new Point(x, y);
  }

  getNodePoint(node: MindNode): Point {
    const viewData = node.data.view;
    const offsetPoint = this.getNodeOffset(node);
    const x = offsetPoint.x + (viewData.width * (node.direction - 1)) / 2;
    // ↓ Destination of the line.
    if (node.id == "other4") {
      console.log(
        `NNN ${node.id} offsetPoint.y=${offsetPoint.y} viewData.height=${viewData.height} this.graphCanvas.lineWidth=${this.graphCanvas.lineWidth}`
      );
    }
    const y = offsetPoint.y - viewData.height - this.graphCanvas.lineWidth;
    return new Point(x, y);
  }

  /**
   * https://github.com/tokuhirom/mindcheese/blob/main/docs/images/pointin.png?raw=true
   */
  getNodePointIn(node: MindNode): Point {
    return this.getNodeOffset(node);
  }

  // x is outer side.
  // y is bottom.
  /*
   * ┌────────┐                       ┌──────────┐
   * │        │                       │          │
   * └────────┘xxx                  xx└──────────┘
   *           ▲ xx               xxx▲
   *           │  xxx  ┌────────┐ x  │
   *           │    xxx│  Root  │xx  │
   *           │       └────────┘    │
   *           │                     │
   *           │                     │
   *                                 │
   */
  getNodePointOut(node: MindNode): Point {
    if (node.isroot) {
      return new Point(0, 0);
    } else {
      // at left side, west edge.
      // at right side, east edge.
      // bottom of the rectangle.
      const offsetPoint = this.getNodeOffset(node);
      const x =
        offsetPoint.x + (node.data.view.width + this.pSpace) * node.direction;
      if (isNaN(x)) {
        console.debug(
          `getNodePointOut: x=${x} offsetPoint.x=${offsetPoint.x} node.data.view.width=${node.data.view.width} thhis.pSpace=${this.pSpace} node.direction=${node.direction}`
        );
      }
      return new Point(x, offsetPoint.y);
    }
  }

  /**
   * https://github.com/tokuhirom/mindcheese/blob/main/docs/images/pointout.png?raw=true
   */
  getNodePointOutWithDestination(node: MindNode, destination: MindNode): Point {
    if (node.isroot) {
      const x = (node.data.view.width / 2) * destination.direction;
      return new Point(x, -(node.data.view.height / 2));
    } else {
      const offsetPoint = this.getNodeOffset(node);
      const x =
        offsetPoint.x + (node.data.view.width + this.pSpace) * node.direction;
      return new Point(x, offsetPoint.y);
    }
  }

  getExpanderPoint(node: MindNode): Point {
    const p = this.getNodePointOut(node);
    const x = node.direction == Direction.RIGHT ? p.x - this.pSpace : p.x;
    const y = p.y - Math.ceil(this.pSpace / 2);
    return new Point(x, y);
  }

  getBounds(): Bounds {
    const nodes = this.mindCheese.mind.nodes;
    let n = 0;
    let e = 0;
    let w = 0;
    let s = 0;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      if (node.data.layout.visible) {
        const pout = this.getNodePointOut(node);
        console.log(`getMinSize: id=${node.id}, x=${pout.x}, y=${pout.y}`);
        e = Math.max(pout.x, e);
        w = Math.min(pout.x, w);
        if (!node.isroot) {
          // pout.y is bottom of the node.
          n = Math.min(pout.y - node.data.view.height, n);
          s = Math.max(pout.y + node.data.view.height, s);
        }
      }
    }
    console.log(`getMinSize: n=${n}, e=${e}, w=${w}, s=${s}`);
    return new Bounds(n, e, w, s);
  }

  toggleNode(node: MindNode): void {
    if (node.isroot) {
      return;
    }

    node.expanded = !node.expanded;
  }

  setVisibleRecursively(node: MindNode, visible: boolean) {
    node.data.layout.visible = visible;
    for (let i = 0, l = node.children.length; i < l; i++) {
      if (!visible) {
        this.setVisibleRecursively(node.children[i], false);
      } else {
        this.setVisibleRecursively(node.children[i], node.expanded);
      }
    }
  }
}

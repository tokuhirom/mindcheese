import { Direction } from "./MindmapConstants";

import MindNode from "./model/MindNode";
import MindCheese from "./MindCheese";
import GraphCanvas from "./GraphCanvas";
import { Size } from "./Size";

export class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  readonly x: number;
  readonly y: number;
}

export default class LayoutProvider {
  private readonly mindCheese: MindCheese;
  bounds: { n: number; s: number; w: number; e: number };
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
    this.bounds = null;
  }

  reset(): void {
    console.debug("layout.reset");
    this.bounds = { n: 0, s: 0, w: 0, e: 0 };
  }

  layout(): void {
    console.debug("layout.layout");
    this.mindCheese.mind.root.direction = Direction.CENTER;
    this.layoutOffset();
  }

  layoutOffset(): void {
    const rootNode = this.mindCheese.mind.root;

    rootNode.data.layout.offsetX = 0;
    rootNode.data.layout.offsetY = 0;

    const outerHeightLeft = this.layoutOffsetSubNodes(
      rootNode.children.filter((it) => it.direction == Direction.LEFT)
    );
    const outerHeightRight = this.layoutOffsetSubNodes(
      rootNode.children.filter((it) => it.direction == Direction.RIGHT)
    );

    console.debug(
      `layoutOffset: rootNode.data.view.width=${rootNode.data.view.width} outerHeightLeft=${outerHeightLeft} outerHeightRight=${outerHeightRight}`
    );
    this.bounds.e = rootNode.data.view.width / 2;
    this.bounds.w = 0 - this.bounds.e;
    this.bounds.n = 0;
    this.bounds.s = Math.max(outerHeightLeft, outerHeightRight);
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
        if (!node.expanded) {
          // TODO split the non-related tasks.
          this.setVisible(node.children, false);
        }
        layoutData.offsetY = baseY + nodeOuterHeight / 2;
        layoutData.offsetX =
          this.hSpace * node.direction +
          (node.parent.data.view.width *
            (node.parent.direction + node.direction)) /
            2;
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
    if (isNaN(layoutData.offsetX)) {
      console.log(`getNodeOffset: node=${node.topic} x=${layoutData.offsetX}`);
    }

    return new Point(x, y + (node.isroot ? 0 : node.data.view.height / 2));
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

  getNodePointOut(node: MindNode): Point {
    if (node.isroot) {
      return new Point(0, 0);
    } else {
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
    let x: number;
    if (node.direction == Direction.RIGHT) {
      x = p.x - this.pSpace;
    } else {
      x = p.x;
    }
    const y = p.y - Math.ceil(this.pSpace / 2);
    return new Point(x, y);
  }

  getMinSize(): Size {
    const nodes = this.mindCheese.mind.nodes;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      const pout = this.getNodePointOut(node);
      console.debug(`getMinSize: pout.x=${pout.x}`);
      this.bounds.e = Math.max(pout.x, this.bounds.e);
      this.bounds.w = Math.min(pout.x, this.bounds.w);
    }
    return new Size(
      this.bounds.e - this.bounds.w,
      this.bounds.s - this.bounds.n
    );
  }

  toggleNode(node: MindNode): void {
    if (node.isroot) {
      return;
    }

    node.expanded = !node.expanded;
    this.layout();
    this.setVisible(node.children, node.expanded);
  }

  setVisible(nodes: MindNode[], visible: boolean): void {
    for (let i = 0, l = nodes.length; i < l; i++) {
      const node = nodes[i];
      if (node.expanded) {
        this.setVisible(node.children, visible);
      } else {
        this.setVisible(node.children, false);
      }
      if (!node.isroot) {
        node.data.layout.visible = visible;
      }
    }
  }
}

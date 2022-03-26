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

export class CenterOfNodeOffsetFromParentNode {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // https://ageek.dev/ts-nominal-typing
  __CenterOfNodeOffsetFromParentNodeBrand: any;
  readonly x: number;
  readonly y: number;
}

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
  convertCenterOfNodeOffsetFromRootNode(offset: CenterOfNodeOffsetFromRootNode): OffsetFromTopLeftOfMcnodes {
    return new OffsetFromTopLeftOfMcnodes(
      this.x + offset.x,
      this.y + offset.y
    );
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
    const rootNode = this.mindCheese.mind.root!;
    rootNode.data.layout.relativeCenterOffsetX = 0;
    rootNode.data.layout.relativeCenterOffsetY = 0;

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
        layoutData.relativeCenterOffsetY = baseY + nodeOuterHeight / 2;
        layoutData.relativeCenterOffsetX =
          this.hSpace * node.direction
          + (node.parent!.data.view.width / 2 * node.direction)
          + this.hSpace * node.direction
          + (node.data.view.width / 2 * node.direction)
          + (node.parent?.isroot ? 0 : this.pSpace * node.direction);

        baseY += nodeOuterHeight + this.vSpace;
        totalHeight += nodeOuterHeight;
      }
    }

    if (nodes.length > 1) {
      totalHeight += this.vSpace * (nodes.length - 1);
    }

    {
      const middleHeight = totalHeight / 2;
      for (let i = 0, l = nodes.length; i < l; i++) {
        nodes[i].data.layout.relativeCenterOffsetY -= middleHeight;
      }
    }

    return totalHeight;
  }

  getCenterOffsetOfTheNodeFromRootNode(
    node: MindNode
  ): CenterOfNodeOffsetFromRootNode {
    const layoutData = node.data.layout;

    let x = layoutData.relativeCenterOffsetX;
    let y = layoutData.relativeCenterOffsetY;
    if (!node.isroot) {
      const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(
        node.parent!
      );
      x += offsetPoint.x;
      y += offsetPoint.y;
    }

    return new CenterOfNodeOffsetFromRootNode(x, y);
  }

  getNodePoint(node: MindNode): CenterOfNodeOffsetFromRootNode {
    const viewData = node.data.view;
    const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);
    const x = offsetPoint.x + (viewData.width * (node.direction - 1)) / 2;
    const y = offsetPoint.y - viewData.height - this.graphCanvas.lineWidth;
    return new CenterOfNodeOffsetFromRootNode(x, y);
  }

  /**
   * https://github.com/tokuhirom/mindcheese/blob/main/docs/images/pointin.png?raw=true
   */
  getNodePointIn(node: MindNode): Point {
    const point = this.getCenterOffsetOfTheNodeFromRootNode(node);
    return new Point(point.x, point.y + node.data.view.height / 2);
  }

  /**
   * https://github.com/tokuhirom/mindcheese/blob/main/docs/images/pointout.png?raw=true
   */
  getNodePointOutWithDestination(node: MindNode, destination: MindNode): Point {
    if (node.isroot) {
      const x = (node.data.view.width / 2) * destination.direction;
      return new Point(x, -(node.data.view.height / 2));
    } else {
      const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);
      const x =
        offsetPoint.x + (node.data.view.width + this.pSpace) * node.direction;
      return new Point(x, offsetPoint.y);
    }
  }

  getExpanderPoint(node: MindNode): Point {
    const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);

    let x =
      offsetPoint.x + (node.data.view.width + this.pSpace) * node.direction;
    if (node.direction == Direction.RIGHT) {
      x -= this.pSpace;
    }

    const y =
      offsetPoint.y + node.data.view.height / 2 - Math.ceil(this.pSpace / 2);

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
        const offsetPoint = this.getCenterOffsetOfTheNodeFromRootNode(node);
        console.log(
          `getMinSize: id=${node.id}, x=${offsetPoint.x}, y=${offsetPoint.y}`
        );
        e = Math.max(offsetPoint.x + node.data.view.width / 2 + this.hSpace, e);
        w = Math.min(offsetPoint.x - node.data.view.width / 2 - this.hSpace, w);
        n = Math.min(offsetPoint.y - node.data.view.height / 2 - this.vSpace, n);
        s = Math.max(offsetPoint.y + node.data.view.height / 2 - this.vSpace, s);
      }
    }
    // maximum distance from center of root node.
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

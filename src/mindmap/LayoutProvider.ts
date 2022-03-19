// noinspection JSUnfilteredForInLoop

import { Direction } from "./MindmapConstants";

import MindNode from "./MindNode";
import MindCheese from "./MindCheese";

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

  constructor(mindCheese: MindCheese, hspace = 30, vspace = 20, pspace = 13) {
    this.hSpace = hspace;
    this.vSpace = vspace;
    this.pSpace = pspace;
    this.mindCheese = mindCheese;
    this.bounds = null;
  }

  init(): void {
    // TODO remove this
    console.debug("layout.init");
  }

  reset(): void {
    console.debug("layout.reset");
    this.bounds = { n: 0, s: 0, w: 0, e: 0 };
  }

  layout(): void {
    console.debug("layout.layout");
    this.layoutDirection();
    this.layoutOffset();
  }

  layoutDirection(): void {
    this.layoutDirectionRoot();
  }

  private layoutDirectionRoot(): void {
    const node = this.mindCheese.mind.root;

    // console.debug(node);
    const layoutData = node.data.layout;
    const children = node.children;
    const childrenCount = children.length;
    layoutData.direction = Direction.CENTER;

    let i = childrenCount;
    let subnode = null;
    while (i--) {
      subnode = children[i];
      if (subnode.direction == Direction.LEFT) {
        this.layoutDirectionSide(subnode, Direction.LEFT);
      } else {
        this.layoutDirectionSide(subnode, Direction.RIGHT);
      }
    }
  }

  private layoutDirectionSide(node: MindNode, direction: Direction): void {
    const layoutData = node.data.layout;
    const children = node.children;
    const childrenCount = children.length;

    layoutData.direction = direction;
    let i = childrenCount;
    while (i--) {
      this.layoutDirectionSide(children[i], direction);
    }
  }

  layoutOffset(): void {
    const node = this.mindCheese.mind.root;
    const layoutData = node.data.layout;
    layoutData.offsetX = 0;
    layoutData.offsetY = 0;
    layoutData.outerHeight = 0;
    const children = node.children;
    let i = children.length;
    const leftNodes = [];
    const rightNodes = [];
    let subnode = null;
    while (i--) {
      subnode = children[i];
      if (subnode.data.layout.direction == Direction.RIGHT) {
        rightNodes.unshift(subnode);
      } else {
        leftNodes.unshift(subnode);
      }
    }
    layoutData.leftNodes = leftNodes;
    layoutData.rightNodes = rightNodes;
    layoutData.outerHeightLeft = this.layoutOffsetSubNodes(leftNodes);
    layoutData.outerHeightRight = this.layoutOffsetSubNodes(rightNodes);
    this.bounds.e = node.data.view.width / 2;
    this.bounds.w = 0 - this.bounds.e;
    //console.debug(this.bounds.w);
    this.bounds.n = 0;
    this.bounds.s = Math.max(
      layoutData.outerHeightLeft,
      layoutData.outerHeightRight
    );
  }

  // layout both the x and y axis
  private layoutOffsetSubNodes(nodes: MindNode[]): number {
    let totalHeight = 0;
    const nodesCount = nodes.length;
    let i = nodesCount;
    let node = null;
    let nodeOuterHeight = 0;
    let layoutData = null;
    let baseY = 0;
    let pd = null; // parent._data
    while (i--) {
      node = nodes[i];
      layoutData = node.data.layout;
      if (pd == null) {
        pd = node.parent.data;
        if (pd == null) {
          throw new Error("Cannot get parent's data");
        }
      }

      nodeOuterHeight = this.layoutOffsetSubNodes(node.children);
      if (!node.expanded) {
        nodeOuterHeight = 0;
        this.setVisible(node.children, false);
      }
      nodeOuterHeight = Math.max(node.data.view.height, nodeOuterHeight);

      layoutData.outerHeight = nodeOuterHeight;
      layoutData.offsetY = baseY - nodeOuterHeight / 2;
      layoutData.offsetX =
        this.hSpace * layoutData.direction +
        (pd.view.width * (pd.layout.direction + layoutData.direction)) / 2;
      if (!node.parent.isroot) {
        layoutData.offsetX += this.pSpace * layoutData.direction;
      }

      baseY = baseY - nodeOuterHeight - this.vSpace;
      totalHeight += nodeOuterHeight;
    }
    if (nodesCount > 1) {
      totalHeight += this.vSpace * (nodesCount - 1);
    }
    i = nodesCount;
    const middleHeight = totalHeight / 2;
    while (i--) {
      node = nodes[i];
      node.data.layout.offsetY += middleHeight;
    }
    return totalHeight;
  }

  // layout the y axis only, for collapse/expand a node
  private layoutOffsetSubNodesHeight(nodes: MindNode[]): number {
    let totalHeight = 0;
    const nodesCount = nodes.length;
    let i = nodesCount;
    let node = null;
    let nodeOuterHeight = 0;
    let layoutData = null;
    let baseY = 0;
    let pd = null; // parent._data
    while (i--) {
      node = nodes[i];
      layoutData = node.data.layout;
      if (pd == null) {
        pd = node.parent.data;
      }

      nodeOuterHeight = this.layoutOffsetSubNodesHeight(node.children);
      if (!node.expanded) {
        nodeOuterHeight = 0;
      }
      nodeOuterHeight = Math.max(node.data.view.height, nodeOuterHeight);

      layoutData.outerHeight = nodeOuterHeight;
      layoutData.offsetY = baseY - nodeOuterHeight / 2;
      baseY = baseY - nodeOuterHeight - this.vSpace;
      totalHeight += nodeOuterHeight;
    }
    if (nodesCount > 1) {
      totalHeight += this.vSpace * (nodesCount - 1);
    }
    i = nodesCount;
    const middleHeight = totalHeight / 2;
    while (i--) {
      node = nodes[i];
      node.data.layout.offsetY += middleHeight;
      //console.debug(node.topic);
      //console.debug(node._data.layout.offset_y);
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

    return new Point(x, y);
  }

  getNodePoint(node: MindNode): Point {
    const viewData = node.data.view;
    const offsetPoint = this.getNodeOffset(node);
    const x =
      offsetPoint.x + (viewData.width * (node.data.layout.direction - 1)) / 2;
    const y = offsetPoint.y - viewData.height / 2;
    return new Point(x, y);
  }

  getNodePointIn(node: MindNode): Point {
    return this.getNodeOffset(node);
  }

  getNodePointOut(node: MindNode): Point {
    if (node.isroot) {
      return new Point(0, 0);
    } else {
      const offsetPoint = this.getNodeOffset(node);
      const x =
        offsetPoint.x +
        (node.data.view.width + this.pSpace) * node.data.layout.direction;
      return new Point(x, offsetPoint.y);
    }
  }

  getExpanderPoint(node: MindNode): Point {
    const p = this.getNodePointOut(node);
    let x: number;
    if (node.data.layout.direction == Direction.RIGHT) {
      x = p.x - this.pSpace;
    } else {
      x = p.x;
    }
    const y = p.y - Math.ceil(this.pSpace / 2);
    return new Point(x, y);
  }

  getMinSize(): { w: number; h: number } {
    const nodes = this.mindCheese.mind.nodes;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      const pout = this.getNodePointOut(node);
      // e = Math.max(x, e)
      if (pout.x > this.bounds.e) {
        this.bounds.e = pout.x;
      }
      // w = Math.min(x, w)
      if (pout.x < this.bounds.w) {
        this.bounds.w = pout.x;
      }
    }
    return {
      w: this.bounds.e - this.bounds.w,
      h: this.bounds.s - this.bounds.n,
    };
  }

  toggleNode(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    if (node.expanded) {
      this.collapseNode(node);
    } else {
      this.expandNode(node);
    }
  }

  expandNode(node: MindNode): void {
    node.expanded = true;
    this.partLayout(node);
    this.setVisible(node.children, true);
  }

  collapseNode(node: MindNode): void {
    node.expanded = false;
    this.partLayout(node);
    this.setVisible(node.children, false);
  }

  expandAll(): void {
    const nodes = this.mindCheese.mind.nodes;
    let c = 0;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      if (!node.expanded) {
        node.expanded = true;
        c++;
      }
    }
    if (c > 0) {
      const root = this.mindCheese.mind.root;
      this.partLayout(root);
      this.setVisible(root.children, true);
    }
  }

  collapseAll(): void {
    const nodes = this.mindCheese.mind.nodes;
    let c = 0;
    let node;
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      if (node.expanded && !node.isroot) {
        node.expanded = false;
        c++;
      }
    }
    if (c > 0) {
      const root = this.mindCheese.mind.root;
      this.partLayout(root);
      this.setVisible(root.children, true);
    }
  }

  expandToDepth(
    targetDepth: number,
    currNodes: MindNode[],
    currDepth: number
  ): void {
    if (targetDepth < 1) {
      return;
    }
    const nodes = currNodes || this.mindCheese.mind.root.children;
    const depth = currDepth || 1;
    let i = nodes.length;
    let node = null;
    while (i--) {
      node = nodes[i];
      if (depth < targetDepth) {
        if (!node.expanded) {
          this.expandNode(node);
        }
        this.expandToDepth(targetDepth, node.children, depth + 1);
      }
      if (depth == targetDepth) {
        if (node.expanded) {
          this.collapseNode(node);
        }
      }
    }
  }

  partLayout(node: MindNode): void {
    const root = this.mindCheese.mind.root;
    if (root) {
      const rootLayoutData = root.data.layout;
      if (node.isroot) {
        rootLayoutData.outerHeightRight = this.layoutOffsetSubNodesHeight(
          rootLayoutData.rightNodes
        );
        rootLayoutData.outerHeightLeft = this.layoutOffsetSubNodesHeight(
          rootLayoutData.leftNodes
        );
      } else {
        if (node.data.layout.direction == Direction.RIGHT) {
          rootLayoutData.outerHeightRight = this.layoutOffsetSubNodesHeight(
            rootLayoutData.rightNodes
          );
        } else {
          rootLayoutData.outerHeightLeft = this.layoutOffsetSubNodesHeight(
            rootLayoutData.leftNodes
          );
        }
      }
      this.bounds.s = Math.max(
        rootLayoutData.outerHeightLeft,
        rootLayoutData.outerHeightRight
      );
    } else {
      console.warn("can not found root node");
    }
  }

  setVisible(nodes: MindNode[], visible: boolean): void {
    let i = nodes.length;
    let node = null;
    while (i--) {
      node = nodes[i];
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
